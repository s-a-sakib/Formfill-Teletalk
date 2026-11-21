importScripts('security.js');

const VAULT_STORAGE_KEY = 'formfillVault';
const SECURITY_SETTINGS_KEY = 'formfillSecurity';
const ENABLED_KEY = 'autofillEnabled';

// Legacy keys for backward compatibility / migration
const PROFILE_KEY = 'formfillProfile';
const PROFILES_LIST_KEY = 'profiles';
const ACTIVE_PROFILE_KEY = 'activeProfileId';

/* ---------------- Security Settings & State Helpers ---------------- */

async function getSecuritySettings() {
  const data = await chrome.storage.local.get(SECURITY_SETTINGS_KEY);
  return {
    ...SECURITY_DEFAULTS.DEFAULT_SETTINGS,
    ...(data[SECURITY_SETTINGS_KEY] || {})
  };
}

async function saveSecuritySettings(settings) {
  const merged = {
    ...SECURITY_DEFAULTS.DEFAULT_SETTINGS,
    ...settings
  };
  await chrome.storage.local.set({ [SECURITY_SETTINGS_KEY]: merged });
  broadcastStateChange({ type: 'security-settings-changed', settings: merged });
  return merged;
}

async function getSessionState() {
  return await chrome.storage.session.get([
    'isUnlocked',
    'sessionKey',
    'unlockedProfiles',
    'activeProfileId',
    'lastActivity'
  ]);
}

async function touchActivity() {
  await chrome.storage.session.set({ lastActivity: Date.now() });
}

async function lockVault() {
  await chrome.storage.session.remove([
    'isUnlocked',
    'sessionKey',
    'unlockedProfiles',
    'activeProfileId',
    'lastActivity'
  ]);
  broadcastStateChange({ type: 'vault-locked' });
}

async function unlockVault(password) {
  const local = await chrome.storage.local.get([VAULT_STORAGE_KEY, SECURITY_SETTINGS_KEY]);
  const vault = local[VAULT_STORAGE_KEY];
  if (!vault) {
    throw new Error('Vault is not set up yet.');
  }

  const { data, key } = await SecurityCrypto.decryptPayload(vault, password);
  const rawKeyBase64 = await SecurityCrypto.exportRawKey(key);

  const profiles = data.profiles || [];
  let activeId = data.activeProfileId || (profiles[0] ? profiles[0].id : null);

  await chrome.storage.session.set({
    isUnlocked: true,
    sessionKey: rawKeyBase64,
    unlockedProfiles: profiles,
    activeProfileId: activeId,
    lastActivity: Date.now()
  });

  broadcastStateChange({ type: 'vault-unlocked', activeProfileId: activeId });
  return { ok: true, activeProfileId: activeId, profilesCount: profiles.length };
}

async function persistUnlockedProfiles(profiles, activeProfileId) {
  const settings = await getSecuritySettings();
  const session = await getSessionState();

  if (settings.isVaultConfigured) {
    if (!session.sessionKey) {
      throw new Error('Vault is locked. Cannot save changes.');
    }
    const local = await chrome.storage.local.get(VAULT_STORAGE_KEY);
    const existingVault = local[VAULT_STORAGE_KEY] || {};
    const key = await SecurityCrypto.importRawKey(session.sessionKey);
    const { vault: newVault } = await SecurityCrypto.encryptPayload(
      { profiles, activeProfileId },
      key
    );
    newVault.salt = existingVault.salt;
    newVault.iterations = existingVault.iterations || 100000;

    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: newVault });
  } else {
    // Unsecured fallback
    const activeProf = profiles.find(p => p.id === activeProfileId) || profiles[0] || {};
    await chrome.storage.local.set({
      [PROFILES_LIST_KEY]: profiles,
      [ACTIVE_PROFILE_KEY]: activeProfileId,
      [PROFILE_KEY]: activeProf
    });
  }

  await chrome.storage.session.set({
    unlockedProfiles: profiles,
    activeProfileId,
    lastActivity: Date.now()
  });

  broadcastStateChange({ type: 'profiles-updated', activeProfileId });
}

