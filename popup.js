const toggle = document.querySelector('#toggle');
const title = document.querySelector('#statusTitle');
const text = document.querySelector('#statusText');
const permissionNote = document.querySelector('#permissionNote');
async function refresh() {
  const { autofillEnabled = false } = await chrome.storage.local.get('autofillEnabled');
  toggle.checked = autofillEnabled;
  title.textContent = autofillEnabled ? 'Autofill is on' : 'Autofill is off';
  text.textContent = autofillEnabled ? 'We’ll look for matching fields on your pages.' : 'Turn it on when you want help with a form.';
  permissionNote.classList.toggle('hidden', !autofillEnabled);
}
toggle.addEventListener('change', async () => {
  if (toggle.checked) {
    const granted = await chrome.permissions.request({ origins: ['<all_urls>'] });
    if (!granted) { toggle.checked = false; await refresh(); return; }
  }
  await chrome.storage.local.set({ autofillEnabled: toggle.checked });
  await refresh();
});
document.querySelector('#settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
document.querySelector('#editProfile').addEventListener('click', () => chrome.runtime.openOptionsPage());
refresh();
