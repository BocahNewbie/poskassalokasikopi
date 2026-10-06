function initAdminModule() {
    const page = document.getElementById('admin-page');
    page.innerHTML = `
        <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon);">Dashboard Admin - Operasional & Histori</h2>
            <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
                <button class="btn-primary" onclick="switchAdminTab('histori')">Histori 7 Hari</button>
                <button class="btn-primary" onclick="switchAdminTab('stok')">Stok Bahan</button>
                <button class="btn-primary" onclick="switchAdminTab('log')">Log Aktivitas</button>
                <button class="btn-secondary" onclick="switchAdminTab('kasir-tab')">Akses Tab Kasir</button>
                <button class="btn-secondary" onclick="switchAdminTab('checker-tab')">Akses Tab Checker</button>
            </div>
            <div id="adminContentArea" style="background: var(--card-tosca); padding: 20px; border-radius: 8px;"></div>
        </div>
    `;
    switchAdminTab('histori');
}

function switchAdminTab(tab) {
    let area = document.getElementById('adminContentArea');
    if(tab === 'histori') {
        let transactions = JSON.parse(localStorage.getItem('lk_transactions')) || [];
        area.innerHTML = `
            <h3>Histori Transaksi 7 Hari Terakhir</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:8px;">ID TRX</th><th style="text-align:left; padding:8px;">Pemesan</th><th style="text-align:left; padding:8px;">Total</th><th style="text-align:left; padding:8px;">Status</th></tr>
                ${transactions.map(t => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:8px;">${t.id}</td><td style="padding:8px;">${t.customer}</td><td style="padding:8px;">Rp ${t.total.toLocaleString()}</td><td style="padding:8px;">${t.status}</td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'stok') {
        let stocks = getMaterials();
        area.innerHTML = `
            <h3>Stok Bahan Baku Gudang</h3>
            <table style="width:100%; margin-top:15px; border-collapse: collapse; font-size: 0.9em;">
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:8px;">Bahan</th><th style="text-align:left; padding:8px;">Stok Tersisa</th><th style="text-align:left; padding:8px;">Satuan</th></tr>
                ${stocks.map(s => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:8px;">${s.name}</td><td style="padding:8px; font-weight:bold; color:var(--accent-neon);">${s.stock}</td><td style="padding:8px;">${s.unit}</td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'log') {
        let logs = JSON.parse(localStorage.getItem('lk_logs')) || [];
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Log Aktivitas Sistem</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 12px;" onclick="downloadLogs()">Download Log</button>
            </div>
            <ul style="margin-top: 15px; padding-left: 20px; font-size: 0.9em;">
                ${logs.map(l => `<li style="margin-bottom: 5px;">[${l.time}] <b>${l.user}</b>:${l.action}</li>`).join('')}
            </ul>
        `;
    } else if(tab === 'kasir-tab') {
        area.innerHTML = `<div id="sub-kasir-view"></div>`;
        initKasirModule();
        // Pindahkan tampilan kasir ke dalam area admin jika diinginkan
    } else if(tab === 'checker-tab') {
        area.innerHTML = `<div id="sub-checker-view"></div>`;
        initCheckerModule();
    }
}

function downloadLogs() {
    let logs = JSON.parse(localStorage.getItem('lk_logs')) || [];
    let text = logs.map(l => `[${l.time}] ${l.user}: ${l.action}`).join('\n');
    let blob = new Blob([text], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'log_aktivitas_lokasi_kopi.txt';
    a.click();
}
