const FIELDS = {
  personal: [
    ['applicantName', "Applicant’s name", 'text', 'নাম (ইংরেজি) - e.g. MD. SHAHRIAR AL SAKIB'],
    ['applicantNameBn', "Applicant’s name (Bangla)", 'text', 'আবেদনকারীর নাম (বাংলা) - e.g. মোঃ শাহরিয়ার আল সাকিব'],
    ['fatherName', "Father’s name", 'text', 'পিতার নাম (ইংরেজি)'],
    ['fatherNameBn', "Father’s name (Bangla)", 'text', 'পিতার নাম (বাংলা)'],
    ['motherName', "Mother’s name", 'text', 'মাতার নাম (ইংরেজি)'],
    ['motherNameBn', "Mother’s name (Bangla)", 'text', 'মাতার নাম (বাংলা)'],
    ['dateOfBirth', 'Date of birth', 'date', ''],
    ['nationality', 'Nationality', 'select', ['Bangladeshi', 'Other']],
    ['religion', 'Religion', 'select', ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other']],
    ['gender', 'Gender', 'select', ['Male', 'Female', 'Other']],
    ['nationalIdStatus', 'National ID available', 'select', ['Yes', 'No']],
    ['nationalId', 'National ID number', 'text', 'জাতীয় পরিচয়পত্র নম্বর'],
    ['birthRegistrationStatus', 'Birth registration available', 'select', ['Yes', 'No']],
    ['birthRegistration', 'Birth registration number', 'text', 'জন্ম নিবন্ধন নম্বর'],
    ['passportId', 'Passport ID available', 'select', ['Yes', 'No']],
    ['maritalStatus', 'Marital status', 'select', ['Single', 'Married', 'Divorced', 'Widowed']],
    ['mobile', 'Mobile number', 'tel', '01XXXXXXXXX'],
    ['confirmMobile', 'Confirm mobile number', 'tel', '01XXXXXXXXX'],
    ['email', 'Email address', 'email', 'example@gmail.com'],
    ['quota', 'Quota', 'select', [
      'Non Quota',
      'Child of Freedom Fighter',
      'Child of Martyred Freedom Fighter',
      'Child of War Heroine (Birangona)',
      'Grandchild of Freedom Fighter',
      'Physically Challenged',
      'Ethnic Minority',
      'Ansar-VDP',
      'Female Quota',
      'Orphan',
      'Third Gender',
      'Not Applicable'
    ]],
    ['departmentalStatus', 'Departmental status', 'select', [
      'Govt. Employee',
      'Semi Govt. Employee',
      'Autonomous',
      'Departmental Candidate',
      'Not Applicable'
    ]]
  ],
  address: [
    ['careOf', 'Care of / Guardian', 'text', 'C/O Name'],
    ['villageRoad', 'Village / road / house / flat', 'text', 'Village or House/Road'],
    ['district', 'District', 'text', 'e.g. Dhaka, Rajshahi'],
    ['upazila', 'Upazila / P.S. / Thana', 'text', 'e.g. Mirpur, Boalia'],
    ['postOffice', 'Post office', 'text', 'e.g. Mirpur-10'],
    ['postCode', 'Post code', 'text', 'e.g. 1216']
  ],
  edu: [
    ['exam', 'Examination', 'datalist', 'Choose or type exam'],
    ['board', 'Board / university / institution', 'datalist', 'Choose or type board / university'],
    ['roll', 'Roll number', 'text', 'Roll number'],
    ['resultType', 'Result type', 'select'],
    ['resultValue', 'Result / GPA', 'text', 'Result / GPA score'],
    ['group', 'Group / subject / degree', 'datalist', 'Choose or type group / subject / degree'],
    ['year', 'Passing year', 'select'],
    ['duration', 'Course duration', 'select']
  ],
  exp: [
    ['employedOn', 'Employed on', 'text'],
    ['organization', 'Organization', 'text'],
    ['designation', 'Designation / post', 'text'],
    ['workAddress', 'Address', 'text'],
    ['startDate', 'Start date', 'date'],
    ['endDate', 'End date', 'date'],
    ['currentlyWorking', 'Currently working', 'checkbox'],
    ['description', 'Job description', 'textarea']
  ]
};

let allProfiles = [];
let activeProfileId = null;
let currentPhoto = null;
let currentSignature = null;

function makeField([key, label, type = 'text', hint = '']) {
  const wrap = document.createElement('div');
  wrap.className = 'field';
  const lab = document.createElement('label');
  lab.htmlFor = key;
  lab.textContent = label;
  wrap.append(lab);

  let el;
  if (type === 'select') {
    el = document.createElement('select');
    el.add(new Option('Choose…', ''));
    (Array.isArray(hint) ? hint : []).forEach(v => el.add(new Option(v, v)));
  } else if (type === 'textarea') {
    el = document.createElement('textarea');
  } else if (type === 'datalist') {
    el = document.createElement('input');
    el.type = 'text';
    const listId = `${key}_list`;
    el.setAttribute('list', listId);
    el.placeholder = 'Type or choose from suggestions…';
    const datalist = document.createElement('datalist');
    datalist.id = listId;
    (Array.isArray(hint) ? hint : []).forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      datalist.append(opt);
    });
    wrap.append(datalist);
  } else {
    el = document.createElement('input');
    el.type = type;
    if (hint) el.placeholder = hint;
    if (key.endsWith('district')) {
      el.setAttribute('list', 'bdDistrictsList');
    }
  }
  el.id = key;
  el.name = key;
  el.dataset.profileKey = key;
  wrap.append(el);
  return wrap;
}

