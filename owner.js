function initOwnerModule() {
    const page = document.getElementById('owner-page');
    page.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon);">Panel Owner - Kontrol Penuh & Keuangan</h2>
            <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                <button class="btn-primary" onclick="switchOwnerTab('menu')">Kelola Menu & Resep</button>
                <button class="btn-primary" onclick="switchOwnerTab('stock')">Stok Gudang</button>
                <button class="btn-primary" onclick="switchOwnerTab('users')">Kelola User</button>
                <button class="btn-primary" onclick="switchOwnerTab('finance')">Analisa Keuangan</button>
            </div>
            <div id="ownerContentArea" style="background: var(--card-tosca); padding: 20px; border-radius: 8px;"></div>
        </div>
    `;
    switchOwnerTab('menu');
}

function switchOwnerTab(tab) {
    let area = document.getElementById('ownerContentArea');
    if(tab === 'menu') {
        let menus = getMenus();
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Manajemen Menu & Resep</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 12px;" onclick="openAddMenuModal()">+ Tambah Menu</button>
            </div>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:8px;">Nama Menu</th><th style="text-align:left; padding:8px;">Kategori</th><th style="text-align:left; padding:8px;">Harga</th><th style="text-align:left; padding:8px;">Aksi</th></tr>
                ${menus.map(m => `
                    <tr style="border-bottom:1px solid #2dd4bf22;">
                        <td style="padding:8px;">${m.name}</td>
                        <td style="padding:8px;">${m.category}</td>
                        <td style="padding:8px;">Rp ${m.price.toLocaleString()}</td>
                        <td style="padding:8px;"><button class="btn-danger" style="padding: 4px 8px; font-size: 0.8em;" onclick="deleteMenu(${m.id})">Hapus</button></td>
                    </tr>
                `).join('')}
            </table>
        `;
    } else if(tab === 'users') {
        let users = getUsers();
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Kelola User Sistem (Prefix: Loka-)</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 12px;" onclick="openAddUserModal()">+ Tambah User</button>
            </div>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:8px;">Nama Lengkap</th><th style="text-align:left; padding:8px;">Username</th><th style="text-align:left; padding:8px;">Role</th><th style="text-align:left; padding:8px;">Password</th><th style="text-align:left; padding:8px;">Aksi</th></tr>
                ${users.map(u => `
                    <tr style="border-bottom:1px solid #2dd4bf22;">
                        <td style="padding:8px;">${u.name}</td>
                        <td style="padding:8px; font-weight:bold; color:var(--accent-neon);">${u.username}</td>
                        <td style="padding:8px;">${u.role}</td>
                        <td style="padding:8px;">${u.password}</td>
                        <td style="padding:8px;"><button class="btn-danger" style="padding: 4px 8px; font-size: 0.8em;" onclick="deleteUser('${u.username}')">Hapus</button></td>
                    </tr>
                `).join('')}
            </table>
        `;
    } else if(tab === 'finance') {
        let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
        let totalIncome = transactions.reduce((sum, t) => sum + t.total, 0);
        let materials = getMaterials();
        let totalExpense = materials.reduce((sum, m) => sum + (m.buyPrice || 0), 0);
        let netProfit = totalIncome - totalExpense;

        area.innerHTML = `
            <h3>Analisa Keuangan & Arus Kas</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="background: #042f2e; padding: 15px; border-radius: 6px;">
                    <p style="color: var(--text-soft); font-size: 0.85em;">Total Pemasukan (Penjualan)</p>
                    <h3 style="color: var(--accent-neon); margin-top: 5px;">Rp ${totalIncome.toLocaleString()}</h3>
                </div>
                <div style="background: #042f2e; padding: 15px; border-radius: 6px;">
                    <p style="color: var(--text-soft); font-size: 0.85em;">Total Pengeluaran (Stok/Bahan)</p>
                    <h3 style="color: #fca5a5; margin-top: 5px;">Rp ${totalExpense.toLocaleString()}</h3>
                </div>
                <div style="background: #042f2e; padding: 15px; border-radius: 6px;">
                    <p style="color: var(--text-soft); font-size: 0.85em;">Estimasi Laba Bersih</p>
                    <h3 style="color: #34d399; margin-top: 5px;">Rp ${netProfit.toLocaleString()}</h3>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn-primary" style="width: auto; padding: 10px 20px;" onclick="downloadFinancialReport()">Download Laporan Keuangan (TXT)</button>
            </div>
        `;
    } else if(tab === 'stock') {
        let stocks = getMaterials();
        area.innerHTML = `
            <h3>Monitoring Stok Gudang</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:8px;">Bahan</th><th style="text-align:left; padding:8px;">Stok</th><th style="text-align:left; padding:8px;">Harga Beli Tercatat</th></tr>
                ${stocks.map(s => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:8px;">${s.name}</td><td style="padding:8px; font-weight:bold; color:var(--accent-neon);">${s.stock}${s.unit}</td><td style="padding:8px;">Rp ${(s.buyPrice || 0).toLocaleString()}</td></tr>`).join('')}
            </table>
        `;
    }
}

function deleteMenu(id) {
    let menus = getMenus().filter(m => m.id !== id);
    setMenus(menus);
    switchOwnerTab('menu');
}

function deleteUser(username) {
    if(username === 'Loka-owner') {
        alert("Akun Owner Utama tidak dapat dihapus!");
        return;
    }
    let users = getUsers().filter(u => u.username !== username);
    setUsers(users);
    switchOwnerTab('users');
}

function downloadFinancialReport() {
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let totalIncome = transactions.reduce((sum, t) => sum + t.total, 0);
    let report = `=== LAPORAN KEUANGAN LOKASI KOPI ===\nTanggal Cetak: ${new Date().toLocaleString()}\nTotal Transaksi: ${transactions.length}\nTotal Pemasukan: Rp ${totalIncome.toLocaleString()}\n`;
    let blob = new Blob([report], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'laporan_keuangan_lokasi_kopi.txt';
    a.click();
}
