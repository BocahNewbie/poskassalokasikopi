// --- STATE & INITIALIZATION ---
let currentUser = null;
let cart = [];

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
    document.getElementById('loginWelcomeText').innerText = `Selamat datang, ${currentUser.name} (${currentUser.role})`;
    document.getElementById('loginSuccessModal').style.display = 'flex';
    
    setTimeout(() => {
        document.getElementById('loginSuccessModal').style.display = 'none';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('userInfo').innerText = `${currentUser.name} (${currentUser.role})`;
        
        if(currentUser.role === 'Admin') {
            document.getElementById('admin-page').style.display = 'block';
            loadAdminDashboard();
        } else if(currentUser.role === 'Kasir') {
            document.getElementById('kasir-page').style.display = 'block';
            loadKasirPage();
        } else if(currentUser.role === 'Barista') {
            document.getElementById('barista-page').style.display = 'block';
            loadBaristaPage();
        }
    }, 1000);
}

function logout() {
    currentUser = null;
    document.getElementById('navbar').style.display = 'none';
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}

// --- FUNGSI RENDER DASHBOARD ADMIN ---
function loadAdminDashboard() {
    const adminPage = document.getElementById('admin-page');
    adminPage.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2>Panel Admin - Kelola Sistem</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px;">
                <div class="login-card" style="text-align: left; padding: 20px;">
                    <h3>Kelola Menu & Harga</h3>
                    <p style="color: var(--text-muted); font-size: 0.9em; margin: 10px 0;">Tambah dan atur menu kopi atau makanan.</p>
                </div>
                <div class="login-card" style="text-align: left; padding: 20px;">
                    <h3>Resep & Stok Bahan</h3>
                    <p style="color: var(--text-muted); font-size: 0.9em; margin: 10px 0;">Atur komposisi resep dan pantau stok bahan baku.</p>
                </div>
                <div class="login-card" style="text-align: left; padding: 20px;">
                    <h3>Kelola User</h3>
                    <p style="color: var(--text-muted); font-size: 0.9em; margin: 10px 0;">Tambah atau ubah akses pengguna sistem.</p>
                </div>
            </div>
        </div>
    `;
}

function loadKasirPage() {
    document.getElementById('kasir-page').innerHTML = `<div style="padding: 20px;"><h2>Dashboard Kasir</h2></div>`;
}

function loadBaristaPage() {
    document.getElementById('barista-page').innerHTML = `<div style="padding: 20px;"><h2>Dashboard Barista</h2></div>`;
}

// --- FITUR GANTI PASSWORD ---
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

    if (!currentUser) return;

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

    let users = typeof getUsers === 'function' ? getUsers() : [];
    let usr = users.find(u => u.username === currentUser.username);
    if (usr) {
        usr.password = newP;
        if (typeof setUsers === 'function') setUsers(users);
        currentUser.password = newP;
        alert('Password berhasil diubah!');
        closeChangePasswordModal();
    }
}

// --- RENDER DASHBOARD ADMIN UTAMA ---
function loadAdminDashboard() {
    const adminPage = document.getElementById('admin-page');
    adminPage.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2>Panel Admin - Lokasi Kopi</h2>
            <div style="display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
                <button class="btn-primary" onclick="switchAdminTab('menu')">Kelola Menu</button>
                <button class="btn-primary" onclick="switchAdminTab('stock')">Stok & Bahan</button>
                <button class="btn-primary" onclick="switchAdminTab('recipe')">Resep Menu</button>
                <button class="btn-primary" onclick="switchAdminTab('users')">Kelola User</button>
            </div>
            <div id="adminTabContent" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Konten dinamis tab admin -->
            </div>
        </div>
    `;
    switchAdminTab('menu'); // Default tab
}

function switchAdminTab(tab) {
    const container = document.getElementById('adminTabContent');
    if (tab === 'menu') {
        let menus = getMenus();
        container.innerHTML = `
            <h3>Daftar Menu</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse;">
                <tr><th style="text-align:left; padding:8px;">Nama</th><th style="text-align:left; padding:8px;">Kategori</th><th style="text-align:left; padding:8px;">Harga</th></tr>
                ${menus.map(m => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${m.name}</td><td style="padding:8px; border-bottom:1px solid #eee;">${m.category}</td><td style="padding:8px; border-bottom:1px solid #eee;">Rp ${m.price.toLocaleString()}</td></tr>`).join('')}
            </table>
        `;
    } else if (tab === 'stock') {
        let stocks = getMaterials();
        container.innerHTML = `
            <h3>Stok Bahan Baku</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse;">
                <tr><th style="text-align:left; padding:8px;">Nama Bahan</th><th style="text-align:left; padding:8px;">Jumlah Stok</th><th style="text-align:left; padding:8px;">Satuan</th></tr>
                ${stocks.map(s => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${s.name}</td><td style="padding:8px; border-bottom:1px solid #eee;">${s.stock}</td><td style="padding:8px; border-bottom:1px solid #eee;">${s.unit}</td></tr>`).join('')}
            </table>
        `;
    } else if (tab === 'recipe') {
        let recipes = getRecipes();
        container.innerHTML = `
            <h3>Komposisi Resep Menu</h3>
            <p style="color: #666; margin-top: 5px;">Menghubungkan menu dengan takaran bahan baku.</p>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px;">${JSON.stringify(recipes, null, 2)}</pre>
        `;
    } else if (tab === 'users') {
        let users = getUsers();
        container.innerHTML = `
            <h3>Kelola User / Karyawan</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse;">
                <tr><th style="text-align:left; padding:8px;">Username</th><th style="text-align:left; padding:8px;">Nama Lengkap</th><th style="text-align:left; padding:8px;">Role</th></tr>
                ${users.map(u => `<tr><td style="padding:8px; border-bottom:1px solid #eee;">${u.username}</td><td style="padding:8px; border-bottom:1px solid #eee;">${u.name}</td><td style="padding:8px; border-bottom:1px solid #eee;">${u.role}</td></tr>`).join('')}
            </table>
        `;
    }
}
