const FIELDS = {
  personal: [
    ['applicantName','Applicant’s name','text','নাম (ইংরেজি)'],['applicantNameBn','Applicant’s name (Bangla)','text','আবেদনকারীর নাম (বাংলা)'],
    ['fatherName','Father’s name','text',''],['fatherNameBn','Father’s name (Bangla)','text',''],['motherName','Mother’s name','text',''],['motherNameBn','Mother’s name (Bangla)','text',''],
    ['dateOfBirth','Date of birth','date',''],['nationality','Nationality','select',['Bangladeshi','Other']],['religion','Religion','select',['Islam','Hinduism','Buddhism','Christianity','Other']],['gender','Gender','select',['Male','Female','Other']],
    ['nationalIdStatus','National ID available','select',['Yes','No']],['nationalId','National ID number','text',''],['birthRegistrationStatus','Birth registration available','select',['Yes','No']],['birthRegistration','Birth registration number','text',''],['passportId','Passport ID','select',['Yes','No']],['maritalStatus','Marital status','select',['Single','Married','Divorced','Widowed']],
    ['mobile','Mobile number','tel',''],['confirmMobile','Confirm mobile number','tel',''],['email','Email address','email',''],['quota','Quota','select',['Child of Freedom Fighter','Child of Martyred Freedom Fighter','Child of War Heroine (Birangona)','Physically Challenged','Ethnic Minority','Third Gender','Not Applicable']],['departmentalStatus','Departmental status','select',['Govt. Employee','Semi Govt. Employee','Autonomous','Not Applicable']]
  ],
  address: [['careOf','Care of','text',''],['villageRoad','Village / road / house / flat','text',''],['district','District','text',''],['upazila','Upazila / P.S.','text',''],['postOffice','Post office','text',''],['postCode','Post code','text','']],
  edu: [['exam','Examination','select'],['board','Board / university / institution','select'],['roll','Roll number','text'],['resultType','Result type','select'],['resultValue','Result / GPA','text'],['group','Group / subject / degree','select'],['year','Passing year','select'],['duration','Course duration','select']],
  exp: [['employedOn','Employed on','text'],['organization','Organization','text'],['designation','Designation / post','text'],['workAddress','Address','text'],['startDate','Start date','date'],['endDate','End date','date'],['currentlyWorking','Currently working','checkbox'],['description','Job description','textarea']]
};
function makeField([key,label,type='text',hint='']) {
  const wrap=document.createElement('div'); wrap.className='field';
  const lab=document.createElement('label');lab.htmlFor=key;lab.textContent=label;wrap.append(lab);
  let el;
  if(type==='select'){el=document.createElement('select');el.add(new Option('Choose…',''));(Array.isArray(hint)?hint:[]).forEach(v=>el.add(new Option(v,v)));}
  else if(type==='textarea')el=document.createElement('textarea');
  else {el=document.createElement('input');el.type=type;if(hint)el.placeholder=hint;}
  el.id=key;el.name=key;el.dataset.profileKey=key;wrap.append(el);return wrap;
}
FIELDS.personal.forEach(f=>document.querySelector('#personalFields').append(makeField(f)));
for(const side of ['present','permanent']) FIELDS.address.forEach(([key,label,type,hint])=>document.querySelector(`#${side}Fields`).append(makeField([`${side}_${key}`,label,type,hint])));
for(const level of ['SSC / equivalent','HSC / equivalent','Graduation / equivalent']) {
 const slug=level.split(' ')[0].toLowerCase();const block=document.createElement('div');block.className='education-block';
 const h=document.createElement('h3');h.textContent=level;block.append(h);if(slug==='graduation'){const applicable=document.createElement('label');applicable.className='check-row';applicable.innerHTML='<input type="checkbox" id="graduationApplicable" data-profile-key="graduationApplicable"> If applicable';block.append(applicable);}const grid=document.createElement('div');grid.className='education-grid';
 const choices={exam:slug==='ssc'?['S.S.C.','Dakhil','S.S.C. Vocational','Other']:slug==='hsc'?['H.S.C.','Alim','H.S.C. Vocational','Diploma-in-Engineering','Other']:['B.Sc Engineering','B.Sc (Honours)','B.A.','BSS','BBA','M.A.','M.Sc','Other'],board:['Dhaka','Chattogram','Cumilla','Dinajpur','Jashore','Mymensingh','Rajshahi','Sylhet','Barishal','Madrasah','Technical','University of Rajshahi','Other'],resultType:slug==='graduation'?['CGPA(out of 4)','CGPA(out of 5)','1st Division','2nd Division','3rd Division']:['GPA(out of 5)','GPA(out of 4)','1st Division','2nd Division','3rd Division'],group:['Science','Business Studies','Humanities','General','Computer Science & Engineering','Other'],year:Array.from({length:65},(_,i)=>String(new Date().getFullYear()-i)),duration:['02 Years','03 Years','04 Years','05 Years','Other']};
 FIELDS.edu.forEach(([key,label,type])=>grid.append(makeField([`${slug}_${key}`,label,type,type==='select'?(choices[key]||[]):''])));block.append(grid);document.querySelector('#educationFields').append(block);
}
const expList=document.querySelector('#experienceList');
function addExperience(values={}){const i=expList.children.length;const block=document.createElement('div');block.className='experience-item';block.innerHTML=`<h3>Experience ${i+1}</h3><button type="button" class="remove-experience">Remove</button><div class="education-grid"></div>`;
 const grid=block.querySelector('.education-grid');FIELDS.exp.forEach(([key,label,type])=>grid.append(makeField([`experience_${i}_${key}`,label,type])));block.querySelector('.remove-experience').onclick=()=>{block.remove();renumberExp()};expList.append(block);for(const [key,val] of Object.entries(values)){const input=block.querySelector(`[data-profile-key="${key}"]`);if(input){if(input.type==='checkbox')input.checked=!!val;else input.value=val;}}}
