function initCheckerModule() {
    const page = document.getElementById('checker-page');
    page.innerHTML = `
        <div style="padding: 24px; max-width: 1280px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon); margin-bottom: 15px;">🌾 Checker Gudang - Manajemen Stok</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn-primary" onclick="switchCheckerTab('input')">Input Stok Barang</button>
                <button class="btn-secondary" onclick="switchCheckerTab('akhir')">Stok Akhir Gudang</button>
                <button class="btn-secondary" onclick="switchCheckerTab('estimasi')">Estimasi Belanja</button>
            </div>
            <div id="checkerTabArea" style="background: var(--card-tosca); padding: 24px; border-radius: 12px; border: 1px solid #2dd4bf33;"></div>
        </div>
    `;
    switchCheckerTab('input');
}

function switchCheckerTab(tab) {
    let area = document.getElementById('checkerTabArea');
    if(tab === 'input') {
        area.innerHTML = `
            <h3>Catat Barang Masuk Gudang</h3>
            <div style="margin-top: 15px; max-width: 500px;">
                <div class="form-group"><label>Nama Bahan / Barang</label><input type="text" id="chkName" placeholder="Contoh: Biji Kopi Robusta"></div>
                <div class="form-group"><label>Jumlah & Satuan</label><div style="display:flex; gap:10px;"><input type="number" id="chkQty" placeholder="Jumlah" style="flex:2;"><input type="text" id="chkUnit" placeholder="Satuan (kg/gram/ml)" style="flex:1;"></div></div>
                <div class="form-group"><label>Total Harga Pembelian (Rp)</label><input type="number" id="chkPrice" placeholder="Total harga beli"></div>
                <button class="btn-primary" onclick="saveCheckerInput()">Simpan ke Inventaris</button>
            </div>
        `;
    } else if(tab === 'akhir') {
        let materials = getMaterials();
        area.innerHTML = `
            <h3>Laporan Stok Akhir Gudang</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:10px;">Nama Bahan</th><th style="text-align:left; padding:10px;">Stok Tersedia</th><th style="text-align:left; padding:10px;">Satuan</th></tr>
                ${materials.map(m => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:10px;">${m.name}</td><td style="padding:10px; font-weight:bold; color:var(--accent-neon);">${m.stock}</td><td style="padding:10px;">${m.unit}</td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'estimasi') {
        let materials = getMaterials();
        area.innerHTML = `
            <h3>Estimasi Belanja & Restock Gudang</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:10px;">Bahan</th><th style="text-align:left; padding:10px;">Stok Saat Ini</th><th style="text-align:left; padding:10px;">Status Restock</th></tr>
                ${materials.map(m => `
                    <tr style="border-bottom:1px solid #2dd4bf22;">
                        <td style="padding:10px;">${m.name}</td>
                        <td style="padding:10px;">${m.stock}${m.unit}</td>
                        <td style="padding:10px; color:${m.stock < 500 ? '#fca5a5' : '#34d399'}; font-weight:bold;">${m.stock < 500 ? '⚠️ Segera Belanja' : 'Aman'}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }
}

function saveCheckerInput() {
    let name = document.getElementById('chkName').value.trim();
    let qty = parseFloat(document.getElementById('chkQty').value);
    let unit = document.getElementById('chkUnit').value.trim();
    let price = parseFloat(document.getElementById('chkPrice').value);

    if(!name || isNaN(qty) || isNaN(price)) { alert("Lengkapi data dengan benar!"); return; }

    let materials = getMaterials();
    let existing = materials.find(m => m.name.toLowerCase() === name.toLowerCase());
    if(existing) {
        existing.stock += qty;
        existing.buyPrice = (existing.buyPrice || 0) + price;
    } else {
        materials.push({ id: Date.now(), name, stock: qty, unit, buyPrice: price });
    }
    setMaterials(materials);
    alert("Stok berhasil diperbarui!");
    switchCheckerTab('akhir');
}
