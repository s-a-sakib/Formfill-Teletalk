const PROFILE_KEY = 'formfillProfile';
const ENABLED_KEY = 'autofillEnabled';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const state = await chrome.storage.local.get([PROFILE_KEY, ENABLED_KEY]);
  if (!state[PROFILE_KEY]) await chrome.storage.local.set({ [PROFILE_KEY]: {} });
  if (state[ENABLED_KEY] === undefined) await chrome.storage.local.set({ [ENABLED_KEY]: false });
  if (reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('options.html?welcome=1') });
});

async function injectIfEnabled(tabId, url) {
  if (!url || !/^https?:/.test(url)) return;
  const state = await chrome.storage.local.get(ENABLED_KEY);
  if (!state[ENABLED_KEY]) return;
  try {
    const permitted = await chrome.permissions.contains({ origins: [new URL(url).origin + '/*'] });
    if (permitted) await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (_) { /* restricted browser pages cannot be scripted */ }
}

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === 'complete') injectIfEnabled(tabId, tab.url);
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try { const tab = await chrome.tabs.get(tabId); injectIfEnabled(tabId, tab.url); } catch (_) {}
});
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'local' || !changes[ENABLED_KEY]?.newValue) return;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) if (tab.id) injectIfEnabled(tab.id, tab.url);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'save-profile-field') {
    chrome.storage.local.get(PROFILE_KEY).then(({ [PROFILE_KEY]: profile = {} }) => {
      profile[message.key] = message.value;
      return chrome.storage.local.set({ [PROFILE_KEY]: profile });
    }).then(() => sendResponse({ ok: true }));
    return true;
  }
});