async function setupMasterPassword(password) {
  const local = await chrome.storage.local.get([
    PROFILES_LIST_KEY,
    ACTIVE_PROFILE_KEY,
    PROFILE_KEY,
    SECURITY_SETTINGS_KEY
  ]);
  const session = await getSessionState();

  let profiles = session.unlockedProfiles || local[PROFILES_LIST_KEY];
  let activeId = session.activeProfileId || local[ACTIVE_PROFILE_KEY];
  const legacyProfile = local[PROFILE_KEY] || {};

  if (!Array.isArray(profiles) || profiles.length === 0) {
    const defaultId = 'prof_' + Date.now();
    profiles = [{ id: defaultId, name: legacyProfile.applicantName || 'Person 1', ...legacyProfile }];
    activeId = defaultId;
  }

  const { vault, key } = await SecurityCrypto.encryptPayload(
    { profiles, activeProfileId: activeId },
    password
  );
  const rawKeyBase64 = await SecurityCrypto.exportRawKey(key);

  const settings = await getSecuritySettings();
  settings.isVaultConfigured = true;

  // Save encrypted vault and updated settings
  await chrome.storage.local.set({
    [VAULT_STORAGE_KEY]: vault,
    [SECURITY_SETTINGS_KEY]: settings
  });

  // Securely delete plaintext profiles from storage on disk
  await chrome.storage.local.remove([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY, PROFILE_KEY]);

  // Keep unlocked in RAM session
  await chrome.storage.session.set({
    isUnlocked: true,
    sessionKey: rawKeyBase64,
    unlockedProfiles: profiles,
    activeProfileId: activeId,
    lastActivity: Date.now()
  });

  broadcastStateChange({ type: 'vault-unlocked', activeProfileId: activeId });
  return { ok: true };
}

async function changeMasterPassword(oldPassword, newPassword) {
  const local = await chrome.storage.local.get(VAULT_STORAGE_KEY);
  const vault = local[VAULT_STORAGE_KEY];
  if (!vault) throw new Error('No vault configured');

  // Verify old password
  const { data } = await SecurityCrypto.decryptPayload(vault, oldPassword);

  // Encrypt with new password
  const { vault: newVault, key } = await SecurityCrypto.encryptPayload(data, newPassword);
  const rawKeyBase64 = await SecurityCrypto.exportRawKey(key);

  await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: newVault });
  await chrome.storage.session.set({
    isUnlocked: true,
    sessionKey: rawKeyBase64,
    unlockedProfiles: data.profiles || [],
    activeProfileId: data.activeProfileId,
    lastActivity: Date.now()
  });

  return { ok: true };
}

async function resetVault() {
  await chrome.storage.local.remove([
    VAULT_STORAGE_KEY,
    PROFILES_LIST_KEY,
    ACTIVE_PROFILE_KEY,
    PROFILE_KEY
  ]);
  await chrome.storage.session.clear();
  const settings = await getSecuritySettings();
  settings.isVaultConfigured = false;
  await chrome.storage.local.set({ [SECURITY_SETTINGS_KEY]: settings });

  // Initialize fresh clean default profile
  await ensureProfilesInitialized();
  broadcastStateChange({ type: 'vault-reset' });
  return { ok: true };
}

async function broadcastStateChange(msg) {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, msg).catch(() => {});
      }
    }
  } catch (_) {}
}

/* ---------------- Initialization ---------------- */

async function ensureProfilesInitialized() {
  const settings = await getSecuritySettings();
  if (settings.isVaultConfigured) {
    // Vault is password protected. Session starts locked on cold start.
    return;
  }

  // Legacy or unencrypted mode: ensure at least one profile exists
  const state = await chrome.storage.local.get([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY, PROFILE_KEY, ENABLED_KEY]);
  let profiles = state[PROFILES_LIST_KEY];
  let activeId = state[ACTIVE_PROFILE_KEY];
  const legacyProfile = state[PROFILE_KEY] || {};

  if (!Array.isArray(profiles) || profiles.length === 0) {
    const defaultId = 'prof_' + Date.now();
    const defaultName = legacyProfile.applicantName || 'Person 1';
    const initialProfile = {
      id: defaultId,
      name: defaultName,
      ...legacyProfile
    };
    profiles = [initialProfile];
    activeId = defaultId;
    await chrome.storage.local.set({
      [PROFILES_LIST_KEY]: profiles,
      [ACTIVE_PROFILE_KEY]: activeId,
      [PROFILE_KEY]: initialProfile
    });
  } else if (!activeId || !profiles.some(p => p.id === activeId)) {
    activeId = profiles[0].id;
    await chrome.storage.local.set({
      [ACTIVE_PROFILE_KEY]: activeId,
      [PROFILE_KEY]: profiles[0]
    });
  }

  if (state[ENABLED_KEY] === undefined) {
    await chrome.storage.local.set({ [ENABLED_KEY]: false });
  }
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await ensureProfilesInitialized();
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html?welcome=1') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  // Vault starts locked on browser startup
  await lockVault();
  await ensureProfilesInitialized();
});

// Setup auto-lock alarm
chrome.alarms.create('security-auto-lock-check', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name !== 'security-auto-lock-check') return;
  const settings = await getSecuritySettings();
  if (!settings.isVaultConfigured || !settings.autoLockMinutes || settings.autoLockMinutes <= 0) return;

  const session = await getSessionState();
  if (session.isUnlocked && session.lastActivity) {
    const elapsedMinutes = (Date.now() - session.lastActivity) / (60 * 1000);
    if (elapsedMinutes >= settings.autoLockMinutes) {
      await lockVault();
    }
  }
});

