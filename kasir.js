function initKasirModule() {
    const page = document.getElementById('kasir-page');
    page.innerHTML = `
        <div style="padding: 20px;">
            <h2>Dashboard Kasir - Kelola Konsumen & Transaksi</h2>
            <div style="background: white; padding: 15px; margin-top: 15px; border-radius: 6px;">
                <label>Nama Konsumen:</label>
                <input type="text" id="consumerName" placeholder="Masukkan nama konsumen..." style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 15px;">
                <button class="btn-primary" onclick="alert('Fitur transaksi kasir aktif!')">Proses Pesanan</button>
            </div>
        </div>
    `;
}
