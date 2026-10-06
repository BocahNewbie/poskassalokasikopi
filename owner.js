function initOwnerModule() {
    const page = document.getElementById('owner-page');
    page.innerHTML = `
        <div style="padding: 20px;">
            <h2>Panel Owner - Kontrol Penuh & Keuangan</h2>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-primary" onclick="alert('Kelola Menu (Edit/Kurangi)')">Edit Menu</button>
                <button class="btn-primary" onclick="alert('Kelola Stok Gudang')">Stok Gudang</button>
                <button class="btn-primary" onclick="alert('Kelola User (Tambah/Hapus)')">Kelola User</button>
                <button class="btn-primary" onclick="alert('Analisa Keuangan vs Stok')">Analisa Keuangan</button>
            </div>
        </div>
    `;
}
