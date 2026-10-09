const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=k=>JSON.parse(localStorage.getItem(k)||'[]');
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let rate=12,stars=0;
function dl(name,obj){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(obj,null,1)],{type:'application/json'}));a.download=name;a.click()}

function show(id){document.querySelectorAll('.page').forEach(p=>p.style.display=p.id==id?'block':'none');scrollTo(0,0)}

/* ---------- validation rules (return error text, or '' if fine) ---------- */
const R={
 opt:v=>'',
 req:v=>v.trim()?'':'This field is required',
 name:v=>/^[A-Za-z .]{2,}$/.test(v.trim())?'':'Enter a valid name (letters only)',
 email:v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?'':'Enter a valid email like name@mail.com',
 tel:v=>/^\d{10}$/.test(v)?'':'Phone number must be exactly 10 digits',
 age:v=>!v?'Enter your age':v<18?'Age should be 18 or above':v>24?'Age should be 24 or below':'',
 pct:v=>v!==''&&v>=0&&v<=100?'':'Enter a percentage between 0 and 100',
 aadhar:v=>/^\d{12}$/.test(v)?'':'Aadhar number must be exactly 12 digits',
 pan:v=>/^[A-Z]{5}\d{4}[A-Z]$/i.test(v)?'':'PAN must be 10 characters like ABCDE1234F',
 acct:v=>/^\d{9,18}$/.test(v)?'':'Account number must be 9 to 18 digits',
 inc:v=>v>0?'':'Enter your yearly income'
};
function check(el){
 const e=R[el.dataset.r](el.value),good=!e&&el.value!=='';
 $('m_'+el.id).textContent=e;
 el.classList.toggle('bad',!!e);
 el.classList.toggle('ok',good);
 $('t_'+el.id).classList.toggle('on',good);
 return !e;
}

/* ---------- application form (built here to keep the HTML short) ---------- */
function f(s){
 const [id,l,t,r]=s.split('|');
 const cc=id.endsWith('phone')?`<select id="${id}cc"><option>+91</option><option>+1</option><option>+44</option><option>+61</option><option>+971</option></select>`:'';
 return `<div class="f"><label>${l}</label><small class="msg" id="m_${id}"></small><div class="row">${cc}<input id="${id}" type="${t}" data-r="${r}"><span class="tick" id="t_${id}">✔</span></div></div>`;
}
const sec=(t,a)=>`<h3>${t}</h3>`+a.map(f).join('');
function sel(id,l,opts){
 return `<div class="f"><label>${l}</label><small class="msg" id="m_${id}"></small><div class="row"><select id="${id}" data-r="req" style="width:100%"><option value="">Select</option>${opts.map(o=>`<option>${o}</option>`).join('')}</select><span class="tick" id="t_${id}">✔</span></div></div>`;
}

