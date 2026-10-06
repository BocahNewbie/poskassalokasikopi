function initCheckerModule() {
    const page = document.getElementById('checker-page');
    page.innerHTML = `
        <div style="padding: 20px; max-width: 1000px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon);">Panel Checker - Input Stok Gudang</h2>
            <div style="background: var(--card-tosca); padding: 20px; border-radius: 8px; margin-top: 15px;">
                <h3>Catat Barang Datang & Harga Beli</h3>
                <div class="form-group" style="margin-top: 10px;">
                    <label>Nama Barang / Bahan</label>
                    <input type="text" id="chkItemName" placeholder="Contoh: Biji Kopi / Susu">
                </div>
                <div class="form-group">
                    <label>Jumlah Masuk & Satuan</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="number" id="chkItemQty" placeholder="Jumlah" style="flex: 2;">
                        <input type="text" id="chkItemUnit" placeholder="Satuan (gram/ml/pcs)" style="flex: 1;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Harga Beli Total / Satuan (Rp)</label>
                    <input type="number" id="chkItemPrice" placeholder="Total harga pembelian">
                </div>
                <button class="btn-primary" onclick="saveCheckerStock()">Simpan & Masukkan ke Gudang</button>
            </div>
        </div>
    `;
}

function saveCheckerStock() {
    let name = document.getElementById('chkItemName').value.trim();
    let qty = parseFloat(document.getElementById('chkItemQty').value);
    let unit = document.getElementById('chkItemUnit').value.trim();
    let price = parseFloat(document.getElementById('chkItemPrice').value);

    if(!name || isNaN(qty) || isNaN(price)) {
        alert("Semua kolom harus diisi dengan benar!");
        return;
    }

    let materials = getMaterials();
    let existing = materials.find(m => m.name.toLowerCase() === name.toLowerCase());
    if(existing) {
        existing.stock += qty;
        existing.buyPrice = price;
    } else {
        materials.push({ id: Date.now(), name, stock: qty, unit, buyPrice: price });
    }
    setMaterials(materials);
    alert("Stok bahan berhasil diperbarui oleh Checker!");
    initCheckerModule();
}