// Build fields once
FIELDS.personal.forEach(f => document.querySelector('#personalFields').append(makeField(f)));
for (const side of ['present', 'permanent']) {
  FIELDS.address.forEach(([key, label, type, hint]) => {
    document.querySelector(`#${side}Fields`).append(makeField([`${side}_${key}`, label, type, hint]));
  });
}

for (const level of ['SSC / equivalent', 'HSC / equivalent', 'Graduation / equivalent', 'Masters / equivalent']) {
  const slug = level.split(' ')[0].toLowerCase();
  const block = document.createElement('div');
  block.className = 'education-block';

  const h = document.createElement('h3');
  h.textContent = level;
  block.append(h);

  if (slug === 'graduation' || slug === 'masters') {
    const applicable = document.createElement('label');
    applicable.className = 'check-row';
    applicable.innerHTML = `<input type="checkbox" id="${slug}Applicable" data-profile-key="${slug}Applicable"> If applicable`;
    block.append(applicable);
  }

  const grid = document.createElement('div');
  grid.className = 'education-grid';
  const choices = {
    exam: slug === 'ssc'
      ? ['S.S.C.', 'Dakhil', 'S.S.C. Vocational', 'O Level', 'Other']
      : slug === 'hsc'
      ? ['H.S.C.', 'Alim', 'H.S.C. Vocational', 'Diploma-in-Engineering', 'A Level', 'Other']
      : slug === 'graduation'
      ? ['B.Sc Engineering', 'B.Sc (Honours)', 'B.A.', 'BSS', 'BBA', 'B.Com', 'MBBS', 'B.Sc Ag', 'Other']
      : ['M.Sc', 'M.A.', 'MSS', 'MBA', 'M.Com', 'LL.M', 'Other'],
    board: ['Dhaka', 'Chattogram', 'Cumilla', 'Dinajpur', 'Jashore', 'Mymensingh', 'Rajshahi', 'Sylhet', 'Barishal', 'Madrasah', 'Technical', 'University of Dhaka', 'University of Rajshahi', 'BUET', 'RUET', 'CUET', 'KUET', 'National University', 'Open University', 'Other'],
    resultType: (slug === 'graduation' || slug === 'masters')
      ? ['CGPA(out of 4)', 'CGPA(out of 5)', '1st Class', '2nd Class', '3rd Class', 'Passed']
      : ['GPA(out of 5)', 'GPA(out of 4)', '1st Division', '2nd Division', '3rd Division'],
    group: ['Science', 'Business Studies', 'Humanities', 'General', 'Computer Science & Engineering', 'Electrical & Electronic Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Economics', 'English', 'Bangla', 'Accounting', 'Management', 'Finance', 'Marketing', 'Other'],
    year: Array.from({ length: 65 }, (_, i) => String(new Date().getFullYear() - i)),
    duration: ['01 Year', '02 Years', '03 Years', '04 Years', '05 Years', 'Other']
  };

  FIELDS.edu.forEach(([key, label, type, hintText]) => {
    const listItems = choices[key] || [];
    grid.append(makeField([`${slug}_${key}`, label, type, (type === 'select' || type === 'datalist') ? listItems : (hintText || '')]));
  });
  block.append(grid);
  document.querySelector('#educationFields').append(block);
}

const expList = document.querySelector('#experienceList');

