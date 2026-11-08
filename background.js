const PROFILE_KEY = 'formfillProfile';
const PROFILES_LIST_KEY = 'profiles';
const ACTIVE_PROFILE_KEY = 'activeProfileId';
const ENABLED_KEY = 'autofillEnabled';

async function ensureProfilesInitialized() {
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
  await ensureProfilesInitialized();
});

async function injectIfEnabled(tabId, url) {
  if (!url || !/^https?:/.test(url)) return;
  const state = await chrome.storage.local.get(ENABLED_KEY);
  if (!state[ENABLED_KEY]) return;
  try {
    const permitted = await chrome.permissions.contains({ origins: [new URL(url).origin + '/*'] });
    if (permitted) {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'save-profile-field') {
    chrome.storage.local.get([PROFILES_LIST_KEY, ACTIVE_PROFILE_KEY, PROFILE_KEY]).then(state => {
      let profiles = state[PROFILES_LIST_KEY] || [];
      let activeId = state[ACTIVE_PROFILE_KEY];
      let profile = profiles.find(p => p.id === activeId);
      if (!profile) {
        profile = state[PROFILE_KEY] || { id: 'prof_' + Date.now(), name: 'Person 1' };
        profiles.push(profile);
        activeId = profile.id;
      }
      profile[message.key] = message.value;
      if (message.key === 'applicantName' && (!profile.name || profile.name.startsWith('Person '))) {
        profile.name = message.value;
      }
      return chrome.storage.local.set({
        [PROFILES_LIST_KEY]: profiles,
        [ACTIVE_PROFILE_KEY]: activeId,
        [PROFILE_KEY]: profile
      });
    }).then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message?.type === 'set-active-profile') {
    chrome.storage.local.get(PROFILES_LIST_KEY).then(state => {
      const profiles = state[PROFILES_LIST_KEY] || [];
      const chosen = profiles.find(p => p.id === message.profileId);
      if (chosen) {
        return chrome.storage.local.set({
          [ACTIVE_PROFILE_KEY]: chosen.id,
          [PROFILE_KEY]: chosen
        });
      }
    }).then(() => sendResponse({ ok: true }));
    return true;
  }
});
