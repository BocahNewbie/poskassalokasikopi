let currentCart = [];

function initKasirModule() {
    currentCart = [];
    let menus = getMenus();
    const page = document.getElementById('kasir-page');
    page.innerHTML = `
        <div style="padding: 24px; max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
            <div>
                <h2 style="color: var(--accent-neon); margin-bottom: 20px;">🛒 Kasir - Pilih Menu Konsumen</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
                    ${menus.map(m => `
                        <div style="background: var(--card-tosca); padding: 18px; border-radius: 10px; border: 1px solid #2dd4bf33;">
                            <h4 style="margin-bottom: 6px;">${m.name}</h4>
                            <p style="font-size: 0.85em; color: var(--text-soft); margin-bottom: 10px; min-height: 35px;">${m.desc || ''}</p>
                            <p style="color: var(--accent-neon); font-weight: bold; margin-bottom: 12px;">Rp ${m.price.toLocaleString()}</p>
                            <button class="btn-primary" onclick="addToCart(${m.id})">Tambah ke Keranjang</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="background: var(--card-tosca); padding: 20px; border-radius: 12px; height: fit-content; border: 1px solid #2dd4bf33;">
                <h3>Keranjang Pesanan</h3>
                <div id="cartItemsList" style="margin: 15px 0; max-height: 280px; overflow-y: auto;">
                    <p style="color: var(--text-soft);">Keranjang kosong.</p>
                </div>
                <hr style="border-color: #334155; margin: 15px 0;">
                <h4 id="cartTotalText" style="margin-bottom: 15px;">Total: Rp 0</h4>
                <button class="btn-primary" onclick="openCheckoutModal()">Selesaikan Transaksi</button>
            </div>
        </div>
    `;
}

function addToCart(menuId) {
    let menus = getMenus();
    let menu = menus.find(m => m.id === menuId);
    let item = currentCart.find(i => i.id === menuId);
    if(item) { item.qty++; } else { currentCart.push({ ...menu, qty: 1 }); }
    renderCart();
}

function renderCart() {
    let container = document.getElementById('cartItemsList');
    if(currentCart.length === 0) {
        container.innerHTML = `<p style="color: var(--text-soft);">Keranjang kosong.</p>`;
        document.getElementById('cartTotalText').innerText = "Total: Rp 0";
        return;
    }
    let total = 0;
    container.innerHTML = currentCart.map(i => {
        total += (i.price * i.qty);
        return `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9em;">
            <span>${i.name} (x${i.qty})</span>
            <span>Rp ${(i.price * i.qty).toLocaleString()}</span>
        </div>`;
    }).join('');
    document.getElementById('cartTotalText').innerText = `Total: Rp ${total.toLocaleString()}`;
}

function openCheckoutModal() {
    if(currentCart.length === 0) { alert("Pilih menu terlebih dahulu!"); return; }
    let total = currentCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    
    let modalHTML = `
        <div id="checkoutModal" class="modal-overlay">
            <div class="modal-card" style="max-width: 450px;">
                <h3>Konfirmasi Pembayaran</h3>
                <div style="margin: 12px 0; font-size: 0.9em; max-height: 140px; overflow-y: auto; background: #042f2e; padding: 10px; border-radius: 6px;">
                    ${currentCart.map(i => `<div>• ${i.name} x${i.qty} = Rp${(i.price * i.qty).toLocaleString()}</div>`).join('')}
                </div>
                <p style="font-weight: bold; color: var(--accent-neon); margin-bottom: 12px;">Total Tagihan: Rp ${total.toLocaleString()}</p>
                <div class="form-group">
                    <label>Nama Konsumen</label>
                    <input type="text" id="modalConsumerName" placeholder="Nama pemesan">
                </div>
                <div class="form-group">
                    <label>Uang Diberikan (Rp)</label>
                    <input type="number" id="modalCashGiven" placeholder="Nominal uang" oninput="calcChange(${total})">
                </div>
                <p id="modalChangeText" style="font-size: 0.95em; margin-bottom: 20px; color: var(--text-soft);">Kembalian: Rp 0</p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-secondary" style="flex: 1;" onclick="document.getElementById('checkoutModal').remove()">Batal</button>
                    <button class="btn-primary" style="flex: 1;" onclick="finalizeTransaction(${total})">Proses & Struk</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function calcChange(total) {
    let given = parseFloat(document.getElementById('modalCashGiven').value) || 0;
    let change = given - total;
    document.getElementById('modalChangeText').innerText = `Kembalian: Rp ${change >= 0 ? change.toLocaleString() : 0}`;
}

function finalizeTransaction(total) {
    let name = document.getElementById('modalConsumerName').value.trim();
    let given = parseFloat(document.getElementById('modalCashGiven').value) || 0;
    if(!name) { alert("Nama konsumen wajib diisi!"); return; }
    if(given < total) { alert("Nominal uang kurang!"); return; }

    let trxId = 'TRX-' + Math.floor(1000 + Math.random() * 9000);
    let change = given - total;

    // Kurangi stok berdasarkan resep
    let materials = getMaterials();
    let menus = getMenus();
    currentCart.forEach(cartItem => {
        let menuDef = menus.find(m => m.id === cartItem.id);
        if(menuDef && menuDef.recipe) {
            menuDef.recipe.forEach(ing => {
                let mat = materials.find(m => m.name.toLowerCase() === ing.material.toLowerCase());
                if(mat) { mat.stock -= (ing.amount * cartItem.qty); }
            });
        }
    });
    setMaterials(materials);

    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let newTrx = { id: trxId, customer: name, items: currentCart, total, cashGiven: given, change, status: 'Diterima', date: new Date().toISOString() };
    transactions.push(newTrx);
    localStorage.setItem('lk_transactions', JSON.stringify(transactions));

    // Log aktivitas
    let logs = JSON.parse(localStorage.getItem('lk_logs')) || [];
    logs.unshift({ time: new Date().toLocaleTimeString(), user: currentUser.name, action: `Transaksi sukses ${trxId} (${name})` });
    localStorage.setItem('lk_logs', JSON.stringify(logs));

    document.getElementById('checkoutModal').remove();
    showReceiptModal(newTrx);
}

function showReceiptModal(trx) {
    let receiptHTML = `
        <div id="receiptModal" class="modal-overlay">
            <div class="modal-card" style="text-align: center; max-width: 380px;">
                <h3 style="color: var(--accent-neon); margin-bottom: 5px;">☕ LOKASI KOPI</h3>
                <p style="font-size: 0.85em; color: var(--text-soft); margin-bottom: 15px;">Struk Pembayaran Resmi</p>
                <div style="text-align: left; background: #042f2e; padding: 15px; border-radius: 6px; font-size: 0.9em; margin-bottom: 15px;">
                    <p><b>ID TRX:</b> ${trx.id}</p>
                    <p><b>Pemesan:</b> ${trx.customer}</p>
                    <hr style="border-color: #2dd4bf33; margin: 8px 0;">
                    ${trx.items.map(i => `<div style="display:flex; justify-content:space-between;"><span>${i.name} (x${i.qty})</span><span>Rp${(i.price * i.qty).toLocaleString()}</span></div>`).join('')}
                    <hr style="border-color: #2dd4bf33; margin: 8px 0;">
                    <p style="font-weight: bold;">Total: Rp ${trx.total.toLocaleString()}</p>
                    <p>Tunai: Rp ${trx.cashGiven.toLocaleString()}</p>
                    <p>Kembalian: Rp ${trx.change.toLocaleString()}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-secondary" style="flex: 1;" onclick="document.getElementById('receiptModal').remove(); initKasirModule();">Tutup</button>
                    <button class="btn-primary" style="flex: 1;" onclick="window.print()">Cetak Struk</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', receiptHTML);
}