function addExperience(values = {}) {
  const i = expList.children.length;
  const block = document.createElement('div');
  block.className = 'experience-item';
  block.innerHTML = `<h3>Experience ${i + 1}</h3><button type="button" class="remove-experience">Remove</button><div class="education-grid"></div>`;
  const grid = block.querySelector('.education-grid');
  FIELDS.exp.forEach(([key, label, type]) => grid.append(makeField([`experience_${i}_${key}`, label, type])));
  block.querySelector('.remove-experience').onclick = () => {
    block.remove();
    renumberExp();
  };
  expList.append(block);
  for (const [key, val] of Object.entries(values)) {
    const input = block.querySelector(`[data-profile-key="${key}"]`);
    if (input) {
      if (input.type === 'checkbox') input.checked = !!val;
      else input.value = val;
    }
  }
}

function renumberExp() {
  [...expList.children].forEach((block, i) => {
    block.querySelector('h3').textContent = `Experience ${i + 1}`;
    block.querySelectorAll('[data-profile-key]').forEach(el => {
      el.dataset.profileKey = el.dataset.profileKey.replace(/^experience_\d+_/, `experience_${i}_`);
    });
  });
}

document.querySelector('#addExperience').onclick = () => addExperience();

const same = document.querySelector('#sameAddress');
same.addEventListener('change', () => {
  document.querySelector('#permanentWrap').classList.toggle('hidden', same.checked);
});

function syncIdFields() {
  for (const [status, number] of [['nationalIdStatus', 'nationalId'], ['birthRegistrationStatus', 'birthRegistration']]) {
    const control = document.getElementById(status);
    const field = document.getElementById(number)?.closest('.field');
    if (control && field) field.classList.toggle('hidden', control.value === 'No');
  }
}

for (const id of ['nationalIdStatus', 'birthRegistrationStatus']) {
  document.getElementById(id).addEventListener('change', syncIdFields);
}

/* ---------------- Image Resizing & Processing Helpers ---------------- */

function resizeToCanvas(dataUrl, targetWidth, targetHeight, format = 'image/jpeg', quality = 0.92) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const resizedUrl = canvas.toDataURL(format, quality);
      const approxBytes = Math.round((resizedUrl.length - resizedUrl.indexOf(',') - 1) * 3 / 4);
      resolve({
        dataUrl: resizedUrl,
        width: targetWidth,
        height: targetHeight,
        size: approxBytes,
        type: format
      });
    };
    img.src = dataUrl;
  });
}

function updateMediaUI(type, mediaObj) {
  const isPhoto = type === 'photo';
  const preview = document.querySelector(isPhoto ? '#photoPreview' : '#sigPreview');
  const placeholder = document.querySelector(isPhoto ? '#photoPlaceholder' : '#sigPlaceholder');
  const meta = document.querySelector(isPhoto ? '#photoMeta' : '#sigMeta');
  const resizeBtn = document.querySelector(isPhoto ? '#resizePhotoBtn' : '#resizeSigBtn');
  const removeBtn = document.querySelector(isPhoto ? '#removePhotoBtn' : '#removeSigBtn');

  if (mediaObj && mediaObj.dataUrl) {
    preview.src = mediaObj.dataUrl;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    const kb = (mediaObj.size / 1024).toFixed(1);
    meta.textContent = `${mediaObj.name || (isPhoto ? 'photo.jpg' : 'signature.jpg')} • ${mediaObj.width || '?'}×${mediaObj.height || '?'} px • ${kb} KB`;
    meta.classList.remove('hidden');
    resizeBtn.classList.remove('hidden');
    removeBtn.classList.remove('hidden');
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    meta.classList.add('hidden');
    resizeBtn.classList.add('hidden');
    removeBtn.classList.add('hidden');
  }
}

function setupMediaHandlers() {
  const photoInput = document.querySelector('#photoInput');
  const sigInput = document.querySelector('#sigInput');

  document.querySelector('#uploadPhotoBtn').onclick = () => photoInput.click();
  document.querySelector('#uploadSigBtn').onclick = () => sigInput.click();

  photoInput.onchange = e => handleFileSelect(e.target.files[0], 'photo');
  sigInput.onchange = e => handleFileSelect(e.target.files[0], 'signature');

  document.querySelector('#removePhotoBtn').onclick = () => {
    currentPhoto = null;
    photoInput.value = '';
    updateMediaUI('photo', null);
  };

  document.querySelector('#removeSigBtn').onclick = () => {
    currentSignature = null;
    sigInput.value = '';
    updateMediaUI('signature', null);
  };

  document.querySelector('#resizePhotoBtn').onclick = async () => {
    if (!currentPhoto?.dataUrl) return;
    const res = await resizeToCanvas(currentPhoto.dataUrl, 300, 300);
    currentPhoto = {
      ...currentPhoto,
      dataUrl: res.dataUrl,
      width: 300,
      height: 300,
      size: res.size,
      type: res.type
    };
    updateMediaUI('photo', currentPhoto);
  };

  document.querySelector('#resizeSigBtn').onclick = async () => {
    if (!currentSignature?.dataUrl) return;
    const res = await resizeToCanvas(currentSignature.dataUrl, 300, 80);
    currentSignature = {
      ...currentSignature,
      dataUrl: res.dataUrl,
      width: 300,
      height: 80,
      size: res.size,
      type: res.type
    };
    updateMediaUI('signature', currentSignature);
  };
}

