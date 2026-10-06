function initAdminModule() {
    const page = document.getElementById('admin-page');
    page.innerHTML = `
        <div style="padding: 20px;">
            <h2>Dashboard Admin - Analisa & Operasional</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="background: white; padding: 15px; border-radius: 6px;"><h4>Sales (7 Hari)</h4><p>Rp 0</p></div>
                <div style="background: white; padding: 15px; border-radius: 6px;"><h4>Jumlah Pesanan</h4><p>0 Transaksi</p></div>
                <div style="background: white; padding: 15px; border-radius: 6px;"><h4>Uang Masuk</h4><p>Rp 0</p></div>
                <div style="background: white; padding: 15px; border-radius: 6px;"><h4>Basket Size (Qty / Rp)</h4><p>0 item / Rp 0</p></div>
            </div>
        </div>
    `;
}
