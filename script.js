// --- STATE & INITIALIZATION ---
let currentUser = null;
let cart = [];
let chartInstance = null;

function initStorage() {
    // Inisialisasi awal jika localStorage masih kosong
    if (!localStorage.getItem('lk_transactions')) {
        localStorage.setItem('lk_transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('lk_logs')) {
        localStorage.setItem('lk_logs', JSON.stringify([]));
    }
}

// Mengambil data transaksi dan log (data master lain diambil dari file modul masing-masing)
function getTransactions() {
    return JSON.parse(localStorage.getItem('lk_transactions')) || [];
}
function setTransactions(data) {
    localStorage.setItem('lk_transactions', JSON.stringify(data));
}
function getLogs() {
    return JSON.parse(localStorage.getItem('lk_logs')) || [];
}
function addLog(action) {
    let logs = getLogs();
    logs.unshift({ time: new Date().toLocaleTimeString(), user: currentUser ? currentUser.name : 'System', action });
    if(logs.length > 50) logs.pop();
    localStorage.setItem('lk_logs', JSON.stringify(logs));
}

// --- AUTHENTICATION (Membaca dari user.js) ---
function doLogin() {
    let u = document.getElementById('loginUser').value.trim();
    let p = document.getElementById('loginPass').value.trim();
    let err = document.getElementById('loginError');
    
    // getUsers() berasal dari user.js
    let users = getUsers();
    let foundUser = users.find(usr => usr.username === u && usr.password === p);
    
    if(!foundUser) {
        err.style.display = 'block';
        err.innerText = 'Username atau Password salah!';
        return;
    }
    
    currentUser = foundUser;
    err.style.display = 'none';
    document.getElementById('loginWelcomeText').innerText = `Selamat datang, ${currentUser.name} (${currentUser.role})`;
    document.getElementById('loginSuccessModal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('loginSuccessModal').style.display = 'none';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('userInfo').innerText = `${currentUser.name} (${currentUser.role})`;
        
        let adminNav = document.getElementById('adminNav');
        if(currentUser.role === 'Admin') {
            adminNav.style.display = 'flex';
            showPage('admin-page');
            loadAdminDashboard();
        } else if(currentUser.role === 'Kasir') {
            adminNav.style.display = 'none';
            showPage('kasir-page');
            loadKasirProducts();
        } else if(currentUser.role === 'Barista') {
            adminNav.style.display = 'none';
            showPage('barista-page');
            loadBaristaOrders();
        }
        addLog(`Login ke sistem sebagai ${currentUser.role}`);
    }, 1000);
}

function logout() {
    currentUser = null;
    cart = [];
    document.getElementById('navbar').style.display = 'none';
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}

// --- GANTI PASSWORD MANDIRI (Untuk Semua User di Dashboard) ---
function openChangePasswordModal() {
    document.getElementById('oldPassInput').value = '';
    document.getElementById('newPassInput').value = '';
    document.getElementById('confirmPassInput').value = '';
    document.getElementById('changePasswordModal').style.display = 'flex';
}

function closeChangePasswordModal() {
    document.getElementById('changePasswordModal').style.display = 'none';
}

function submitChangePassword() {
    let oldP = document.getElementById('oldPassInput').value.trim();
    let newP = document.getElementById('newPassInput').value.trim();
    let confP = document.getElementById('confirmPassInput').value.trim();

    if (!currentUser) {
        alert('Sesi habis, silakan login ulang.');
        return;
    }

    if (oldP !== currentUser.password) {
        alert('Password lama salah!');
        return;
    }
    if (!newP || newP.length < 4) {
        alert('Password baru minimal 4 karakter!');
        return;
    }
    if (newP !== confP) {
        alert('Konfirmasi password baru tidak cocok!');
        return;
    }

    // Update pada data user global (user.js / localStorage)
    let users = getUsers();
    let usr = users.find(u => u.username === currentUser.username);
    if (usr) {
        usr.password = newP;
        setUsers(users); // Simpan perubahan ke penyimpanan user
        currentUser.password = newP;
        alert('Password berhasil diubah!');
        closeChangePasswordModal();
        addLog('Mengubah password akun sendiri');
    }
}
