function initOwnerModule() {
    const page = document.getElementById('owner-page');
    page.innerHTML = `
        <div style="padding: 24px; max-width: 1280px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon); margin-bottom: 15px;">👑 Panel Owner - Kontrol Penuh & Keuangan</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button class="btn-primary" onclick="switchOwnerTab('menu')">Kelola Menu</button>
                <button class="btn-primary" onclick="switchOwnerTab('users')">Kelola User</button>
                <button class="btn-primary" onclick="switchOwnerTab('finance')">Analisa Keuangan</button>
            </div>
            <div id="ownerContentArea" style="background: var(--card-tosca); padding: 24px; border-radius: 12px; border: 1px solid #2dd4bf33;"></div>
        </div>
    `;
    switchOwnerTab('menu');
}

function switchOwnerTab(tab) {
    let area = document.getElementById('ownerContentArea');
    if(tab === 'menu') {
        let menus = getMenus();
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Manajemen Menu & Resep</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 14px;" onclick="openAddMenuModal()">+ Tambah Menu</button>
            </div>
            <table style="width:100%; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:10px;">Menu</th><th style="text-align:left; padding:10px;">Kategori</th><th style="text-align:left; padding:10px;">Harga</th><th style="text-align:left; padding:10px;">Aksi</th></tr>
                ${menus.map(m => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:10px;">${m.name}</td><td style="padding:10px;">${m.category}</td><td style="padding:10px;">Rp ${m.price.toLocaleString()}</td><td style="padding:10px;"><button class="btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="deleteMenu(${m.id})">Hapus</button></td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'users') {
        let users = getUsers();
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Kelola User (Prefix: Loka-)</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 14px;" onclick="openAddUserModal()">+ Tambah User</button>
            </div>
            <table style="width:100%; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:10px;">Nama</th><th style="text-align:left; padding:10px;">Username</th><th style="text-align:left; padding:10px;">Role</th><th style="text-align:left; padding:10px;">Password</th><th style="text-align:left; padding:10px;">Aksi</th></tr>
                ${users.map(u => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:10px;">${u.name}</td><td style="padding:10px; color:var(--accent-neon); font-weight:bold;">${u.username}</td><td style="padding:10px;">${u.role}</td><td style="padding:10px;">${u.password}</td><td style="padding:10px;"><button class="btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="deleteUser('${u.username}')">Hapus</button></td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'finance') {
        let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
        let totalIncome = transactions.reduce((sum, t) => sum + t.total, 0);
        let materials = getMaterials();
        let totalExpense = materials.reduce((sum, m) => sum + (m.buyPrice || 0), 0);
        let netProfit = totalIncome - totalExpense;

        area.innerHTML = `
            <h3>Analisa Keuangan & Pemasukan vs Pengeluaran</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin: 20px 0;">
                <div style="background: #042f2e; padding: 18px; border-radius: 8px;"><p style="color:var(--text-soft); font-size:0.85em;">Pemasukan</p><h3 style="color:var(--accent-neon); margin-top:5px;">Rp ${totalIncome.toLocaleString()}</h3></div>
                <div style="background: #042f2e; padding: 18px; border-radius: 8px;"><p style="color:var(--text-soft); font-size:0.85em;">Pengeluaran Stok</p><h3 style="color:#fca5a5; margin-top:5px;">Rp ${totalExpense.toLocaleString()}</h3></div>
                <div style="background: #042f2e; padding: 18px; border-radius: 8px;"><p style="color:var(--text-soft); font-size:0.85em;">Laba Bersih</p><h3 style="color:#34d399; margin-top:5px;">Rp ${netProfit.toLocaleString()}</h3></div>
            </div>
            <button class="btn-primary" style="width: auto; padding: 10px 20px;" onclick="downloadFinancialReportTXT()">Download Laporan Keuangan (TXT)</button>
        `;
    }
}

function openAddMenuModal() {
    let html = `
        <div id="addMenuModal" class="modal-overlay">
            <div class="modal-card">
                <h3>Tambah Menu Baru</h3>
                <div class="form-group" style="margin-top:10px;"><label>Nama Menu</label><input type="text" id="newMenuName"></div>
                <div class="form-group"><label>Kategori</label><input type="text" id="newMenuCat" placeholder="Kopi / Non-Kopi"></div>
                <div class="form-group"><label>Harga (Rp)</label><input type="number" id="newMenuPrice"></div>
                <div class="form-group"><label>Deskripsi</label><input type="text" id="newMenuDesc"></div>
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button class="btn-secondary" style="flex:1;" onclick="document.getElementById('addMenuModal').remove()">Batal</button>
                    <button class="btn-primary" style="flex:1;" onclick="saveNewMenu()">Simpan</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

function saveNewMenu() {
    let name = document.getElementById('newMenuName').value.trim();
    let category = document.getElementById('newMenuCat').value.trim();
    let price = parseFloat(document.getElementById('newMenuPrice').value);
    let desc = document.getElementById('newMenuDesc').value.trim();

    if(!name || isNaN(price)) { alert("Nama dan harga wajib diisi!"); return; }
    let menus = getMenus();
    menus.push({ id: Date.now(), name, category, price, desc, recipe: [] });
    setMenus(menus);
    document.getElementById('addMenuModal').remove();
    switchOwnerTab('menu');
}

function openAddUserModal() {
    let html = `
        <div id="addUserModal" class="modal-overlay">
            <div class="modal-card">
                <h3>Tambah User Baru</h3>
                <div class="form-group" style="margin-top:10px;"><label>Nama Lengkap</label><input type="text" id="newUserName"></div>
                <div class="form-group"><label>Username (Otomatis Loka-)</label><input type="text" id="newUserUsername" placeholder="nama_user"></div>
                <div class="form-group"><label>Password</label><input type="password" id="newUserPass"></div>
                <div class="form-group"><label>Role</label><select id="newUserRole" style="width:100%; padding:10px; background:#042f2e; color:white; border:1px solid #2dd4bf66; border-radius:6px;"><option value="Kasir">Kasir</option><option value="Barista">Barista</option><option value="Checker">Checker</option><option value="Admin">Admin</option></select></div>
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button class="btn-secondary" style="flex:1;" onclick="document.getElementById('addUserModal').remove()">Batal</button>
                    <button class="btn-primary" style="flex:1;" onclick="saveNewUser()">Simpan</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

function saveNewUser() {
    let name = document.getElementById('newUserName').value.trim();
    let rawUser = document.getElementById('newUserUsername').value.trim();
    let password = document.getElementById('newUserPass').value.trim();
    let role = document.getElementById('newUserRole').value;

    if(!name || !rawUser || !password) { alert("Semua kolom harus diisi!"); return; }
    let username = rawUser.startsWith('Loka-') ? rawUser : 'Loka-' + rawUser;

    let users = getUsers();
    users.push({ username, password, name, role });
    setUsers(users);
    document.getElementById('addUserModal').remove();
    switchOwnerTab('users');
}

function deleteMenu(id) {
    let menus = getMenus().filter(m => m.id !== id);
    setMenus(menus);
    switchOwnerTab('menu');
}

function deleteUser(username) {
    if(username === 'Loka-owner') { alert("Owner utama tidak dapat dihapus!"); return; }
    let users = getUsers().filter(u => u.username !== username);
    setUsers(users);
    switchOwnerTab('users');
}

function downloadFinancialReportTXT() {
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let totalIncome = transactions.reduce((sum, t) => sum + t.total, 0);
    let text = `=== LAPORAN KEUANGAN LOKASI KOPI ===\nWaktu: ${new Date().toLocaleString()}\nTotal Transaksi: ${transactions.length}\nTotal Pemasukan: Rp ${totalIncome.toLocaleString()}\n`;
    let blob = new Blob([text], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a'); a.href = url; a.download = 'laporan_keuangan.txt'; a.click();
}
