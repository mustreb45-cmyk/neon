// app.js - منطق بسيط لتخزين المنشورات والشكاوى والدعم في localStorage
const dbKey = 'neon_libya_db_v1';
const adminPass = 'admin123'; // يمكن تغييرها بعد التحميل

function loadDB(){
  const raw = localStorage.getItem(dbKey);
  if(raw) return JSON.parse(raw);
  const seed = {posts:[], complaints:[], support:[]};
  localStorage.setItem(dbKey, JSON.stringify(seed));
  return seed;
}
function saveDB(db){ localStorage.setItem(dbKey, JSON.stringify(db)); }

function renderPosts(){
  const db = loadDB();
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  db.posts.forEach((p, idx)=>{
    const div = document.createElement('div'); div.className='post';
    const imgSrc = p.images && p.images.length ? p.images[0] : '';
    if(imgSrc) div.innerHTML = `<img src="${imgSrc}" alt="${p.title}">`;
    else div.innerHTML = '<div style="height:120px;background:linear-gradient(90deg,#111,#222);border-radius:6px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#999">صورة تجريبية</div>';
    div.innerHTML += `<h4>${p.title}</h4><p>${p.desc}</p><p class="small">السعر: ${p.price||'---'}</p>`;
    grid.appendChild(div);
  });
}

// forms: support + complaints
document.addEventListener('submit', (e)=>{
  const db = loadDB();
  if(e.target && e.target.id==='supportForm'){
    e.preventDefault();
    const fd = new FormData(e.target);
    db.support.push({name:fd.get('name'), contact:fd.get('contact'), message:fd.get('message'), date: new Date().toISOString()});
    saveDB(db);
    document.getElementById('supportMsg').textContent='تم إرسال طلب الدعم. شكراً.';
    e.target.reset();
    renderAdminLists&&renderAdminLists();
  } else if(e.target && e.target.id==='complaintForm'){
    e.preventDefault();
    const fd = new FormData(e.target);
    db.complaints.push({name:fd.get('name'), order:fd.get('order'), message:fd.get('message'), date: new Date().toISOString()});
    saveDB(db);
    document.getElementById('complaintMsg').textContent='تم إرسال الشكوى. سنراجعها.';
    e.target.reset();
    renderAdminLists&&renderAdminLists();
  } else if(e.target && e.target.id==='postForm'){
    e.preventDefault();
    const fd = new FormData(e.target);
    const images = (fd.get('images')||'').split(',').map(s=>s.trim()).filter(Boolean);
    const db = loadDB();
    db.posts.push({title:fd.get('title'), price:fd.get('price'), desc:fd.get('desc'), images, date:new Date().toISOString()});
    saveDB(db);
    renderAdminLists&&renderAdminLists();
    alert('تم حفظ المنشور');
    e.target.reset();
    renderPosts();
  } else if(e.target && e.target.id==='loginForm'){
    e.preventDefault();
    const val = document.getElementById('adminPass').value;
    if(val===adminPass){
      document.getElementById('loginMsg').textContent='';
      document.getElementById('adminPanel').classList.remove('hidden');
      document.getElementById('loginForm').classList.add('hidden');
      renderAdminLists();
    } else {
      document.getElementById('loginMsg').textContent='كلمة المرور غير صحيحة';
    }
  }
});

function renderAdminLists(){
  const db = loadDB();
  const ap = document.getElementById('adminPosts');
  const ac = document.getElementById('adminComplaints');
  const as = document.getElementById('adminSupport');
  if(ap) ap.innerHTML = db.posts.map((p,i)=>`<div class="post"><h4>${p.title}</h4><p>${p.desc}</p><p class="small">تاريخ: ${new Date(p.date).toLocaleString()}</p><button data-i="${i}" class="delPost">حذف</button></div>`).join('');
  if(ac) ac.innerHTML = db.complaints.map(c=>`<div class="post"><p><strong>${c.name}</strong> - ${c.order||'لا يوجد رقم'}</p><p>${c.message}</p><p class="small">${new Date(c.date).toLocaleString()}</p></div>`).join('') || '<p class="small">لا توجد شكاوى</p>';
  if(as) as.innerHTML = db.support.map(s=>`<div class="post"><p><strong>${s.name}</strong> - ${s.contact}</p><p>${s.message}</p><p class="small">${new Date(s.date).toLocaleString()}</p></div>`).join('') || '<p class="small">لا توجد طلبات دعم</p>';

  document.querySelectorAll('.delPost').forEach(btn=>{
    btn.onclick = ()=>{
      const i = Number(btn.getAttribute('data-i'));
      if(!confirm('حذف المنشور؟')) return;
      db.posts.splice(i,1); saveDB(db); renderAdminLists(); renderPosts();
    }
  });
}

document.getElementById('exportData') && document.getElementById('exportData').addEventListener('click', ()=>{
  const db = loadDB();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'neon_libya_data.json');
  document.body.appendChild(a); a.click(); a.remove();
});

// set years and initial render
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
document.getElementById('year2') && (document.getElementById('year2').textContent = new Date().getFullYear());
renderPosts();
