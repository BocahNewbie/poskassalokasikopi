function initBaristaModule() {
    const page = document.getElementById('barista-page');
    page.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon);">Dashboard Barista - Antrean Pesanan</h2>
            <div id="baristaOrdersList" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-top: 15px;">
                <!-- Diisi dinamis -->
            </div>
        </div>
    `;
    loadBaristaOrders();
    setInterval(loadBaristaOrders, 5000); // Auto-refresh antrean
}

function loadBaristaOrders() {
    let container = document.getElementById('baristaOrdersList');
    if(!container) return;
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let activeTrx = transactions.filter(t => t.status !== 'Siap Diambil');

    if(activeTrx.length === 0) {
        container.innerHTML = `<p style="color: var(--text-soft);">Tidak ada antrean pesanan aktif saat ini.</p>`;
        return;
    }

    container.innerHTML = activeTrx.map(t => `
        <div style="background: var(--card-tosca); padding: 15px; border-radius: 8px; border: 1px solid #2dd4bf33;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px;">
                <span>${t.id}</span>
                <span style="color: var(--accent-neon);">${t.status}</span>
            </div>
            <p style="font-size: 0.9em; margin-bottom: 5px;">Pemesan: <b>${t.customer}</b></p>
            <div style="font-size: 0.85em; color: var(--text-soft); margin-bottom: 12px;">
                ${t.items.map(i => `<div>- ${i.name} (x${i.qty})</div>`).join('')}
            </div>
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                <button class="btn-secondary" style="font-size: 0.8em; padding: 5px;" onclick="updateOrderStatus('${t.id}', 'Diproses')">Proses</button>
                <button class="btn-secondary" style="font-size: 0.8em; padding: 5px;" onclick="updateOrderStatus('${t.id}', 'Diselesaikan')">Selesai</button>
                <button class="btn-primary" style="font-size: 0.8em; padding: 5px;" onclick="updateOrderStatus('${t.id}', 'Siap Diambil')">Siap Diambil</button>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(trxId, newStatus) {
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let trx = transactions.find(t => t.id === trxId);
    if(trx) {
        trx.status = newStatus;
        localStorage.setItem('lk_transactions', JSON.stringify(transactions));
        loadBaristaOrders();
    }
}
