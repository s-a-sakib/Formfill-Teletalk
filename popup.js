const toggle = document.querySelector('#toggle');
const title = document.querySelector('#statusTitle');
const text = document.querySelector('#statusText');
const permissionNote = document.querySelector('#permissionNote');
const profileSelect = document.querySelector('#popupProfileSelect');
const editProfileBtn = document.querySelector('#editProfile');
const addPersonQuick = document.querySelector('#addPersonQuick');

async function getProfilesState() {
  const state = await chrome.storage.local.get(['profiles', 'activeProfileId', 'formfillProfile', 'autofillEnabled']);
  let profiles = state.profiles || [];
  let activeId = state.activeProfileId;
  const legacy = state.formfillProfile || {};

  if (!Array.isArray(profiles) || profiles.length === 0) {
    const id = 'prof_' + Date.now();
    const name = legacy.applicantName || 'Person 1';
    const initial = { id, name, ...legacy };
    profiles = [initial];
    activeId = id;
    await chrome.storage.local.set({
      profiles,
      activeProfileId: activeId,
      formfillProfile: initial
    });
  } else if (!activeId || !profiles.some(p => p.id === activeId)) {
    activeId = profiles[0].id;
    await chrome.storage.local.set({
      activeProfileId: activeId,
      formfillProfile: profiles[0]
    });
  }

  return {
    profiles,
    activeProfileId: activeId,
    autofillEnabled: !!state.autofillEnabled
  };
}

async function refresh() {
  const { profiles, activeProfileId, autofillEnabled } = await getProfilesState();

  toggle.checked = autofillEnabled;
  title.textContent = autofillEnabled ? 'Autofill is on' : 'Autofill is off';
  text.textContent = autofillEnabled ? 'Form fields will offer matches for the selected person.' : 'Turn it on when you want help with a form.';
  permissionNote.classList.toggle('hidden', !autofillEnabled);

  // Populate profiles
  profileSelect.innerHTML = '';
  for (const prof of profiles) {
    const opt = document.createElement('option');
    opt.value = prof.id;
    opt.textContent = `👤 ${prof.name || prof.applicantName || 'Unnamed Person'}`;
    if (prof.id === activeProfileId) opt.selected = true;
    profileSelect.append(opt);
  }

  const active = profiles.find(p => p.id === activeProfileId);
  const activeName = active?.name || active?.applicantName || 'person';
  editProfileBtn.textContent = `Edit details for ${activeName}`;
}

profileSelect.addEventListener('change', async () => {
  const chosenId = profileSelect.value;
  const { profiles } = await chrome.storage.local.get('profiles');
  const chosen = (profiles || []).find(p => p.id === chosenId);
  if (chosen) {
    await chrome.storage.local.set({
      activeProfileId: chosen.id,
      formfillProfile: chosen
    });
  }
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

document.querySelector('#settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
editProfileBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
addPersonQuick.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html?action=new') });
});

refresh();