if($('applyForm')){
 const F=$('applyForm');
 F.innerHTML=
  sec('Personal details',['name|Full Name|text|name','email|Email|email|email','phone|Mobile Number|text|tel','age|Age|number|age','p10|Class 10th Percentage|number|pct','p12|Class 12th Percentage|number|pct','aadhar|Aadhar Number|text|aadhar','pan|PAN Number|text|pan','acct|Student Account Number|text|acct','sid|Student ID Card (if applicable)|file|opt'])+
  sec('Parent or guardian',['rel|Relation with you (father, mother, guardian...)|text|req','gname|Guardian Name|text|name','gemail|Guardian Email|email|email','gphone|Guardian Phone|text|tel','gaadhar|Guardian Aadhar Number|text|aadhar','gpan|Guardian PAN Number|text|pan','gacc|Guardian Account Number|text|acct'])+
  sec('Permanent address',['paddr|Permanent Address|text|req'])+
  '<label><input type="checkbox" id="same"> Temporary address is same as permanent address</label>'+
  sec('Temporary address',['taddr|Temporary Address|text|req'])+
  '<h3>Occupation</h3>'+sel('status','Are you a student, working, or both?',['Student','Job','Both'])+
  '<div id="stu" style="display:none">'+f('college|College Name|text|req')+sel('course','Course',['B.Tech','M.Tech','B.Ed','B.Com','B.Sc','BA','BBA','MBA','MBBS','Other'])+'</div>'+
  '<div id="job" style="display:none">'+f('jobtitle|Current Job Title|text|req')+f('income|Income per annum (₹)|number|inc')+'</div>'+
  '<h3>Special academic achievements</h3>'+
  ['JEE Mains','JEE Advanced','NEET','GATE','CAT','Olympiad','Other'].map(a=>`<label><input type="checkbox" class="ach" value="${a}"> ${a}</label><br>`).join('')+'<div id="othbox" style="display:none"><input id="othach" type="text" placeholder="Other achievements (you can list several, separated by commas)"></div>'+
  '<h3>Declaration</h3><small class="msg" id="m_agree"></small><label><input type="checkbox" id="agree"> The information provided by me is correct to the best of my knowledge. If at any point of time any information provided by me is found to be incorrect then I may be subjected to rejection of the applied loan.</label><br><button>Submit</button>';

 F.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.r)check(t);
  if(t.className=='ach'&&t.value=='Other')$('othbox').style.display=t.checked?'block':'none';
  if(t.id=='status'){
   $('stu').style.display=(t.value=='Student'||t.value=='Both')?'block':'none';
   $('job').style.display=(t.value=='Job'||t.value=='Both')?'block':'none';
  }
  if((t.id=='same'||t.id=='paddr')&&$('same').checked){$('taddr').value=$('paddr').value;check($('taddr'))}
 });

 F.onsubmit=e=>{
  e.preventDefault();
  let ok=true;
  F.querySelectorAll('[data-r]').forEach(el=>{if(el.offsetParent&&!check(el))ok=false});
  $('m_agree').textContent=$('agree').checked?'':'Please tick the declaration to continue';
  if(!$('agree').checked)ok=false;
  if(!ok){alert('Please fix the highlighted fields.');return}
  const d={};
  F.querySelectorAll('[data-r]').forEach(el=>{
   if(!el.offsetParent)return;
   const l=el.closest('.f').querySelector('label').textContent;
   let v=el.value;
   if(el.id.endsWith('phone'))v=$(el.id+'cc').value+' '+v;
   if(el.type=='file')v=el.files[0]?el.files[0].name:'Not uploaded';
   d[l]=v;
  });
  const ach=[...F.querySelectorAll('.ach:checked')].map(c=>c.value).filter(v=>v!='Other');
  if(F.querySelector('.ach[value=Other]').checked)ach.push('Other ('+($('othach').value.split(',').map(x=>x.trim()).filter(Boolean).join('; ')||'not specified')+')');
  d['Achievements']=ach.join(', ')||'None';
  window.cur=d;
  $('sum').innerHTML=Object.entries(d).map(([k,v])=>`<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('');
  $('modal').style.display='block';
 };
}
function closeM(){$('modal').style.display='none'}
function finalSubmit(){const bad=dup(window.cur);if(bad){alert(bad);return}save('ascend_applicant',window.cur);location.href='loan.html'}

/* ---------- reviews ---------- */
function setStars(n){stars=n;document.querySelectorAll('#starPick span').forEach((s,i)=>s.classList.toggle('on',i<n))}
function drawReviews(){
 const r=load('ascend_reviews');
 const a=r.length?r.reduce((s,x)=>s+x.s,0)/r.length:0;
 $('avg').textContent=r.length?a.toFixed(1)+' / 5 ('+r.length+' reviews)':'No reviews yet';
 $('avgStars').textContent='★'.repeat(Math.round(a))+'☆'.repeat(5-Math.round(a));
 $('revList').innerHTML=r.map(x=>`<div class="card"><b>${esc(x.n)}</b> <span class="gold">${'★'.repeat(x.s)+'☆'.repeat(5-x.s)}</span><p>${esc(x.c)}</p></div>`).join('');
}
function addReview(){
 const n=$('rname').value.trim()||'Anonymous',c=$('rtext').value.trim();
 if(!stars||!c){alert('Please pick a star rating and write a comment.');return}
 const r=load('ascend_reviews'),item={id:Date.now(),n,c,s:stars};r.push(item);save('ascend_reviews',r);dl('ascend_review_'+item.id+'.json',{type:'review',data:item});
 $('rtext').value='';setStars(0);drawReviews();
}
if($('revList'))drawReviews();

/* ---------- loan page ---------- */
function emi(){
 const P=+$('amt').value,n=+$('ten').value,r=rate/1200;
 const e=P&&n?P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):0;
 $('emi').textContent=e?'Estimated EMI: ₹'+Math.round(e)+' per month at '+rate+'% a year':'';
}
function pick(a,m,r){$('amt').value=a;$('ten').value=m;rate=r;emi();scrollTo(0,0)}

if($('loanForm')){
 const a=JSON.parse(localStorage.getItem('ascend_applicant')||'null');
 let id=sessionStorage.getItem('lid');
 if(!id){id=String(Math.floor(1e9+Math.random()*9e9));sessionStorage.setItem('lid',id)}
 if(!a){
  $('loanBox').innerHTML='<p>Please complete the application form first. <a href="index.html">Go to the form</a></p>';
 }else{
  $('lid').textContent=id;
  $('loanForm').onsubmit=e=>{
   e.preventDefault();
   const bad=dup(a);if(bad){alert(bad);return}
   const r=load('ascend_requests');
   const q={id,applicant:a,loan:{amount:$('amt').value,purpose:$('purpose').value,tenure:$('ten').value,emiOption:$('emiopt').value,bank:$('bank').value,rate},status:'Pending',date:new Date().toLocaleString()};
   q.elig=eligibility(a,+q.loan.amount);q.status=q.elig>=75?'Accepted':q.elig<50?'Rejected':'Pending';if(q.status=='Accepted')ensure(q);
   r.push(q);save('ascend_requests',r);dl('ascend_request_'+id+'.json',{type:'request',data:q});
   $('loanBox').innerHTML=`<h1>Request submitted ✔</h1><p>Your Loan Apply ID is <b>${id}</b>. Keep it safe: you need it to log in.</p><p>Eligibility score: <b>${q.elig}/100</b>. Status: <b class="${q.status}">${q.status}</b>.</p><p>${q.status=='Pending'?'Your request needs a manual review. We will email you once a decision is made.':'Log in to see your loan page.'}</p><a href="index.html#login">Go to login</a>`;
   sessionStorage.removeItem('lid');
  };
 }
}

/* ---------- owner panel ---------- */
function drawAdmin(){
 const r=load('ascend_requests');
 $('status').textContent='Found '+r.length+' request(s) and '+load('ascend_reviews').length+' review(s) in this browser.';
 $('reqs').innerHTML=r.length?r.map((x,i)=>`<div class="card"><h3>ID ${x.id}: ${esc(x.applicant['Full Name'])} <span class="${x.status}">${x.status}</span></h3><p>Eligibility score: ${x.elig??'n/a'}/100</p><p>₹${esc(x.loan.amount)} | ${esc(x.loan.tenure)} months | ${esc(x.loan.purpose)} | ${esc(x.loan.bank)} | ${esc(x.loan.emiOption)}</p><details><summary>All applicant details</summary>${Object.entries(x.applicant).map(([k,v])=>`<p><b>${esc(k)}:</b> ${esc(v)}</p>`).join('')}</details><button onclick="decide(${i},'Accepted')">Accept</button><button class="no" onclick="decide(${i},'Rejected')">Reject</button></div>`).join(''):'<p>No requests yet.</p>';
 drawReviews();
}
function decide(i,s){
 const r=load('ascend_requests'),x=r[i];
 x.status=s;if(s=='Accepted')ensure(x);save('ascend_requests',r);drawAdmin();
 location.href='mailto:'+x.applicant['Email']+'?subject='+encodeURIComponent('Your Ascend loan application '+x.id)+'&body='+encodeURIComponent('Hello '+x.applicant['Full Name']+',\n\nYour loan application (ID '+x.id+') has been '+s.toLowerCase()+'.\n\nTeam Ascend');
}
function adminLogin(){
 if($('pw').value!=='ascend123'){alert('Wrong password');return}
 $('login').style.display='none';$('adminBox').style.display='block';drawAdmin();
}
if($('imp'))$('imp').onchange=async e=>{
 const rq=load('ascend_requests'),rv=load('ascend_reviews');
 for(const f of e.target.files){
  try{
   const o=JSON.parse(await f.text());
   if(o.type=='request'&&!rq.some(x=>x.id==o.data.id))rq.push(o.data);
   if(o.type=='review'&&!rv.some(x=>x.id==o.data.id))rv.push(o.data);
  }catch(err){alert(f.name+' is not a valid Ascend file')}
 }
 save('ascend_requests',rq);save('ascend_reviews',rv);e.target.value='';drawAdmin();
};

function clearAll(){if(confirm('Delete ALL requests, reviews and login data from this browser?')){['ascend_requests','ascend_reviews','ascend_applicant'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();drawAdmin()}}

/* ---------- accounts, credit score, eligibility ---------- */
const DAY=864e5,m2=x=>Math.round(x*100)/100,inr=x=>'\u20B9'+x.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const findReq=id=>load('ascend_requests').find(r=>r.id==id);
function saveReq(r){const a=load('ascend_requests');a[a.findIndex(x=>x.id==r.id)]=r;save('ascend_requests',a)}
function ensure(r){
 if(!r.acct)r.acct={score:100,skew:0,draws:[],dues:[],onTime:0,late:0,log:[]};
 const a=r.acct;
 if(!a.dues){a.dues=[];a.draws.forEach(d=>{if(!d.tenure){d.tenure=1;a.dues.push({n:d.n,k:1,due:d.due,bal:d.bal,missed:!!d.missed,last:d.last})}})}
}
const nowOf=r=>Date.now()+r.acct.skew*DAY;
function note(r,t){r.acct.log.push(new Date(nowOf(r)).toLocaleDateString()+': '+t)}
/* every withdrawal is repaid in monthly installments (due every 30 days).
   Missing an installment: score -5 and 1% penalty per day, compounded daily.
   Dues left unpaid for each further month: score -5 again. */
function sync(r){
 const a=r.acct,t=nowOf(r);
 a.dues.forEach(d=>{
  if(d.bal<=0||t<=d.due)return;
  if(!d.missed){d.missed=true;a.score=Math.max(0,a.score-5);note(r,'Missed installment '+d.k+' of withdrawal #'+d.n+'. Credit score -5')}
  const from=Math.max(d.due,d.last||0),n=Math.floor((t-from)/DAY);
  if(n>0){d.bal=m2(d.bal*Math.pow(1.01,n));d.last=from+n*DAY}
 });
 const od=a.dues.filter(d=>d.missed&&d.bal>0);
 if(od.length){
  const base=Math.min(...od.map(d=>d.due));
  if(a.mbase!==base){a.mbase=base;a.mpen=0}
  const mo=Math.floor((t-base)/(30*DAY));
  while((a.mpen||0)<mo){a.mpen=(a.mpen||0)+1;a.score=Math.max(0,a.score-5);note(r,'Dues still unpaid after '+a.mpen+' month(s). Credit score -5')}
 }else{a.mbase=null;a.mpen=0}
}
const owed=r=>m2(r.acct.dues.reduce((s,d)=>s+d.bal,0));
const overdue=r=>m2(r.acct.dues.filter(d=>d.missed&&d.bal>0).reduce((s,d)=>s+d.bal,0));
function payNow(r){const up=r.acct.dues.find(d=>d.bal>0&&!d.missed);return m2(overdue(r)+(up?up.bal:0))}
const drawn=r=>r.acct.draws.reduce((s,d)=>s+d.amt,0);
/* withdrawal limit depends on repayment HISTORY (not score): starts at 1000, +500 per fully repaid on-time withdrawal, -1000 per late one, max 10000 */
function nextLimit(r){const a=r.acct,over=new Set(a.dues.filter(d=>d.missed&&d.bal>0).map(d=>d.n)).size;return Math.min(10000,Math.max(1000,1000+500*a.onTime-1000*(a.late+over)))}
function room(r){return Math.max(0,m2(Math.min(nextLimit(r),r.loan.amount-drawn(r))-owed(r)))}

/* eligibility score out of 100: loan-to-income 40 + amount 25 + achievements 20 + 10th/12th marks 15. 75+ accept, below 50 reject */
function eligibility(a,amount){
 const inc=+(a['Income per annum (₹)']||0),ach=a['Achievements']||'',ratio=inc?amount/inc:null;
 let p=ratio===null?20:ratio<=.25?40:ratio<=.5?30:ratio<=1?20:8;
 p+=amount<=10000?25:amount<=25000?20:amount<=50000?14:amount<=100000?8:3;
 const W={'JEE Advanced':8,'NEET':8,'GATE':8,'CAT':6,'JEE Mains':5,'Olympiad':5};
 let g=0;for(const k in W)if(ach.includes(k))g+=W[k];
 const o=ach.match(/Other \((.*)\)/);if(o)g+=3*o[1].split(';').length;
 p+=Math.min(g,20);
 p+=((+a['Class 10th Percentage']||0)+(+a['Class 12th Percentage']||0))/2*.15;
 return Math.round(p);
}

/* same identity data cannot take a new loan while an old one is pending or unpaid */
function dup(a){
 const k=x=>[['Email',(x['Email']||'').toLowerCase()],['Mobile Number',(x['Mobile Number']||'').slice(-10)],['Aadhar Number',x['Aadhar Number']],['PAN Number',(x['PAN Number']||'').toUpperCase()],['Student Account Number',x['Student Account Number']]];
 const mine=k(a);
 for(const r of load('ascend_requests')){
  if(r.status=='Rejected')continue;
  if(r.status=='Accepted'){ensure(r);sync(r);if(owed(r)<=0)continue}
  const same=k(r.applicant).filter((p,i)=>p[1]&&p[1]==mine[i][1]).map(p=>p[0]);
  if(same.length)return 'You cannot apply for a new loan: an existing request or loan (ID '+r.id+') has the same '+same.join(', ')+'. Please repay it fully first.';
 }
 return '';
}

/* ---------- login with Loan ID + OTP (demo: OTP is shown on screen) ---------- */
function sendOtp(){
 const id=$('lid2').value.trim(),r=findReq(id);
 if(!r){alert('No application with this Loan ID was found in this browser.');return}
 const code=String(Math.floor(1e5+Math.random()*9e5));
 sessionStorage.setItem('otp',JSON.stringify({id,code,exp:Date.now()+3e5}));
 const e=(r.applicant['Email']||'').replace(/(.).+(@.+)/,'$1***$2');
 $('otpNote').innerHTML='OTP sent to '+esc(e)+'. <b>Demo mode:</b> there is no email server yet, so your OTP is <b>'+code+'</b> (valid for 5 minutes).';
 $('otpStep').style.display='block';
}
function verifyOtp(){
 const o=JSON.parse(sessionStorage.getItem('otp')||'null');
 if(!o||Date.now()>o.exp){alert('OTP expired. Please request a new one.');return}
 if($('otp').value.trim()!==o.code){alert('Wrong OTP');return}
 sessionStorage.removeItem('otp');sessionStorage.setItem('ascend_user',o.id);location.href='account.html';
}
function logout(){sessionStorage.removeItem('ascend_user');location.href='index.html'}

/* ---------- user account page ---------- */
function drawAccount(){
 const id=sessionStorage.getItem('ascend_user'),r=findReq(id);
 if(!r){location.href='index.html';return}
 $('who').textContent='Loan ID '+id;
 const box=$('acctBox'),nm=esc(r.applicant['Full Name']);
 if(r.status=='Pending'){box.innerHTML=`<div class="card"><h1 class="Pending">Request pending</h1><p>Hello ${nm}, your loan request is under review. We will email you once a decision is made.</p></div>`;return}
 if(r.status=='Rejected'){box.innerHTML=`<div class="card"><h1 class="Rejected">Request rejected</h1><p>Sorry ${nm}, your loan request was not approved this time.</p></div>`;return}
 ensure(r);sync(r);saveReq(r);
 const a=r.acct,o=owed(r),sc=a.score,blocked=sc<85&&o>0,rm=room(r),od=overdue(r),nx=a.dues.find(d=>d.bal>0);
 const col=sc>=90?'#22c55e':sc>=85?'#fbbf24':'#ef4444';
 box.innerHTML=
 `<h1 class="Accepted">Request accepted &#10004;</h1><p>Hello ${nm}</p>`+
 `<div class="card"><p>Credit score</p><div class="big" style="color:${col}">${sc}</div></div>`+
 (sc<90?`<div class="warn">Warning: your credit score is below 90. Pay your monthly installments on time to avoid more penalties.</div>`:'')+
 (blocked?`<div class="warn">Your credit score is below 85. No new money will be given until all dues, including interest, are paid.</div>`:'')+
 (od>0?`<div class="warn">You have overdue installments of ${inr(od)}. A 1% penalty is added every day.</div>`:'')+
 `<div class="grid"><div class="card">Approved loan<br><b>${inr(+r.loan.amount)}</b></div><div class="card">Received so far<br><b>${inr(drawn(r))}</b></div><div class="card">Amount left to pay (with interest)<br><b>${inr(o)}</b></div><div class="card">Pay this month (overdue + next installment)<br><b>${inr(payNow(r))}</b></div><div class="card">Next installment due on<br><b>${nx?new Date(nx.due).toLocaleDateString():'-'}</b></div><div class="card">You can withdraw now<br><b>${inr(blocked?0:rm)}</b></div></div>`+
 `<div class="card"><h3>Withdraw money</h3><input id="wamt" type="number" placeholder="Amount"><button onclick="doWithdraw()">Withdraw</button></div>`+
 `<div class="card"><h3>Repay</h3><input id="ramt" type="number" placeholder="Amount"><button onclick="doRepay()">Pay</button><button onclick="doRepay('month')">Pay this month's installment</button><button onclick="doRepay('all')">Pay full amount</button></div>`+
 `<h3>Withdrawals</h3>`+(a.draws.map(d=>{
  const q=a.dues.filter(x=>x.n==d.n),left=m2(q.reduce((s,x)=>s+x.bal,0)),paid=q.filter(x=>x.bal<=0).length,late=q.some(x=>x.missed&&x.bal>0),next=q.find(x=>x.bal>0);
  return `<div class="card">#${d.n}: ${inr(d.amt)} over ${d.tenure} month(s), interest ${inr(d.int)}. Installments paid: ${paid}/${q.length}. Left: <b>${inr(left)}</b>${next?' &middot; next due '+new Date(next.due).toLocaleDateString():''} <span class="${left<=0?'Accepted':late?'Rejected':'Pending'}">${left<=0?'Paid':late?'Overdue (1% daily penalty)':'On track'}</span></div>`;
 }).join('')||'<p>No withdrawals yet.</p>')+
 `<div class="card"><h3>Recent activity</h3>${a.log.slice(-8).reverse().map(x=>'<p>'+esc(x)+'</p>').join('')||'<p>Nothing yet.</p>'}</div>`+
 `<div class="card"><h3>Demo time travel</h3><p>For testing only: move the calendar forward to see due dates, penalties and score changes.</p><button onclick="skip(1)">+1 day</button><button onclick="skip(7)">+7 days</button><button onclick="skip(30)">+30 days</button></div>`;
}
function act(fn){const r=findReq(sessionStorage.getItem('ascend_user'));ensure(r);sync(r);const msg=fn(r);saveReq(r);if(msg)alert(msg);drawAccount()}
function skip(n){act(r=>{r.acct.skew+=n;sync(r)})}
function doWithdraw(){act(r=>{
 const x=+$('wamt').value,a=r.acct;
 if(a.score<85&&owed(r)>0)return 'Withdrawals are stopped until all dues are paid.';
 if(!(x>0))return 'Enter an amount.';
 if(x>room(r))return 'You can withdraw at most '+inr(room(r))+' right now.';
 const T=Math.max(1,+r.loan.tenure||6),i=m2(x*(r.loan.rate||12)/1200*T),tot=m2(x+i),each=m2(tot/T),n=a.draws.length+1;
 a.draws.push({n,amt:x,int:i,tenure:T,done:false});
 for(let k=1;k<=T;k++){const v=k==T?m2(tot-each*(T-1)):each;a.dues.push({n,k,due:nowOf(r)+k*30*DAY,bal:v,missed:false})}
 a.dues.sort((p,q)=>p.due-q.due);
 note(r,'Withdrew '+inr(x)+', to be repaid in '+T+' monthly installments of about '+inr(each));
})}
function doRepay(mode){act(r=>{
 const a=r.acct;let x=mode=='all'?owed(r):mode=='month'?payNow(r):+$('ramt').value;
 if(owed(r)<=0)return 'You have nothing to pay.';
 if(!(x>0))return 'Enter an amount.';
 x=Math.min(x,owed(r));note(r,'Paid '+inr(x));
 for(const d of a.dues){
  if(x<=0)break;if(d.bal<=0)continue;
  const p=Math.min(x,d.bal);d.bal=m2(d.bal-p);x=m2(x-p);
  if(d.bal>0)continue;
  if(d.missed){a.score=Math.min(100,a.score+2);note(r,'Cleared overdue installment of withdrawal #'+d.n+' with penalty. Credit score +2')}
  else if(a.score<100){a.score=Math.min(100,a.score+3);note(r,'Paid installment of withdrawal #'+d.n+'. Credit score +3')}
  const g=a.draws.find(w=>w.n==d.n);
  if(g&&!g.done&&a.dues.every(y=>y.n!=d.n||y.bal<=0)){g.done=true;if(a.dues.some(y=>y.n==d.n&&y.missed))a.late++;else a.onTime++}
 }
})}
if($('acctBox'))drawAccount();

if($('home')){show('home');if(location.hash=='#login')show('loginPage')}