function handleFileSelect(file, type) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    const img = new Image();
    img.onload = () => {
      const mediaObj = {
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      if (type === 'photo') {
        currentPhoto = mediaObj;
        updateMediaUI('photo', currentPhoto);
      } else {
        currentSignature = mediaObj;
        updateMediaUI('signature', currentSignature);
      }
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

setupMediaHandlers();

/* ---------------- Profile Management & Population ---------------- */

const form = document.querySelector('#profileForm');
const profilePicker = document.querySelector('#profilePicker');

function renderProfilePicker() {
  profilePicker.innerHTML = '';
  allProfiles.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `👤 ${p.name || p.applicantName || 'Unnamed Person'}`;
    if (p.id === activeProfileId) opt.selected = true;
    profilePicker.append(opt);
  });
}

function loadProfileIntoForm(profile) {
  // Clear inputs first
  for (const el of form.querySelectorAll('[data-profile-key]')) {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  }

  // Populate values
  for (const el of form.querySelectorAll('[data-profile-key]')) {
    const val = profile[el.dataset.profileKey];
    if (val !== undefined && val !== null) {
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val;
    }
  }

  same.checked = !!profile.sameAddress;
  document.querySelector('#permanentWrap').classList.toggle('hidden', same.checked);
  syncIdFields();

  expList.innerHTML = '';
  const exps = profile.experiences || [];
  if (exps.length) exps.forEach(v => addExperience(v));
  else addExperience();

  currentPhoto = profile.photo || null;
  currentSignature = profile.signature || null;
  updateMediaUI('photo', currentPhoto);
  updateMediaUI('signature', currentSignature);
}

function gatherCurrentForm() {
  const data = {};
  for (const el of form.querySelectorAll('[data-profile-key]')) {
    data[el.dataset.profileKey] = el.type === 'checkbox' ? el.checked : el.value;
  }
  data.sameAddress = same.checked;
  if (same.checked) {
    for (const key of ['careOf', 'villageRoad', 'district', 'upazila', 'postOffice', 'postCode']) {
      data[`permanent_${key}`] = data[`present_${key}`] || '';
    }
  }
  data.experiences = [...expList.children].map(b => {
    const obj = {};
    b.querySelectorAll('[data-profile-key]').forEach(el => {
      obj[el.dataset.profileKey.replace(/^experience_\d+_/, '')] = el.type === 'checkbox' ? el.checked : el.value;
    });
    return obj;
  });

  data.photo = currentPhoto;
  data.signature = currentSignature;
  return data;
}

function saveCurrentToMemory() {
  if (!activeProfileId) return;
  const index = allProfiles.findIndex(p => p.id === activeProfileId);
  if (index !== -1) {
    const gathered = gatherCurrentForm();
    allProfiles[index] = {
      ...allProfiles[index],
      ...gathered,
      id: activeProfileId,
      name: allProfiles[index].name || gathered.applicantName || 'Person'
    };
  }
}

profilePicker.addEventListener('change', () => {
  saveCurrentToMemory();
  activeProfileId = profilePicker.value;
  const chosen = allProfiles.find(p => p.id === activeProfileId);
  if (chosen) loadProfileIntoForm(chosen);
});

document.querySelector('#addPersonBtn').onclick = () => {
  saveCurrentToMemory();
  const name = window.prompt('Enter the person’s full name:', `Person ${allProfiles.length + 1}`);
  if (!name || !name.trim()) return;

  const newProfile = {
    id: 'prof_' + Date.now(),
    name: name.trim(),
    applicantName: name.trim()
  };
  allProfiles.push(newProfile);
  activeProfileId = newProfile.id;
  renderProfilePicker();
  loadProfileIntoForm(newProfile);
  persistAll('New person profile created.');
};

document.querySelector('#renamePersonBtn').onclick = () => {
  const current = allProfiles.find(p => p.id === activeProfileId);
  if (!current) return;
  const newName = window.prompt('Rename profile:', current.name || current.applicantName || 'Person');
  if (!newName || !newName.trim()) return;

  current.name = newName.trim();
  renderProfilePicker();
  persistAll('Profile renamed.');
};

