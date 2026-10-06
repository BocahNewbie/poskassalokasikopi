let currentUser = null;

function doLogin() {
    let u = document.getElementById('loginUser').value.trim();
    let p = document.getElementById('loginPass').value.trim();
    let err = document.getElementById('loginError');
    
    let users = typeof getUsers === 'function' ? getUsers() : [];
    let foundUser = users.find(usr => usr.username === u && usr.password === p);
    
    if(!foundUser) {
        err.style.display = 'block';
        err.innerText = 'Username atau Password salah!';
        return;
    }
    
    currentUser = foundUser;
    err.style.display = 'none';
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('navbar').style.display = 'flex';
    document.getElementById('userInfo').innerText = `${currentUser.name} (${currentUser.role})`;
    
    // Perutean Berdasarkan Role
    if(currentUser.role === 'Kasir') {
        showPage('kasir-page');
        if(typeof initKasirModule === 'function') initKasirModule();
    } else if(currentUser.role === 'Barista') {
        showPage('barista-page');
        if(typeof initBaristaModule === 'function') initBaristaModule();
    } else if(currentUser.role === 'Checker') {
        showPage('checker-page');
        if(typeof initCheckerModule === 'function') initCheckerModule();
    } else if(currentUser.role === 'Admin') {
        showPage('admin-page');
        if(typeof initAdminModule === 'function') initAdminModule();
    } else if(currentUser.role === 'Owner') {
        showPage('owner-page');
        if(typeof initOwnerModule === 'function') initOwnerModule();
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    let target = document.getElementById(pageId);
    if(target) target.style.display = 'block';
}

function logout() {
    currentUser = null;
    document.getElementById('navbar').style.display = 'none';
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}