function renumberExp(){[...expList.children].forEach((block,i)=>{block.querySelector('h3').textContent=`Experience ${i+1}`;block.querySelectorAll('[data-profile-key]').forEach(el=>el.dataset.profileKey=el.dataset.profileKey.replace(/^experience_\d+_/ ,`experience_${i}_`));});}
document.querySelector('#addExperience').onclick=()=>addExperience();
const same=document.querySelector('#sameAddress');same.addEventListener('change',()=>{document.querySelector('#permanentWrap').classList.toggle('hidden',same.checked);});
const form=document.querySelector('#profileForm');
function syncIdFields(){for(const [status,number] of [['nationalIdStatus','nationalId'],['birthRegistrationStatus','birthRegistration']]){const control=document.getElementById(status),field=document.getElementById(number)?.closest('.field');if(control&&field)field.classList.toggle('hidden',control.value==='No');}}
for(const id of ['nationalIdStatus','birthRegistrationStatus'])document.getElementById(id).addEventListener('change',syncIdFields);
async function loadProfile(){const {formfillProfile:profile={},autofillEnabled=false}=await chrome.storage.local.get(['formfillProfile','autofillEnabled']);
 for(const el of form.querySelectorAll('[data-profile-key]')){if(profile[el.dataset.profileKey]!==undefined){if(el.type==='checkbox')el.checked=!!profile[el.dataset.profileKey];else el.value=profile[el.dataset.profileKey];}}
 same.checked=!!profile.sameAddress;document.querySelector('#permanentWrap').classList.toggle('hidden',same.checked);syncIdFields();
 const exps=profile.experiences||[];if(exps.length)exps.forEach(v=>addExperience(v));else addExperience();setEnabled(autofillEnabled);
}
function gather(){const data={};for(const el of form.querySelectorAll('[data-profile-key]'))data[el.dataset.profileKey]=el.type==='checkbox'?el.checked:el.value;data.sameAddress=same.checked;if(same.checked)for(const key of ['careOf','villageRoad','district','upazila','postOffice','postCode'])data[`permanent_${key}`]=data[`present_${key}`]||'';
 data.experiences=[...expList.children].map((b)=>{const obj={};b.querySelectorAll('[data-profile-key]').forEach(el=>obj[el.dataset.profileKey.replace(/^experience_\d+_/,'')]=el.type==='checkbox'?el.checked:el.value);return obj;});return data;}
function setEnabled(v){document.querySelector('#mainToggle').checked=v;document.querySelector('#previewToggle').textContent=`Autofill: ${v?'On':'Off'}`;}
async function flipEnabled(input){let enabled=input.checked;if(enabled){const ok=await chrome.permissions.request({origins:['<all_urls>']});if(!ok){input.checked=false;setEnabled(false);return;}}await chrome.storage.local.set({autofillEnabled:enabled});setEnabled(enabled);}
document.querySelector('#mainToggle').addEventListener('change',e=>flipEnabled(e.currentTarget));
document.querySelector('#previewToggle').addEventListener('click',async()=>{const input=document.querySelector('#mainToggle');input.checked=!input.checked;await flipEnabled(input);});
form.addEventListener('submit',async e=>{e.preventDefault();await chrome.storage.local.set({formfillProfile:gather()});const msg=document.querySelector('#saveMessage');msg.textContent='Profile saved on this device.';setTimeout(()=>msg.textContent='',3000);});
document.querySelector('#saveTop').onclick=()=>form.requestSubmit();
if(new URLSearchParams(location.search).has('welcome'))document.querySelector('#welcome').classList.remove('hidden');
loadProfile();
