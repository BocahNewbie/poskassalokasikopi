function initAdminModule() {
    const page = document.getElementById('admin-page');
    page.innerHTML = `
        <div style="padding: 24px; max-width: 1280px; margin: 0 auto;">
            <h2 style="color: var(--accent-neon); margin-bottom: 15px;">🛡️ Dashboard Admin - Kontrol Operasional</h2>
            <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                <button class="btn-primary" onclick="switchAdminTab('histori')">Histori 7 Hari</button>
                <button class="btn-primary" onclick="switchAdminTab('log')">Log Aktivitas</button>
                <button class="btn-secondary" onclick="switchAdminTab('kassa-tab')">Tab Kasir</button>
                <button class="btn-secondary" onclick="switchAdminTab('checker-tab')">Tab Checker</button>
            </div>
            <div id="adminContentArea" style="background: var(--card-tosca); padding: 24px; border-radius: 12px; border: 1px solid #2dd4bf33;"></div>
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
                <tr style="border-bottom:1px solid #334155;"><th style="text-align:left; padding:10px;">ID TRX</th><th style="text-align:left; padding:10px;">Pemesan</th><th style="text-align:left; padding:10px;">Total</th><th style="text-align:left; padding:10px;">Status</th></tr>
                ${transactions.map(t => `<tr style="border-bottom:1px solid #2dd4bf22;"><td style="padding:10px;">${t.id}</td><td style="padding:10px;">${t.customer}</td><td style="padding:10px;">Rp ${t.total.toLocaleString()}</td><td style="padding:10px;">${t.status}</td></tr>`).join('')}
            </table>
        `;
    } else if(tab === 'log') {
        let logs = JSON.parse(localStorage.getItem('lk_logs')) || [];
        area.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>Log Aktivitas Sistem</h3>
                <button class="btn-primary" style="width: auto; padding: 6px 14px;" onclick="downloadLogs()">Download Log (TXT)</button>
            </div>
            <ul style="margin-top: 15px; padding-left: 20px; font-size: 0.9em;">
                ${logs.map(l => `<li style="margin-bottom: 6px;">[${l.time}] <b>${l.user}</b>:${l.action}</li>`).join('')}
            </ul>
        `;
    } else if(tab === 'kassa-tab') {
        area.innerHTML = `<div id="admin-kasir-container"></div>`;
        initAdminKasirView();
    } else if(tab === 'checker-tab') {
        area.innerHTML = `<div id="admin-checker-container"></div>`;
        initCheckerModuleForAdmin();
    }
}

function downloadLogs() {
    let logs = JSON.parse(localStorage.getItem('lk_logs')) || [];
    let text = logs.map(l => `[${l.time}] ${l.user}: ${l.action}`).join('\n');
    let blob = new Blob([text], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a'); a.href = url; a.download = 'log_aktivitas.txt'; a.click();
}

function initAdminKasirView() {
    document.getElementById('adminContentArea').innerHTML = `<h3 style="margin-bottom:15px;">Akses Cepat Tab Kasir</h3><div id="sub-kasir"></div>`;
    // Memanggil fungsi render kasir langsung di dalam kontainer admin
    let tempPage = document.getElementById('kasir-page');
    document.getElementById('sub-kasir').appendChild(tempPage);
    tempPage.style.display = 'block';
    initKasirModule();
}

function initCheckerModuleForAdmin() {
    document.getElementById('adminContentArea').innerHTML = `<h3 style="margin-bottom:15px;">Akses Cepat Tab Checker</h3><div id="sub-checker"></div>`;
    let tempPage = document.getElementById('checker-page');
    document.getElementById('sub-checker').appendChild(tempPage);
    tempPage.style.display = 'block';
    initCheckerModule();
}
