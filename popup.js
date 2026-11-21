const toggle = document.querySelector('#toggle');
const title = document.querySelector('#statusTitle');
const text = document.querySelector('#statusText');
const permissionNote = document.querySelector('#permissionNote');
const profileSelect = document.querySelector('#popupProfileSelect');
const editProfileBtn = document.querySelector('#editProfile');
const addPersonQuick = document.querySelector('#addPersonQuick');

const vaultBanner = document.querySelector('#vaultBanner');
const vaultStatusIcon = document.querySelector('#vaultStatusIcon');
const vaultStatusText = document.querySelector('#vaultStatusText');
const vaultBannerBtn = document.querySelector('#vaultBannerBtn');
const lockNowBtn = document.querySelector('#lockNowBtn');

const lockedView = document.querySelector('#lockedView');
const unlockedView = document.querySelector('#unlockedView');
const unlockPasswordInput = document.querySelector('#unlockPasswordInput');
const unlockBtn = document.querySelector('#unlockBtn');
const unlockError = document.querySelector('#unlockError');

const domainPill = document.querySelector('#domainPill');
const domainPillText = document.querySelector('#domainPillText');
const domainTrustBtn = document.querySelector('#domainTrustBtn');

let currentTabHostname = '';
let currentSettings = null;

async function getActiveTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabHostname = SecurityGuards.extractHostname(tab.url);
    }
  } catch (_) {}
}

async function refresh() {
  await getActiveTabInfo();

  const vaultStatus = await chrome.runtime.sendMessage({ type: 'get-vault-status' });
  const storageState = await chrome.storage.local.get('autofillEnabled');
  const autofillEnabled = !!storageState.autofillEnabled;
  currentSettings = vaultStatus.settings;

  toggle.checked = autofillEnabled;
  title.textContent = autofillEnabled ? 'Autofill is on' : 'Autofill is off';
  text.textContent = autofillEnabled
    ? 'Form fields will offer matches for the selected person.'
    : 'Turn it on when you want help with a form.';
  permissionNote.classList.toggle('hidden', !autofillEnabled);

  // Check Domain Trust Status
  if (currentTabHostname) {
    domainPill.classList.remove('hidden');
    const isTrusted = SecurityGuards.isDomainTrusted(currentTabHostname, currentSettings.trustedDomains);
    if (isTrusted) {
      domainPill.className = 'domain-trust-pill trusted';
      domainPillText.textContent = `✓ Trusted site: ${currentTabHostname}`;
      domainTrustBtn.classList.add('hidden');
    } else {
      domainPill.className = 'domain-trust-pill untrusted';
      domainPillText.textContent = `⚠️ Untrusted site: ${currentTabHostname}`;
      domainTrustBtn.classList.remove('hidden');
    }
  } else {
    domainPill.classList.add('hidden');
  }

  // Vault Status Display
  if (!vaultStatus.isVaultConfigured) {
    // Unconfigured
    vaultBanner.className = 'vault-banner unsecured';
    vaultBanner.classList.remove('hidden');
    vaultStatusIcon.textContent = '⚠️';
    vaultStatusText.textContent = 'Vault is unsecured';
    vaultBannerBtn.textContent = 'Set Password';
    vaultBannerBtn.onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('options.html#security') });
    lockNowBtn.classList.add('hidden');

    lockedView.classList.add('hidden');
    unlockedView.classList.remove('hidden');
  } else if (!vaultStatus.isUnlocked) {
    // Locked
    vaultBanner.className = 'vault-banner locked';
    vaultBanner.classList.remove('hidden');
    vaultStatusIcon.textContent = '🔒';
    vaultStatusText.textContent = 'Vault is Locked';
    vaultBannerBtn.classList.add('hidden');
    lockNowBtn.classList.add('hidden');

    lockedView.classList.remove('hidden');
    unlockedView.classList.add('hidden');
    unlockPasswordInput.focus();
    return;
  } else {
    // Unlocked
    vaultBanner.className = 'vault-banner unlocked';
    vaultBanner.classList.remove('hidden');
    vaultStatusIcon.textContent = '🛡️';
    vaultStatusText.textContent = 'Encrypted (AES-256-GCM)';
    vaultBannerBtn.textContent = 'Lock';
    vaultBannerBtn.onclick = async () => {
      await chrome.runtime.sendMessage({ type: 'lock-vault' });
      await refresh();
    };
    lockNowBtn.classList.remove('hidden');
    lockNowBtn.onclick = vaultBannerBtn.onclick;

    lockedView.classList.add('hidden');
    unlockedView.classList.remove('hidden');
  }

  // Populate profiles
  const profiles = vaultStatus.profilesSummary || [];
  const activeProfileId = vaultStatus.activeProfileId;

  profileSelect.innerHTML = '';
  for (const prof of profiles) {
    const opt = document.createElement('option');
    opt.value = prof.id;
    opt.textContent = `👤 ${prof.name || 'Unnamed Person'}`;
    if (prof.id === activeProfileId) opt.selected = true;
    profileSelect.append(opt);
  }

  const active = profiles.find(p => p.id === activeProfileId);
  const activeName = active?.name || 'person';
  editProfileBtn.textContent = `Edit details for ${activeName}`;
}

async function handleUnlock() {
  const password = unlockPasswordInput.value.trim();
  if (!password) {
    unlockError.textContent = 'Please enter your Master Password.';
    return;
  }
  unlockError.textContent = '';
  unlockBtn.disabled = true;
  unlockBtn.textContent = 'Decrypting…';

  try {
    const res = await chrome.runtime.sendMessage({ type: 'unlock-vault', password });
    if (res && res.ok) {
      unlockPasswordInput.value = '';
      unlockError.textContent = '';
      await refresh();
    } else {
      unlockError.textContent = res?.error || 'Incorrect password.';
      unlockPasswordInput.select();
    }
  } catch (err) {
    unlockError.textContent = err.message || 'Failed to unlock vault.';
  } finally {
    unlockBtn.disabled = false;
    unlockBtn.textContent = 'Unlock Vault';
  }
}

unlockBtn.addEventListener('click', handleUnlock);
unlockPasswordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleUnlock();
});

profileSelect.addEventListener('change', async () => {
  const chosenId = profileSelect.value;
  await chrome.runtime.sendMessage({ type: 'set-active-profile', profileId: chosenId });
  await refresh();
});

toggle.addEventListener('change', async () => {
  if (toggle.checked) {
    const granted = await chrome.permissions.request({ origins: ['<all_urls>'] });
    if (!granted) {
      toggle.checked = false;
      await refresh();
      return;
    }
  }
  await chrome.storage.local.set({ autofillEnabled: toggle.checked });
  await refresh();
});

domainTrustBtn.addEventListener('click', async () => {
  if (!currentTabHostname || !currentSettings) return;
  const list = [...(currentSettings.trustedDomains || [])];
  if (!list.includes(currentTabHostname)) {
    list.push(currentTabHostname);
    currentSettings.trustedDomains = list;
    await chrome.runtime.sendMessage({
      type: 'update-security-settings',
      settings: currentSettings
    });
    await refresh();
  }
});

document.querySelector('#settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
editProfileBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
addPersonQuick.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html?action=new') });
});

refresh();
