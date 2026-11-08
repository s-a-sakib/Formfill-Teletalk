(() => {
  if (window.__formFillBDLoaded) return;
  window.__formFillBDLoaded = true;

  const DISTRICT_CANONICAL = {
    chittagong: 'chattogram', chattogram: 'chittagong',
    comilla: 'cumilla', cumilla: 'comilla',
    barisal: 'barishal', barishal: 'barisal',
    jessore: 'jashore', jashore: 'jessore',
    bogra: 'bogura', bogura: 'bogra'
  };

  function canonicalDistrict(s) {
    const clean = String(s || '').toLowerCase().trim();
    return DISTRICT_CANONICAL[clean] || clean;
  }

  const FIELD_META = {
    applicantName: [
      'applicant name', "applicant's name", 'applicants name',
      'name of applicant', 'candidate name', "candidate's name", 'candidates name',
      'full name', 'applicant', 'নাম', 'আবেদনকারীর নাম', 'প্রার্থীর নাম'
    ],
    applicantNameBn: [
      'applicant name bangla', "applicant's name bangla", 'applicants name bangla',
      'name bangla', 'বাংলা নাম', 'নাম বাংলা', 'আবেদনকারীর নাম বাংলা',
      'আবেদনকারীর নাম বাংলায়', 'আবেদনকারীর নাম (বাংলা)', 'আবেদনকারীর নাম (বাংলায়)'
    ],
    fatherName: [
      'father name', "father's name", 'fathers name', 'name of father', 'পিতার নাম', 'বাবার নাম'
    ],
    fatherNameBn: [
      'father name bangla', "father's name bangla", 'fathers name bangla',
      'পিতার নাম বাংলা', 'পিতার নাম (বাংলা)', 'পিতার নাম বাংলায়', 'পিতার নাম (বাংলায়)'
    ],
    motherName: [
      'mother name', "mother's name", 'mothers name', 'name of mother', 'মাতার নাম', 'মায়ের নাম'
    ],
    motherNameBn: [
      'mother name bangla', "mother's name bangla", 'mothers name bangla',
      'মাতার নাম বাংলা', 'মাতার নাম (বাংলা)', 'মাতার নাম বাংলায়', 'মাতার নাম (বাংলায়)'
    ],
    dateOfBirth: ['date of birth', 'birth date', 'dob', 'জন্ম তারিখ'],
    nationality: ['nationality', 'জাতীয়তা'],
    religion: ['religion', 'ধর্ম'],
    gender: ['gender', 'sex', 'লিঙ্গ'],
    nationalIdStatus: ['national id', 'nid', 'জাতীয় পরিচয়পত্র'],
    nationalId: ['national id number', 'nid number', 'nid no', 'জাতীয় পরিচয়পত্র নম্বর', 'জাতীয় পরিচয়পত্র নং'],
    birthRegistrationStatus: ['birth registration', 'জন্ম নিবন্ধন'],
    birthRegistration: ['birth registration number', 'birth reg no', 'জন্ম নিবন্ধন নম্বর', 'জন্ম নিবন্ধন নং'],
    passportId: ['passport id', 'passport', 'পাসপোর্ট'],
    maritalStatus: ['marital status', 'বৈবাহিক অবস্থা'],
    mobile: ['mobile number', 'mobile', 'phone', 'contact number', 'মোবাইল নম্বর', 'মোবাইল'],
    confirmMobile: ['confirm mobile', 'confirm phone', 'retype mobile', 'confirm mobile number', 'মোবাইল নিশ্চিত', 'মোবাইল নম্বর নিশ্চিত'],
    email: ['email', 'email address', 'ইমেইল'],
    quota: ['quota', 'কোটা'],
    departmentalStatus: ['departmental status', 'বিভাগীয় অবস্থা'],
    photo: ['photo', 'photograph', 'applicant photo', "applicant's photo", 'applicants photo', 'picture', 'image', 'user photo', 'ছবি', 'আবেদনকারীর ছবি', 'ছবি আপলোড'],
    signature: ['signature', 'applicant signature', "applicant's signature", 'applicants signature', 'sign', 'user signature', 'স্বাক্ষর', 'আবেদনকারীর স্বাক্ষর', 'স্বাক্ষর আপলোড'],
    present_careOf: ['care of', 'c/o', 'careof', 'যত্নে', 'অভিভাবক'],
    present_villageRoad: ['village', 'road', 'house', 'flat', 'street', 'holding', 'গ্রাম', 'রাস্তা', 'বাসা', 'গ্রাম/রাস্তা'],
    present_district: ['district', 'present district', 'জেলা'],
    present_upazila: ['upazila', 'upozilla', 'upazilla', 'upozila', 'thana', 'police station', 'p.s.', 'ps', 'p.s. / upazila', 'উপজেলা', 'থানা'],
    present_postOffice: ['post office', 'present post office', 'present post', 'p.o.', 'po', 'post', 'ডাকঘর'],
    present_postCode: ['post code', 'postal code', 'zip', 'zip code', 'পোস্ট কোড'],
    permanent_careOf: ['permanent care of', 'permanent c/o'],
    permanent_villageRoad: ['permanent village', 'permanent road', 'permanent house'],
    permanent_district: ['permanent district', 'স্থায়ী জেলা'],
    permanent_upazila: ['permanent upazila', 'permanent upozilla', 'permanent upazilla', 'permanent thana', 'স্থায়ী উপজেলা'],
    permanent_postOffice: ['permanent post office', 'permanent post', 'permanent p.o.', 'স্থায়ী ডাকঘর'],
    permanent_postCode: ['permanent post code', 'permanent postal code', 'স্থায়ী পোস্ট কোড'],
    ssc_exam: ['ssc examination', 'ssc exam', 'examination'],
    ssc_board: ['ssc board', 'board'],
    ssc_roll: ['ssc roll', 'roll no', 'roll number'],
    ssc_resultType: ['ssc result', 'result type'],
    ssc_resultValue: ['gpa score', 'result value', 'grade point', 'result', 'gpa'],
    ssc_group: ['ssc group', 'group subject', 'group'],
    ssc_year: ['ssc passing year', 'passing year', 'year of passing'],
    hsc_exam: ['hsc examination', 'hsc exam', 'examination'],
    hsc_board: ['hsc board', 'board'],
    hsc_roll: ['hsc roll', 'roll no', 'roll number'],
    hsc_resultType: ['hsc result', 'result type'],
    hsc_resultValue: ['gpa score', 'result value', 'grade point', 'result', 'gpa'],
    hsc_group: ['hsc group', 'group subject', 'group'],
    hsc_year: ['hsc passing year', 'passing year', 'year of passing'],
    graduation_exam: ['graduation examination', 'graduation exam', 'degree examination', 'examination', 'degree exam', 'exam'],
    graduation_board: ['university', 'university institute', 'institution', 'university inst', 'university/inst', 'university/inst.', 'institute', 'board'],
    graduation_resultType: ['graduation result', 'result type', 'degree result', 'result'],
    graduation_resultValue: ['cgpa score', 'result value', 'grade point', 'result', 'cgpa', 'gpa'],
    graduation_group: ['subject degree', 'graduation subject', 'discipline', 'subject/degree', 'subject', 'degree', 'major', 'group'],
    graduation_year: ['graduation passing year', 'passing year', 'year of passing', 'year'],
    graduation_duration: ['course duration', 'duration'],
    graduationApplicable: ['graduation applicable', 'if applicable'],
    masters_exam: ['masters examination', 'masters exam', 'post graduation', 'examination', 'masters', 'exam'],
    masters_board: ['university', 'university institute', 'institution', 'university inst', 'university/inst', 'university/inst.', 'institute', 'board'],
    masters_resultType: ['masters result', 'result type', 'result'],
    masters_resultValue: ['cgpa score', 'result value', 'grade point', 'result', 'cgpa', 'gpa'],
    masters_group: ['subject degree', 'masters subject', 'subject/degree', 'subject', 'degree', 'discipline', 'major'],
    masters_year: ['masters passing year', 'passing year', 'year of passing', 'year'],
    masters_duration: ['course duration', 'duration'],
    mastersApplicable: ['masters applicable', 'if applicable']
  };

  for (const [key, aliases] of Object.entries({
    employedOn: ['employed on', 'employed'],
    organization: ['organization', 'company', 'employer', 'org name'],
    designation: ['designation', 'designation/post', 'post'],
    workAddress: ['organization address', 'work address', 'address'],
    startDate: ['length of service from', 'start date', 'from date', 'from', 'service from'],
    endDate: ['length of service to', 'end date', 'to date', 'to', 'service to'],
    currentlyWorking: ['currently working', 'currentlyworking'],
    description: ['job description', 'responsibilities', 'description']
  })) {
    for (let i = 0; i < 6; i++) FIELD_META[`experience_${i}_${key}`] = aliases;
  }

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/['’]s\b/g, '')
      .replace(/\bapplicants\b/g, 'applicant')
      .replace(/\bfathers\b/g, 'father')
      .replace(/\bmothers\b/g, 'mother')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9\u0980-\u09ff]+/g, ' ')
      .trim();
  }

  const compact = s => norm(s).replace(/\s/g, '');

  function labelsFor(el) {
    const out = [
      el.name,
      el.id,
      el.placeholder,
      el.getAttribute('aria-label'),
      el.getAttribute('title')
    ];

    if (el.id) {
      try {
        const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (l) out.push(l.innerText);
      } catch (_) {}
    }

    const p = el.closest('label');
    if (p) out.push(p.innerText);

    // Direct cell label in table (the cell to the left)
    const td = el.closest('td');
    if (td) {
      const prevTd = td.previousElementSibling;
      if (prevTd) out.push(prevTd.innerText);
    }

    const row = el.closest('tr, .form-group, .row, fieldset');
    if (row) out.push(row.innerText?.slice(0, 200));

    return norm(out.filter(Boolean).join(' '));
  }

  function match(el, profile) {
    if (!profile) return null;
    const text = labelsFor(el);
    const idName = `${el.name || ''} ${el.id || ''}`.toLowerCase();
    const isFileInput = el.type === 'file';

    // File input matching
    if (isFileInput) {
      if (profile.photo?.dataUrl && (text.includes('photo') || text.includes('picture') || text.includes('image') || text.includes('ছবি') || idName.includes('photo') || idName.includes('pic'))) {
        return 'photo';
      }
      if (profile.signature?.dataUrl && (text.includes('signature') || text.includes('sign') || text.includes('স্বাক্ষর') || idName.includes('sign') || idName.includes('sig'))) {
        return 'signature';
      }
      return null;
    }

    // Determine section scope (SSC vs HSC vs Graduation vs Masters vs Experience, Present vs Permanent)
    let scope = '';
    for (let node = el.parentElement, depth = 0; node && depth < 8; node = node.parentElement, depth++) {
      const banner = node.querySelector?.(':scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4, .section-title, th, td[class*="head"], td[class*="title"], div[class*="head"], div[class*="title"]');
      if (banner) {
        const bText = norm(banner.innerText);
        if (bText.includes('graduation') || bText.includes('masters') || bText.includes('ssc') || bText.includes('hsc') || bText.includes('experience') || bText.includes('present') || bText.includes('permanent')) {
          scope = bText;
          break;
        }
      }
      const prev = node.previousElementSibling;
      if (prev) {
        const pText = norm(prev.innerText);
        if (pText.includes('graduation') || pText.includes('masters') || pText.includes('ssc') || pText.includes('hsc') || pText.includes('experience')) {
          scope = pText;
          break;
        }
      }
    }

    // Check Personal Select dropdowns first (Departmental Status, Quota, Marital Status, Religion, Gender)
    if (el.tagName === 'SELECT') {
      if (idName.includes('dept') || idName.includes('departmental') || text.includes('departmental') || text.includes('বিভাগীয়')) {
        return profile.departmentalStatus ? 'departmentalStatus' : null;
      }
      if (idName.includes('quota') || text.includes('quota') || text.includes('কোটা')) {
        return profile.quota ? 'quota' : null;
      }
      if (idName.includes('marital') || text.includes('marital') || text.includes('বৈবাহিক')) {
        return profile.maritalStatus ? 'maritalStatus' : null;
      }
      if (idName.includes('religion') || text.includes('religion') || text.includes('ধর্ম')) {
        return profile.religion ? 'religion' : null;
      }
      if (idName.includes('gender') || idName.includes('sex') || text.includes('gender') || text.includes('sex') || text.includes('লিঙ্গ')) {
        return profile.gender ? 'gender' : null;
      }
      if (profile.dateOfBirth) {
        if (idName === 'b_day' || idName === 'bday' || idName === 'day' && scope.includes('birth')) {
          return 'dob_day';
        }
        if (idName === 'b_month' || idName === 'bmonth' || idName === 'month' && scope.includes('birth')) {
          return 'dob_month';
        }
        if (idName === 'b_year' || idName === 'byear' || idName === 'year' && scope.includes('birth')) {
          return 'dob_year';
        }
      }
    }

    // Check permanent vs present
    const isPermanent = idName.includes('permanent') || idName.includes('per_') || scope.includes('permanent address');
    const addrPrefix = isPermanent ? 'permanent_' : 'present_';

    // 1. Explicit Disambiguation for Address Fields: District, Upazila/Thana, Post Office, Post Code
    const isDistrict = el.tagName === 'SELECT' && (idName.includes('district') || text.includes('district') || text.includes('জেলা'));
    if (isDistrict) {
      const key = `${addrPrefix}district`;
      if (profile[key]) return key;
    }

    const isUpazila = (
      idName.includes('upazila') || idName.includes('upozilla') || idName.includes('upazilla') ||
      idName.includes('thana') || /(?:^|_)(?:ps|thana|upazila|upozilla)(?:_|$)/i.test(idName) ||
      text.includes('upazila') || text.includes('upozilla') || text.includes('upazilla') ||
      text.includes('thana') || text.includes('উপজেলা') || text.includes('থানা') ||
      /\bp\.?s\.?\b/i.test(text)
    ) && !idName.includes('dept') && !text.includes('department') && !idName.includes('status');
    if (isUpazila) {
      const key = `${addrPrefix}upazila`;
      if (profile[key]) return key;
    }

    const isPostCode = idName.includes('code') || idName.includes('zip') || text.includes('post code') || text.includes('postal code') || text.includes('পোস্ট কোড');
    if (isPostCode) {
      const key = `${addrPrefix}postCode`;
      if (profile[key]) return key;
    }

    const isPostOffice = !isPostCode && (idName.includes('post') || text.includes('post office') || text.includes('ডাকঘর') || text.includes('p.o'));
    if (isPostOffice) {
      const key = `${addrPrefix}postOffice`;
      if (profile[key]) return key;
    }

    // 2. Specific check for Applicant's Name vs Father's Name vs Mother's Name
    const isBangla = text.includes('bangla') || text.includes('বাংলা');
    const isFather = text.includes('father') || text.includes('পিতা') || text.includes('বাবা') || idName.includes('father') || idName.includes('f_name');
    const isMother = text.includes('mother') || text.includes('মাতা') || text.includes('মা') || idName.includes('mother') || idName.includes('m_name');

    if (!isFather && !isMother) {
      const isApplicantName = text.includes('applicant name') ||
                              text.includes('name of applicant') ||
                              text.includes('candidate name') ||
                              text.includes('full name') ||
                              text.includes('আবেদনকারীর নাম') ||
                              text.includes('প্রার্থীর নাম') ||
                              idName === 'name' ||
                              idName.includes('applicant_name') ||
                              idName.includes('p_name');
      if (isApplicantName) {
        if (isBangla && profile.applicantNameBn) return 'applicantNameBn';
        if (!isBangla && profile.applicantName) return 'applicantName';
      }
    }

    // 3. Explicit Education & Experience section matching (matches Teletalk name prefixes like gra_, mas_, ssc_, hsc_, exp_)
    const isGra = idName.startsWith('gra_') || idName.startsWith('grad_') || idName.includes('graduation') || scope.includes('graduation');
    const isMas = idName.startsWith('mas_') || idName.startsWith('mast_') || idName.includes('masters') || scope.includes('masters');
    const isSsc = idName.startsWith('ssc_') || scope.includes('ssc');
    const isHsc = idName.startsWith('hsc_') || scope.includes('hsc');
    const isExp = idName.startsWith('exp_') || idName.startsWith('job_') || idName.startsWith('emp_') || idName.includes('experience') || scope.includes('experience');

    if (isGra) {
      if (el.type === 'checkbox' && (idName.includes('app') || text.includes('applicable'))) return 'graduationApplicable';
      if (idName.includes('exam') || text.includes('examination')) return 'graduation_exam';
      if (idName.includes('inst') || idName.includes('board') || idName.includes('univ') || text.includes('university') || text.includes('inst')) return 'graduation_board';
      if (idName.includes('sub') || idName.includes('group') || text.includes('subject') || text.includes('degree')) return 'graduation_group';
      if (idName.includes('year') || text.includes('passing year')) return 'graduation_year';
      if (idName.includes('duration') || text.includes('duration')) return 'graduation_duration';
      if (idName.includes('result') && el.tagName === 'SELECT') return 'graduation_resultType';
      if ((idName.includes('cgpa') || idName.includes('gpa') || idName.includes('result')) && el.tagName !== 'SELECT') return 'graduation_resultValue';
    }

    if (isMas) {
      if (el.type === 'checkbox' && (idName.includes('app') || text.includes('applicable'))) return 'mastersApplicable';
      if (idName.includes('exam') || text.includes('examination')) return 'masters_exam';
      if (idName.includes('inst') || idName.includes('board') || idName.includes('univ') || text.includes('university') || text.includes('inst')) return 'masters_board';
      if (idName.includes('sub') || idName.includes('group') || text.includes('subject') || text.includes('degree')) return 'masters_group';
      if (idName.includes('year') || text.includes('passing year')) return 'masters_year';
      if (idName.includes('duration') || text.includes('duration')) return 'masters_duration';
      if (idName.includes('result') && el.tagName === 'SELECT') return 'masters_resultType';
      if ((idName.includes('cgpa') || idName.includes('gpa') || idName.includes('result')) && el.tagName !== 'SELECT') return 'masters_resultValue';
    }

    if (isSsc) {
      if (idName.includes('exam') || text.includes('examination')) return 'ssc_exam';
      if (idName.includes('board') || text.includes('board')) return 'ssc_board';
      if (idName.includes('roll') || text.includes('roll')) return 'ssc_roll';
      if (idName.includes('group') || text.includes('group')) return 'ssc_group';
      if (idName.includes('year') || text.includes('passing year')) return 'ssc_year';
      if (idName.includes('result') && el.tagName === 'SELECT') return 'ssc_resultType';
      if ((idName.includes('gpa') || idName.includes('result')) && el.tagName !== 'SELECT') return 'ssc_resultValue';
    }

    if (isHsc) {
      if (idName.includes('exam') || text.includes('examination')) return 'hsc_exam';
      if (idName.includes('board') || text.includes('board')) return 'hsc_board';
      if (idName.includes('roll') || text.includes('roll')) return 'hsc_roll';
      if (idName.includes('group') || text.includes('group')) return 'hsc_group';
      if (idName.includes('year') || text.includes('passing year')) return 'hsc_year';
      if (idName.includes('result') && el.tagName === 'SELECT') return 'hsc_resultType';
      if ((idName.includes('gpa') || idName.includes('result')) && el.tagName !== 'SELECT') return 'hsc_resultValue';
    }

    if (isExp) {
      if (el.type === 'checkbox' && (idName.includes('app') || text.includes('applicable'))) return 'experienceApplicable';
      if (idName.includes('employ') || text.includes('employed on')) return 'experience_0_employedOn';
      if (idName.includes('org') || text.includes('organization')) return 'experience_0_organization';
      if (idName.includes('desig') || idName.includes('post') || text.includes('designation')) return 'experience_0_designation';
      if (idName.includes('addr') || text.includes('address')) return 'experience_0_workAddress';
      if (idName.includes('from') || idName.includes('start') || text.includes('from')) return 'experience_0_startDate';
      if (idName.includes('to') || idName.includes('end') || text.includes('to')) return 'experience_0_endDate';
      if (el.type === 'checkbox' && (idName.includes('current') || text.includes('currently'))) return 'experience_0_currentlyWorking';
      if (idName.includes('desc') || text.includes('description')) return 'experience_0_description';
    }

    let best = null;
    let score = 0;

    for (const [key, aliases] of Object.entries(FIELD_META)) {
      if (key === 'photo' || key === 'signature') continue;
      if (profile[key] === undefined || profile[key] === '' || (typeof profile[key] === 'boolean' && !profile[key])) continue;

      if ((key === 'nationalIdStatus' || key === 'birthRegistrationStatus' || key === 'passportId') && el.tagName !== 'SELECT') continue;
      if ((key === 'nationalId' || key === 'birthRegistration') && el.tagName === 'SELECT') continue;
      if (key.endsWith('resultType') && el.tagName !== 'SELECT') continue;
      if (key.endsWith('resultValue') && el.tagName === 'SELECT') continue;
      if (key.endsWith('Applicable') && el.type !== 'checkbox') continue;

      const level = key.split('_')[0];
      if (['ssc', 'hsc', 'graduation', 'masters'].includes(level)) {
        const levels = ['ssc', 'hsc', 'graduation', 'masters'].filter(v => scope.includes(v));
        if (levels.length && !levels.includes(level)) continue;
      }

      if (key.startsWith('present_') && isPermanent) continue;
      if (key.startsWith('permanent_') && !isPermanent) continue;

      let keyScore = compact(idName).includes(compact(key)) ? 100 : 0;
      for (const alias of aliases) {
        const a = norm(alias);
        if (text === a || text.includes(a)) {
          keyScore = Math.max(keyScore, a.length + (text.startsWith(a) ? 10 : 0));
        }
      }

      if (keyScore > score) {
        best = key;
        score = keyScore;
      }
    }

    return best;
  }

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const ACADEMIC_ALIASES = {
    ru: 'university of rajshahi',
    du: 'university of dhaka',
    cu: 'university of chittagong',
    buet: 'bangladesh university of engineering',
    ruet: 'rajshahi university of engineering',
    cuet: 'chittagong university of engineering',
    kuet: 'khulna university of engineering',
    duet: 'dhaka university of engineering',
    sust: 'shahjalal university of science',
    butex: 'bangladesh university of textiles',
    nsu: 'north south university',
    brac: 'brac university',
    aiub: 'american international university',
    diu: 'daffodil international university',
    uiu: 'united international university',
    aust: 'ahsanullah university',
    iut: 'islamic university of technology',
    cse: 'computer science engineering',
    eee: 'electrical electronic engineering',
    me: 'mechanical engineering',
    ce: 'civil engineering',
    bba: 'business administration',
    mba: 'business administration'
  };

  function findBestOption(selectEl, value) {
    if (!value) return null;
    const cleanVal = String(value || '').replace(/&/g, ' and ');
    const wantedNorm = norm(cleanVal);
    const wantedCompact = compact(cleanVal);
    const wantedCanon = canonicalDistrict(wantedNorm);
    const options = [...selectEl.options];

    // 1. Exact match
    let found = options.find(o => {
      const vNorm = norm(String(o.value || '').replace(/&/g, ' and '));
      const tNorm = norm(String(o.textContent || '').replace(/&/g, ' and '));
      return vNorm === wantedNorm || tNorm === wantedNorm ||
             compact(o.value) === wantedCompact || compact(o.textContent) === wantedCompact;
    });
    if (found) return found;

    // 2. Canonical district mapping (e.g. Bogra <-> Bogura, Chittagong <-> Chattogram)
    found = options.find(o => {
      const tCanon = canonicalDistrict(norm(o.textContent));
      const vCanon = canonicalDistrict(norm(o.value));
      return tCanon === wantedCanon || vCanon === wantedCanon || tCanon === wantedNorm;
    });
    if (found) return found;

    const meaningful = options.filter(o => o.value && !norm(o.textContent).startsWith('select') && !norm(o.textContent).startsWith('choose'));

    // 3. Academic acronym / alias expansion (e.g. "RU" -> "University of Rajshahi", "CSE" -> "Computer Science & Engineering")
    if (ACADEMIC_ALIASES[wantedNorm]) {
      const expanded = ACADEMIC_ALIASES[wantedNorm];
      found = meaningful.find(o => {
        const tNorm = norm(String(o.textContent || '').replace(/&/g, ' and '));
        return tNorm.includes(expanded) || expanded.includes(tNorm);
      });
      if (found) return found;
    }

    // 4. Substring match on valid options
    found = meaningful.find(o => {
      const tNorm = norm(String(o.textContent || '').replace(/&/g, ' and '));
      return tNorm === wantedNorm || tNorm.startsWith(wantedNorm) || tNorm.endsWith(wantedNorm) || tNorm.includes(wantedNorm) || wantedNorm.includes(tNorm);
    });
    if (found) return found;

    // 4b. Number with leading zero normalization (e.g. "04 Years" vs "4 Years", "01" vs "1")
    const wantedZeroTrimmed = wantedNorm.replace(/\b0+(\d+)\b/g, '$1');
    found = meaningful.find(o => {
      const tNorm = norm(String(o.textContent || '')).replace(/\b0+(\d+)\b/g, '$1');
      return tNorm === wantedZeroTrimmed || tNorm.includes(wantedZeroTrimmed) || wantedZeroTrimmed.includes(tNorm);
    });
    if (found) return found;

    // 5. Token overlap score (best matching university or discipline)
    const wantedTokens = wantedNorm.split(/\s+/).filter(tok => tok.length > 2 && tok !== 'and' && tok !== 'the' && tok !== 'for' && tok !== 'of');
    if (wantedTokens.length) {
      let bestOpt = null;
      let maxScore = 0;
      for (const o of meaningful) {
        const tNorm = norm(String(o.textContent || '').replace(/&/g, ' and '));
        let score = 0;
        for (const tok of wantedTokens) {
          if (tNorm.includes(tok)) score++;
        }
        if (score > maxScore) {
          maxScore = score;
          bestOpt = o;
        }
      }
      if (bestOpt && maxScore >= Math.min(2, wantedTokens.length)) {
        return bestOpt;
      }
    }

    // 6. If no exact/token match found, but dropdown has "Other" or "Others"
    const otherOpt = meaningful.find(o => {
      const t = norm(o.textContent);
      return t === 'other' || t === 'others';
    });
    if (otherOpt) return otherOpt;

    return null;
  }

  function waitForSelectOptions(selectEl, timeoutMs = 3000) {
    return new Promise(resolve => {
      if (selectEl.options.length > 1) return resolve(true);

      let timer;
      let interval;
      const observer = new MutationObserver(() => {
        if (selectEl.options.length > 1) {
          clearTimeout(timer);
          clearInterval(interval);
          observer.disconnect();
          resolve(true);
        }
      });
      observer.observe(selectEl, { childList: true, subtree: true });

      interval = setInterval(() => {
        if (selectEl.options.length > 1) {
          clearTimeout(timer);
          clearInterval(interval);
          observer.disconnect();
          resolve(true);
        }
      }, 70);

      timer = setTimeout(() => {
        clearInterval(interval);
        observer.disconnect();
        resolve(selectEl.options.length > 1);
      }, timeoutMs);
    });
  }

  function unblockApplicableSections(profile) {
    if (!profile) return;

    // 1. Graduation
    if (profile.graduation_exam || profile.graduation_board || profile.graduationApplicable) {
      const graCb = document.querySelector('input[type="checkbox"][name*="gra_app"], input[type="checkbox"][id*="gra_app"], input[type="checkbox"][name*="grad_app"], input[type="checkbox"][id*="grad_app"]');
      if (graCb && !graCb.checked) {
        try { graCb.click(); } catch (_) {}
        graCb.checked = true;
        graCb.dispatchEvent(new Event('input', { bubbles: true }));
        graCb.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelectorAll('[name*="gra_"], [id*="gra_"], [name*="grad_"], [id*="grad_"]').forEach(el => {
        el.disabled = false;
      });
    }

    // 2. Masters
    if (profile.masters_exam || profile.masters_board || profile.mastersApplicable) {
      const masCb = document.querySelector('input[type="checkbox"][name*="mas_app"], input[type="checkbox"][id*="mas_app"], input[type="checkbox"][name*="mast_app"], input[type="checkbox"][id*="mast_app"]');
      if (masCb && !masCb.checked) {
        try { masCb.click(); } catch (_) {}
        masCb.checked = true;
        masCb.dispatchEvent(new Event('input', { bubbles: true }));
        masCb.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelectorAll('[name*="mas_"], [id*="mas_"], [name*="mast_"], [id*="mast_"]').forEach(el => {
        el.disabled = false;
      });
    }

    // 3. Job Experience
    const exps = profile.experiences || [];
    const hasExp = exps.some(e => e.organization || e.designation || e.employedOn);
    if (hasExp) {
      const expCb = document.querySelector('input[type="checkbox"][name*="exp_app"], input[type="checkbox"][id*="exp_app"], input[type="checkbox"][name*="job_app"], input[type="checkbox"][id*="job_app"]');
      if (expCb && !expCb.checked) {
        try { expCb.click(); } catch (_) {}
        expCb.checked = true;
        expCb.dispatchEvent(new Event('input', { bubbles: true }));
        expCb.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.querySelectorAll('[name*="exp_"], [id*="exp_"], [name*="employed_"], [name*="emp_"], [name*="org_"], [name*="post"]').forEach(el => {
        el.disabled = false;
      });
    }
  }

  function fillValue(el, value) {
    if (el.readOnly) return false;
    if (el.disabled) el.disabled = false;

    if (el.type === 'file') {
      if (!value || typeof value !== 'object' || !value.dataUrl) return false;
      try {
        const file = dataURLtoFile(value.dataUrl, value.name || 'upload.jpg');
        const dt = new DataTransfer();
        dt.items.add(file);
        el.files = dt.files;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (err) {
        console.warn('Formfill: File input assignment failed', err);
        return false;
      }
    }

    if (el.type === 'checkbox') {
      el.checked = !!value;
    } else if (el.tagName === 'SELECT') {
      const option = findBestOption(el, value);
      if (!option) return false;
      el.value = option.value;
      option.selected = true;
    } else {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
      if (setter) setter.call(el, value);
      else el.value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));

    // Trigger jQuery change event if present on Teletalk
    if (window.$ && typeof window.$(el).trigger === 'function') {
      try { window.$(el).trigger('change'); } catch (_) {}
    }

    return true;
  }

  /* ---------------- UI Stylesheet Injection ---------------- */

  const style = document.createElement('style');
  style.id = 'formfill-bd-injected-styles';
  style.textContent = `
    #formfill-bd-offer, #formfill-bd-preview {
      all: initial;
      position: fixed;
      z-index: 2147483647;
      right: 20px;
      bottom: 20px;
      width: 320px;
      max-height: 80vh;
      overflow: auto;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #cce2d5;
      border-radius: 14px;
      box-shadow: 0 10px 36px rgba(24, 60, 42, 0.22);
      color: #1a3327;
      font: 14px 'Segoe UI', Arial, sans-serif;
    }
    #formfill-bd-offer .ff-head, #formfill-bd-preview .ff-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #157954;
      font-size: 15px;
      margin-bottom: 8px;
    }
    #formfill-bd-offer button, #formfill-bd-preview button {
      font: inherit;
      cursor: pointer;
    }
    #formfill-bd-offer [data-close], #formfill-bd-preview [data-close] {
      border: 0;
      background: none;
      font-size: 22px;
      line-height: 1;
      color: #6a7c74;
      padding: 2px 6px;
    }
    #formfill-bd-offer [data-close]:hover, #formfill-bd-preview [data-close]:hover {
      color: #1a3327;
    }
    .ff-person-row {
      margin: 8px 0 12px;
      padding: 8px 10px;
      background: #f1f8f4;
      border: 1px solid #d4ebd9;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ff-person-row label {
      font-size: 11px;
      font-weight: 700;
      color: #266b4d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ff-person-row select {
      width: 100%;
      padding: 6px 8px;
      border-radius: 6px;
      border: 1px solid #aed6be;
      background: #fff;
      color: #133927;
      font-weight: 600;
      font-size: 13px;
      outline: none;
    }
    #formfill-bd-offer p, #formfill-bd-preview p {
      font-size: 13px;
      line-height: 1.45;
      margin: 8px 0 12px;
      color: #4b6256;
    }
    #formfill-bd-offer [data-fill], #formfill-bd-preview [data-confirm] {
      background: #187c5b;
      color: #fff;
      border: 0;
      border-radius: 8px;
      padding: 10px 14px;
      font-weight: 600;
      width: 100%;
      transition: background 0.15s;
    }
    #formfill-bd-offer [data-fill]:hover, #formfill-bd-preview [data-confirm]:hover {
      background: #12684b;
    }
    #formfill-bd-preview .ff-list {
      max-height: 42vh;
      overflow-y: auto;
      margin: 10px 0 14px;
      padding-right: 4px;
    }
    #formfill-bd-preview label.ff-item {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 6px 2px;
      border-bottom: 1px solid #edf3ef;
      font-size: 12px;
      line-height: 1.35;
      cursor: pointer;
    }
    #formfill-bd-preview label.ff-item:hover {
      background: #f7faf8;
    }
    #formfill-bd-preview input[type="checkbox"] {
      accent-color: #187c5b;
      margin-top: 2px;
    }

    /* Floating In-Field Auto-Suggestion Box */
    #formfill-suggestion-chip {
      all: initial;
      position: absolute;
      z-index: 2147483647;
      background: #ffffff;
      border: 1.5px solid #187c5b;
      border-radius: 10px;
      padding: 6px 10px;
      box-shadow: 0 6px 24px rgba(20, 50, 35, 0.25);
      color: #183325;
      font: 13px 'Segoe UI', Arial, sans-serif;
      display: flex;
      align-items: center;
      gap: 8px;
      max-width: 380px;
      cursor: pointer;
      animation: ffFadeIn 0.15s ease-out;
    }
    @keyframes ffFadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #formfill-suggestion-chip:hover {
      background: #edf8f2;
    }
    #formfill-suggestion-chip .ff-sugg-icon {
      font-size: 15px;
      flex-shrink: 0;
    }
    #formfill-suggestion-chip .ff-sugg-content {
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow: hidden;
    }
    #formfill-suggestion-chip .ff-sugg-val {
      font-weight: 700;
      color: #0e4e37;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #formfill-suggestion-chip .ff-sugg-label {
      font-size: 10px;
      color: #63776d;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    #formfill-suggestion-chip .ff-sugg-close {
      border: 0;
      background: none;
      font-size: 16px;
      color: #8fa097;
      cursor: pointer;
      padding: 0 2px;
      margin-left: 4px;
    }
    #formfill-suggestion-chip .ff-sugg-close:hover {
      color: #b53838;
    }
  `;
  document.documentElement.append(style);

  function removeUi() {
    document.querySelector('#formfill-bd-offer')?.remove();
    document.querySelector('#formfill-bd-preview')?.remove();
    hideSuggestion();
  }

  function showToast(count) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;z-index:2147483647;bottom:20px;right:20px;background:#133c2c;color:white;padding:12px 18px;border-radius:10px;font:13px "Segoe UI",Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,0.25);';
    el.textContent = `Filled ${count} field${count === 1 ? '' : 's'} successfully.`;
    document.documentElement.append(el);
    setTimeout(() => el.remove(), 4000);
  }

  /* ---------------- Person Switcher & Form Scanning ---------------- */

  async function getFullState() {
    const state = await chrome.storage.local.get(['autofillEnabled', 'profiles', 'activeProfileId', 'formfillProfile']);
    let profiles = state.profiles || [];
    let activeId = state.activeProfileId;
    const legacy = state.formfillProfile || {};

    if (!Array.isArray(profiles) || profiles.length === 0) {
      const id = 'prof_' + Date.now();
      const initial = { id, name: legacy.applicantName || 'Person 1', ...legacy };
      profiles = [initial];
      activeId = id;
    } else if (!activeId || !profiles.some(p => p.id === activeId)) {
      activeId = profiles[0].id;
    }

    const activeProfile = profiles.find(p => p.id === activeId) || profiles[0] || {};
    if (activeProfile.sameAddress) {
      for (const k of ['careOf', 'villageRoad', 'district', 'upazila', 'postOffice', 'postCode']) {
        activeProfile[`permanent_${k}`] = activeProfile[`present_${k}`];
      }
    }

    return {
      autofillEnabled: !!state.autofillEnabled,
      profiles,
      activeProfileId: activeId,
      activeProfile
    };
  }

  function getMatchesForProfile(profile) {
    const elements = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')];
    const matches = [];
    for (const el of elements) {
      const key = match(el, profile);
      if (key) matches.push([el, key]);
    }
    return matches;
  }

  async function switchActivePerson(newProfileId) {
    const { profiles } = await getFullState();
    const chosen = profiles.find(p => p.id === newProfileId);
    if (!chosen) return;
    await chrome.storage.local.set({
      activeProfileId: chosen.id,
      formfillProfile: chosen
    });
    removeUi();
    scan();
  }

  function offer(matches, profiles, activeProfileId) {
    document.querySelector('#formfill-bd-offer')?.remove();
    const box = document.createElement('aside');
    box.id = 'formfill-bd-offer';

    let optionsHtml = '';
    for (const prof of profiles) {
      const isSel = prof.id === activeProfileId ? 'selected' : '';
      optionsHtml += `<option value="${prof.id}" ${isSel}>👤 ${prof.name || prof.applicantName || 'Unnamed'}</option>`;
    }

    box.innerHTML = `
      <div class="ff-head">
        <b>Formfill Teletalk</b>
        <button type="button" data-close aria-label="Close">×</button>
      </div>
      <div class="ff-person-row">
        <label for="ff-offer-person">Filling for person:</label>
        <select id="ff-offer-person">${optionsHtml}</select>
      </div>
      <p id="ff-offer-count">Found ${matches.length} fields matching this applicant.</p>
      <button type="button" data-fill>Review &amp; fill</button>
    `;

    document.documentElement.append(box);

    const personSelect = box.querySelector('#ff-offer-person');
    personSelect.onchange = () => switchActivePerson(personSelect.value);

    box.querySelector('[data-close]').onclick = removeUi;
    box.querySelector('[data-fill]').onclick = () => preview(matches, profiles, activeProfileId);
  }

  async function preview(matches, profiles, activeProfileId) {
    const { autofillEnabled, activeProfile } = await getFullState();
    if (!autofillEnabled) {
      removeUi();
      return;
    }

    document.querySelector('#formfill-bd-offer')?.remove();
    document.querySelector('#formfill-bd-preview')?.remove();

    const panel = document.createElement('aside');
    panel.id = 'formfill-bd-preview';

    let optionsHtml = '';
    for (const prof of profiles) {
      const isSel = prof.id === activeProfileId ? 'selected' : '';
      optionsHtml += `<option value="${prof.id}" ${isSel}>👤 ${prof.name || prof.applicantName || 'Unnamed'}</option>`;
    }

    panel.innerHTML = `
      <div class="ff-head">
        <b>Review matched fields</b>
        <button type="button" data-close aria-label="Close">×</button>
      </div>
      <div class="ff-person-row">
        <label for="ff-preview-person">Filling for person:</label>
        <select id="ff-preview-person">${optionsHtml}</select>
      </div>
      <p>Select the details you want to fill into the form:</p>
      <div class="ff-list"></div>
      <button type="button" data-confirm>Fill selected fields</button>
    `;

    document.documentElement.append(panel);

    const personSelect = panel.querySelector('#ff-preview-person');
    personSelect.onchange = () => switchActivePerson(personSelect.value);

    unblockApplicableSections(activeProfile);
    const list = panel.querySelector('.ff-list');
    for (const [el, key] of matches) {
      if (el.readOnly) continue;
      if (el.disabled) el.disabled = false;
      const row = document.createElement('label');
      row.className = 'ff-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.dataset.key = key;

      const caption = document.createElement('span');
      const labelName = FIELD_META[key]?.[0] || key;
      let displayVal = activeProfile[key];
      if (key === 'photo') {
        displayVal = `📷 Photo (${activeProfile.photo?.name || 'attached'})`;
      } else if (key === 'signature') {
        displayVal = `✍️ Signature (${activeProfile.signature?.name || 'attached'})`;
      }
      caption.textContent = `${labelName}: ${displayVal}`;

      row.append(cb, caption);
      list.append(row);
    }

    panel.querySelector('[data-close]').onclick = removeUi;
    panel.querySelector('[data-confirm]').onclick = async () => {
      let filled = 0;
      const checkedKeys = [...list.querySelectorAll('input:checked')].map(cb => cb.dataset.key);

      // Present Address Cascade: District -> wait for Upazila -> Upazila -> wait for Post Office -> Post Office
      if (checkedKeys.includes('present_district')) {
        const pair = matches.find(p => p[1] === 'present_district');
        if (pair?.[0] && fillValue(pair[0], activeProfile.present_district)) {
          pair[0].dataset.formfillKey = 'present_district';
          filled++;
          const upazilaPair = matches.find(p => p[1] === 'present_upazila');
          if (upazilaPair?.[0] && upazilaPair[0].tagName === 'SELECT') {
            await waitForSelectOptions(upazilaPair[0], 2500);
          }
        }
      }

      if (checkedKeys.includes('present_upazila')) {
        const pair = matches.find(p => p[1] === 'present_upazila');
        if (pair?.[0]) {
          if (pair[0].tagName === 'SELECT' && pair[0].options.length <= 1) {
            await waitForSelectOptions(pair[0], 2000);
          }
          if (fillValue(pair[0], activeProfile.present_upazila)) {
            pair[0].dataset.formfillKey = 'present_upazila';
            filled++;
            const postPair = matches.find(p => p[1] === 'present_postOffice');
            if (postPair?.[0] && postPair[0].tagName === 'SELECT') {
              await waitForSelectOptions(postPair[0], 1500);
            }
          }
        }
      }

      // Permanent Address Cascade
      if (checkedKeys.includes('permanent_district')) {
        const pair = matches.find(p => p[1] === 'permanent_district');
        if (pair?.[0] && fillValue(pair[0], activeProfile.permanent_district)) {
          pair[0].dataset.formfillKey = 'permanent_district';
          filled++;
          const upazilaPair = matches.find(p => p[1] === 'permanent_upazila');
          if (upazilaPair?.[0] && upazilaPair[0].tagName === 'SELECT') {
            await waitForSelectOptions(upazilaPair[0], 2500);
          }
        }
      }

      if (checkedKeys.includes('permanent_upazila')) {
        const pair = matches.find(p => p[1] === 'permanent_upazila');
        if (pair?.[0]) {
          if (pair[0].tagName === 'SELECT' && pair[0].options.length <= 1) {
            await waitForSelectOptions(pair[0], 2000);
          }
          if (fillValue(pair[0], activeProfile.permanent_upazila)) {
            pair[0].dataset.formfillKey = 'permanent_upazila';
            filled++;
            const postPair = matches.find(p => p[1] === 'permanent_postOffice');
            if (postPair?.[0] && postPair[0].tagName === 'SELECT') {
              await waitForSelectOptions(postPair[0], 1500);
            }
          }
        }
      }

      // Now fill remaining fields
      const handled = ['present_district', 'present_upazila', 'permanent_district', 'permanent_upazila'];
      for (const key of checkedKeys) {
        if (handled.includes(key)) continue;
        const pair = matches.find(p => p[1] === key);
        const el = pair?.[0];
        if (!el || !el.isConnected) continue;

        const val = activeProfile[key];
        if (fillValue(el, val)) {
          el.dataset.formfillKey = key;
          el.dataset.formfillOriginal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          filled++;
        }
      }

      removeUi();
      if (filled) showToast(filled);
    };
  }

  async function scan() {
    const { autofillEnabled, profiles, activeProfileId, activeProfile } = await getFullState();
    if (!autofillEnabled) return;

    unblockApplicableSections(activeProfile);
    const matches = getMatchesForProfile(activeProfile);
    if (matches.length) {
      offer(matches, profiles, activeProfileId);
    }
  }

  /* ---------------- In-Field Auto-Suggestion ---------------- */

  let activeSuggestionChip = null;
  let currentFocusedElement = null;

  function hideSuggestion() {
    if (activeSuggestionChip) {
      activeSuggestionChip.remove();
      activeSuggestionChip = null;
    }
  }

  function positionSuggestion(el, chip) {
    const rect = el.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = rect.bottom + scrollY + 4;
    let left = rect.left + scrollX;

    if (left + 320 > window.innerWidth) {
      left = Math.max(10, window.innerWidth - 330 + scrollX);
    }

    chip.style.top = `${top}px`;
    chip.style.left = `${left}px`;
  }

  async function handleFieldFocus(e) {
    const el = e.target;
    if (!el || !['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
    if (el.type === 'hidden' || el.readOnly) return;
    if (el.disabled) {
      el.disabled = false;
      const { activeProfile } = await getFullState();
      unblockApplicableSections(activeProfile);
    }

    currentFocusedElement = el;
    const { autofillEnabled, activeProfile } = await getFullState();
    if (!autofillEnabled) return;

    const key = match(el, activeProfile);
    if (!key) {
      hideSuggestion();
      return;
    }

    const val = activeProfile[key];
    const isFile = el.type === 'file';
    if (!isFile && (val === undefined || val === '' || val === null)) {
      hideSuggestion();
      return;
    }
    if (isFile && !val?.dataUrl) {
      hideSuggestion();
      return;
    }

    hideSuggestion();

    const chip = document.createElement('div');
    chip.id = 'formfill-suggestion-chip';

    let displayVal = val;
    let icon = '💡';
    if (key === 'photo') {
      icon = '📷';
      displayVal = `Attach Photo (${val.name || 'photo.jpg'})`;
    } else if (key === 'signature') {
      icon = '✍️';
      displayVal = `Attach Signature (${val.name || 'signature.jpg'})`;
    }

    const personName = activeProfile.name || activeProfile.applicantName || 'Active Person';
    chip.innerHTML = `
      <span class="ff-sugg-icon">${icon}</span>
      <div class="ff-sugg-content">
        <span class="ff-sugg-val">${displayVal}</span>
        <span class="ff-sugg-label">${FIELD_META[key]?.[0] || key} • ${personName}</span>
      </div>
      <button type="button" class="ff-sugg-close" title="Dismiss">×</button>
    `;

    document.documentElement.append(chip);
    activeSuggestionChip = chip;
    positionSuggestion(el, chip);

    chip.querySelector('.ff-sugg-close').onclick = ev => {
      ev.stopPropagation();
      hideSuggestion();
    };

    chip.onmousedown = ev => {
      ev.preventDefault();
    };

    chip.onclick = async ev => {
      ev.stopPropagation();

      // If this is an Upazila dropdown and options haven't loaded yet:
      if (key.endsWith('upazila') && el.tagName === 'SELECT' && el.options.length <= 1) {
        const isPerm = key.startsWith('permanent');
        const distKey = isPerm ? 'permanent_district' : 'present_district';
        const distName = activeProfile[distKey];
        if (distName) {
          // Find district select on page and fill it first
          const distEl = document.querySelector(
            isPerm ? 'select[name*="permanent_district"], select[id*="permanent_district"]' : 'select[name*="present_district"], select[id*="present_district"], select[name="district"], select[name="p_district"]'
          );
          if (distEl) {
            fillValue(distEl, distName);
            chip.querySelector('.ff-sugg-val').textContent = 'Loading Upazilas…';
            await waitForSelectOptions(el, 2500);
          }
        }
      }

      fillValue(el, val);
      el.dataset.formfillKey = key;
      el.dataset.formfillOriginal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      hideSuggestion();
    };
  }

  document.addEventListener('focusin', handleFieldFocus, true);
  document.addEventListener('click', e => {
    if (activeSuggestionChip && !activeSuggestionChip.contains(e.target) && e.target !== currentFocusedElement) {
      hideSuggestion();
    }
  });

  window.addEventListener('resize', () => {
    if (activeSuggestionChip && currentFocusedElement) {
      positionSuggestion(currentFocusedElement, activeSuggestionChip);
    }
  });

  window.addEventListener('scroll', () => {
    if (activeSuggestionChip && currentFocusedElement) {
      positionSuggestion(currentFocusedElement, activeSuggestionChip);
    }
  }, true);

  /* ---------------- Sync Edits back to Profile ---------------- */

  let editTimer;
  document.addEventListener(
    'change',
    async e => {
      const el = e.target;
      const key = el?.dataset?.formfillKey;
      if (!key || el.type === 'file') return;
      if (String(el.value) === el.dataset.formfillOriginal) return;

      const { autofillEnabled } = await getFullState();
      if (!autofillEnabled) return;

      clearTimeout(editTimer);
      editTimer = setTimeout(async () => {
        const active = await chrome.storage.local.get('autofillEnabled');
        if (!active.autofillEnabled) return;

        if (window.confirm('You changed an autofilled value. Update your saved profile with this change?')) {
          chrome.runtime.sendMessage({ type: 'save-profile-field', key, value: el.value });
          el.dataset.formfillOriginal = el.value;
        }
      }, 150);
    },
    true
  );

  /* ---------------- Extension Event Listeners ---------------- */

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.autofillEnabled) {
      if (changes.autofillEnabled.newValue) scan();
      else removeUi();
    } else if (changes.activeProfileId || changes.profiles || changes.formfillProfile) {
      removeUi();
      scan();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }
})();
