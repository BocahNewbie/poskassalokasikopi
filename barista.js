function initBaristaModule() {
    const page = document.getElementById('barista-page');
    page.innerHTML = `
        <div style="padding: 24px; max-width: 1280px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon); margin-bottom: 20px;">☕ Dashboard Barista - Antrean 4 Tahap</h2>
            <div id="baristaOrdersList" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;"></div>
        </div>
    `;
    loadBaristaOrders();
    setInterval(loadBaristaOrders, 4000);
}

function loadBaristaOrders() {
    let container = document.getElementById('baristaOrdersList');
    if(!container) return;
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let activeTrx = transactions.filter(t => t.status !== 'Siap Diambil');

    if(activeTrx.length === 0) {
        container.innerHTML = `<p style="color: var(--text-soft);">Tidak ada antrean pesanan aktif.</p>`;
        return;
    }

    container.innerHTML = activeTrx.map(t => {
        let nextActionBtn = '';
        if(t.status === 'Diterima') {
            nextActionBtn = `<button class="btn-primary" onclick="advanceOrderStatus('${t.id}', 'Diproses')">Proses Pesanan</button>`;
        } else if(t.status === 'Diproses') {
            nextActionBtn = `<button class="btn-primary" onclick="advanceOrderStatus('${t.id}', 'Diselesaikan')">Selesaikan Pembuatan</button>`;
        } else if(t.status === 'Diselesaikan') {
            nextActionBtn = `<button class="btn-primary" onclick="advanceOrderStatus('${t.id}', 'Siap Diambil')">Tandai Siap Diambil</button>`;
        }

        return `
            <div style="background: var(--card-tosca); padding: 20px; border-radius: 12px; border: 1px solid #2dd4bf33; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
                    <span style="color: var(--accent-neon);">${t.id}</span>
                    <span style="background: #042f2e; padding: 4px 8px; border-radius: 4px; font-size: 0.85em;">${t.status}</span>
                </div>
                <p style="margin-bottom: 8px;">Pemesan: <b>${t.customer}</b></p>
                <div style="font-size: 0.9em; color: var(--text-soft); margin-bottom: 15px; background: #042f2e; padding: 10px; border-radius: 6px;">
                    ${t.items.map(i => `<div>• ${i.name} (x${i.qty})</div>`).join('')}
                </div>
                ${nextActionBtn}
            </div>
        `;
    }).join('');
}

function advanceOrderStatus(trxId, targetStatus) {
    let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
    let trx = transactions.find(t => t.id === trxId);
    if(trx) {
        trx.status = targetStatus;
        localStorage.setItem('lk_transactions', JSON.stringify(transactions));
        loadBaristaOrders();
    }
}