document.querySelector('#duplicatePersonBtn').onclick = () => {
  saveCurrentToMemory();
  const current = allProfiles.find(p => p.id === activeProfileId);
  if (!current) return;

  const copy = JSON.parse(JSON.stringify(current));
  copy.id = 'prof_' + Date.now();
  copy.name = `Copy of ${current.name || current.applicantName || 'Person'}`;
  allProfiles.push(copy);
  activeProfileId = copy.id;
  renderProfilePicker();
  loadProfileIntoForm(copy);
  persistAll('Profile duplicated.');
};

document.querySelector('#deletePersonBtn').onclick = () => {
  if (allProfiles.length <= 1) {
    alert('You must have at least one profile.');
    return;
  }
  const current = allProfiles.find(p => p.id === activeProfileId);
  if (!current) return;

  if (window.confirm(`Delete profile "${current.name || 'this person'}"?`)) {
    allProfiles = allProfiles.filter(p => p.id !== activeProfileId);
    activeProfileId = allProfiles[0].id;
    renderProfilePicker();
    loadProfileIntoForm(allProfiles[0]);
    persistAll('Profile deleted.');
  }
};

async function persistAll(customToast = null) {
  saveCurrentToMemory();
  const activeProfile = allProfiles.find(p => p.id === activeProfileId) || allProfiles[0] || {};
  await chrome.storage.local.set({
    profiles: allProfiles,
    activeProfileId: activeProfile.id,
    formfillProfile: activeProfile
  });
  const msg = document.querySelector('#saveMessage');
  msg.textContent = customToast || `Saved details for ${activeProfile.name || activeProfile.applicantName || 'profile'}.`;
  setTimeout(() => (msg.textContent = ''), 3500);
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const active = allProfiles.find(p => p.id === activeProfileId);
  const applicantNameVal = document.querySelector('#applicantName')?.value?.trim();
  if (applicantNameVal && (!active?.name || active.name.startsWith('Person '))) {
    active.name = applicantNameVal;
    renderProfilePicker();
  }
  await persistAll('Profile saved on this device.');
});

document.querySelector('#saveTop').onclick = () => form.requestSubmit();

/* ---------------- Autofill Global Toggle ---------------- */

function setEnabled(v) {
  document.querySelector('#mainToggle').checked = v;
  document.querySelector('#previewToggle').textContent = `Autofill: ${v ? 'On' : 'Off'}`;
}

async function flipEnabled(input) {
  let enabled = input.checked;
  if (enabled) {
    const ok = await chrome.permissions.request({ origins: ['<all_urls>'] });
    if (!ok) {
      input.checked = false;
      setEnabled(false);
      return;
    }
  }
  await chrome.storage.local.set({ autofillEnabled: enabled });
  setEnabled(enabled);
}

document.querySelector('#mainToggle').addEventListener('change', e => flipEnabled(e.currentTarget));
document.querySelector('#previewToggle').addEventListener('click', async () => {
  const input = document.querySelector('#mainToggle');
  input.checked = !input.checked;
  await flipEnabled(input);
});

/* ---------------- Initialization ---------------- */

async function init() {
  const state = await chrome.storage.local.get(['profiles', 'activeProfileId', 'formfillProfile', 'autofillEnabled']);
  allProfiles = state.profiles || [];
  activeProfileId = state.activeProfileId;
  const legacy = state.formfillProfile || {};

  if (!Array.isArray(allProfiles) || allProfiles.length === 0) {
    const initial = {
      id: 'prof_' + Date.now(),
      name: legacy.applicantName || 'Person 1',
      ...legacy
    };
    allProfiles = [initial];
    activeProfileId = initial.id;
    await chrome.storage.local.set({
      profiles: allProfiles,
      activeProfileId: initial.id,
      formfillProfile: initial
    });
  } else if (!activeProfileId || !allProfiles.some(p => p.id === activeProfileId)) {
    activeProfileId = allProfiles[0].id;
    await chrome.storage.local.set({
      activeProfileId,
      formfillProfile: allProfiles[0]
    });
  }

  renderProfilePicker();
  const current = allProfiles.find(p => p.id === activeProfileId);
  if (current) loadProfileIntoForm(current);
  setEnabled(!!state.autofillEnabled);

  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has('welcome')) {
    document.querySelector('#welcome').classList.remove('hidden');
  }
  if (urlParams.get('action') === 'new') {
    document.querySelector('#addPersonBtn').click();
  }
}

init();