/* ---------------- Content Script Injection ---------------- */

async function injectIfEnabled(tabId, url) {
  if (!url || !/^https?:/.test(url)) return;
  const state = await chrome.storage.local.get(ENABLED_KEY);
  if (!state[ENABLED_KEY]) return;

  const settings = await getSecuritySettings();
  const hostname = SecurityGuards.extractHostname(url);
  if (settings.trustedDomainsOnly && !SecurityGuards.isDomainTrusted(hostname, settings.trustedDomains)) {
    // Untrusted domain - do not inject content script to prevent form/autofill jacking
    return;
  }

  try {
    const permitted = await chrome.permissions.contains({ origins: [new URL(url).origin + '/*'] });
    if (permitted) {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['security.js', 'content.js'] });
    }
  } catch (_) { /* restricted browser pages cannot be scripted */ }
}

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === 'complete') injectIfEnabled(tabId, tab.url);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    injectIfEnabled(tabId, tab.url);
  } catch (_) {}
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local') return;
  if (changes[ENABLED_KEY]?.newValue) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) if (tab.id) injectIfEnabled(tab.id, tab.url);
  }
});

/* ---------------- Message Routing & Security Dispatcher ---------------- */

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return;

  // 1. Get Vault Status
  if (message.type === 'get-vault-status') {
    (async () => {
      const settings = await getSecuritySettings();
      const session = await getSessionState();
      const local = await chrome.storage.local.get([VAULT_STORAGE_KEY, PROFILES_LIST_KEY]);
      const hasVault = !!local[VAULT_STORAGE_KEY];

      let isUnlocked = false;
      let profilesSummary = [];
      let activeId = null;

      if (settings.isVaultConfigured || hasVault) {
        isUnlocked = !!session.isUnlocked;
        if (isUnlocked && session.unlockedProfiles) {
          profilesSummary = session.unlockedProfiles.map(p => ({
            id: p.id,
            name: p.name || p.applicantName || 'Unnamed'
          }));
          activeId = session.activeProfileId || (session.unlockedProfiles[0] ? session.unlockedProfiles[0].id : null);
        }
      } else {
        // Not configured with master password yet
        isUnlocked = true;
        const legacyProfiles = local[PROFILES_LIST_KEY] || [];
        profilesSummary = legacyProfiles.map(p => ({
          id: p.id,
          name: p.name || p.applicantName || 'Person 1'
        }));
        const activeState = await chrome.storage.local.get(ACTIVE_PROFILE_KEY);
        activeId = activeState[ACTIVE_PROFILE_KEY] || (profilesSummary[0] ? profilesSummary[0].id : null);
      }

      sendResponse({
        isVaultConfigured: settings.isVaultConfigured || hasVault,
        isUnlocked,
        settings,
        activeProfileId: activeId,
        profilesSummary
      });
    })();
    return true;
  }

  // 2. Setup Vault (Master Password)
  if (message.type === 'setup-vault') {
    setupMasterPassword(message.password)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // 3. Unlock Vault
  if (message.type === 'unlock-vault') {
    unlockVault(message.password)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ ok: false, error: err.message || 'Incorrect password.' }));
    return true;
  }

  // 4. Lock Vault
  if (message.type === 'lock-vault') {
    lockVault().then(() => sendResponse({ ok: true }));
    return true;
  }

  // 5. Change Master Password
  if (message.type === 'change-password') {
    changeMasterPassword(message.oldPassword, message.newPassword)
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ ok: false, error: err.message || 'Failed to change password.' }));
    return true;
  }

  // 6. Reset Vault
  if (message.type === 'reset-vault') {
    resetVault()
      .then(res => sendResponse(res))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // 7. Update Security Settings
  if (message.type === 'update-security-settings') {
    saveSecuritySettings(message.settings)
      .then(updated => sendResponse({ ok: true, settings: updated }))
      .catch(err => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  // 8. Autofill Data Request (from Content Script)
  if (message.type === 'get-autofill-data') {
    (async () => {
      const state = await chrome.storage.local.get(ENABLED_KEY);
      if (!state[ENABLED_KEY]) {
        return sendResponse({ enabled: false });
      }

      const settings = await getSecuritySettings();
      const hostname = SecurityGuards.extractHostname(message.url);
      const isTrusted = SecurityGuards.isDomainTrusted(hostname, settings.trustedDomains);

      if (settings.trustedDomainsOnly && !isTrusted) {
        return sendResponse({
          enabled: true,
          untrustedDomain: true,
          hostname,
          antiJackingStrict: settings.antiJackingStrict
        });
      }

      const session = await getSessionState();
      let activeProfile = null;
      let profilesSummary = [];
      let activeProfileId = null;

      if (settings.isVaultConfigured) {
        if (!session.isUnlocked) {
          return sendResponse({ enabled: true, locked: true, hostname, isTrusted });
        }
        await touchActivity();
        const profiles = session.unlockedProfiles || [];
        activeProfileId = session.activeProfileId || (profiles[0] ? profiles[0].id : null);
        activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || null;
        profilesSummary = profiles.map(p => ({
          id: p.id,
          name: p.name || p.applicantName || 'Person'
        }));
      } else {
        // Fallback when vault is not yet configured
        const local = await chrome.storage.local.get([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY, PROFILE_KEY]);
        const profiles = local[PROFILES_LIST_KEY] || [];
        activeProfileId = local[ACTIVE_PROFILE_KEY] || (profiles[0] ? profiles[0].id : null);
        activeProfile = profiles.find(p => p.id === activeProfileId) || local[PROFILE_KEY] || null;
        profilesSummary = profiles.map(p => ({
          id: p.id,
          name: p.name || p.applicantName || 'Person'
        }));
      }

      if (activeProfile && activeProfile.sameAddress) {
        for (const k of ['careOf', 'villageRoad', 'district', 'upazila', 'postOffice', 'postCode']) {
          activeProfile[`permanent_${k}`] = activeProfile[`present_${k}`];
        }
      }

      sendResponse({
        enabled: true,
        locked: false,
        isTrusted,
        hostname,
        activeProfile,
        activeProfileId,
        profilesSummary,
        antiJackingStrict: settings.antiJackingStrict
      });
    })();
    return true;
  }

  // 9. Save single profile field
  if (message.type === 'save-profile-field') {
    (async () => {
      const settings = await getSecuritySettings();
      let profiles = [];
      let activeId = null;

      if (settings.isVaultConfigured) {
        const session = await getSessionState();
        if (!session.isUnlocked) return sendResponse({ ok: false, error: 'Vault is locked' });
        profiles = session.unlockedProfiles || [];
        activeId = session.activeProfileId;
      } else {
        const state = await chrome.storage.local.get([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY]);
        profiles = state[PROFILES_LIST_KEY] || [];
        activeId = state[ACTIVE_PROFILE_KEY];
      }

      let profile = profiles.find(p => p.id === activeId);
      if (!profile) {
        profile = { id: 'prof_' + Date.now(), name: 'Person 1' };
        profiles.push(profile);
        activeId = profile.id;
      }

      profile[message.key] = message.value;
      if (message.key === 'applicantName' && (!profile.name || profile.name.startsWith('Person '))) {
        profile.name = message.value;
      }

      await persistUnlockedProfiles(profiles, activeId);
      sendResponse({ ok: true });
    })();
    return true;
  }

  // 10. Switch Active Profile
  if (message.type === 'set-active-profile') {
    (async () => {
      const settings = await getSecuritySettings();
      let profiles = [];

      if (settings.isVaultConfigured) {
        const session = await getSessionState();
        if (!session.isUnlocked) return sendResponse({ ok: false, error: 'Vault is locked' });
        profiles = session.unlockedProfiles || [];
        const chosen = profiles.find(p => p.id === message.profileId);
        if (chosen) {
          await persistUnlockedProfiles(profiles, chosen.id);
        }
      } else {
        const state = await chrome.storage.local.get(PROFILES_LIST_KEY);
        profiles = state[PROFILES_LIST_KEY] || [];
        const chosen = profiles.find(p => p.id === message.profileId);
        if (chosen) {
          await chrome.storage.local.set({
            [ACTIVE_PROFILE_KEY]: chosen.id,
            [PROFILE_KEY]: chosen
          });
          broadcastStateChange({ type: 'profiles-updated', activeProfileId: chosen.id });
        }
      }
      sendResponse({ ok: true });
    })();
    return true;
  }

  // 11. Save all profiles (from options.js)
  if (message.type === 'save-all-profiles') {
    (async () => {
      await persistUnlockedProfiles(message.profiles, message.activeProfileId);
      sendResponse({ ok: true });
    })();
    return true;
  }

  // 12. Load all profiles (for options.js editor)
  if (message.type === 'load-all-profiles') {
    (async () => {
      const settings = await getSecuritySettings();
      if (settings.isVaultConfigured) {
        const session = await getSessionState();
        if (!session.isUnlocked) {
          return sendResponse({ locked: true });
        }
        await touchActivity();
        sendResponse({
          locked: false,
          profiles: session.unlockedProfiles || [],
          activeProfileId: session.activeProfileId
        });
      } else {
        const local = await chrome.storage.local.get([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY, PROFILE_KEY]);
        sendResponse({
          locked: false,
          profiles: local[PROFILES_LIST_KEY] || [],
          activeProfileId: local[ACTIVE_PROFILE_KEY]
        });
      }
    })();
    return true;
  }
});
