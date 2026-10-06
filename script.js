// --- STATE & INITIALIZATION ---
let currentUser = null;
let cart = [];
let chartInstance = null;

// Default Data jika LocalStorage kosong
const defaultMaterials = [
    { id: 'mat_1', name: 'Biji Kopi Arabika', stock: 2000, unit: 'gram' },
    { id: 'mat_2', name: 'Susu UHT', stock: 5000, unit: 'ml' },
    { id: 'mat_3', name: 'Cup Plastik', stock: 100, unit: 'pcs' },
    { id: 'mat_4', name: 'Sirup Gula Aren', stock: 1500, unit: 'ml' }
];

const defaultMenus = [
    { 
        id: 'menu_1', 
        name: 'Caffè Latte', 
        category: 'Kopi', 
        price: 25000, 
        recipe: [
            { materialId: 'mat_1', amount: 18 },
            { materialId: 'mat_2', amount: 150 },
            { materialId: 'mat_3', amount: 1 }
        ] 
    },
    { 
        id: 'menu_2', 
        name: 'Kopi Susu Aren', 
        category: 'Kopi', 
        price: 20000, 
        recipe: [
            { materialId: 'mat_1', amount: 15 },
            { materialId: 'mat_2', amount: 120 },
            { materialId: 'mat_4', amount: 30 },
            { materialId: 'mat_3', amount: 1 }
        ] 
    }
];

function initStorage() {
    if (!localStorage.getItem('lk_materials')) {
        localStorage.setItem('lk_materials', JSON.stringify(defaultMaterials));
    }
    if (!localStorage.getItem('lk_menus')) {
        localStorage.setItem('lk_menus', JSON.stringify(defaultMenus));
    }
    if (!localStorage.getItem('lk_transactions')) {
        localStorage.setItem('lk_transactions', JSON.stringify([]));
    }
    if (!localStorage.getItem('lk_logs')) {
        localStorage.setItem('lk_logs', JSON.stringify([]));
    }
}

function getMaterials() { return JSON.parse(localStorage.getItem('lk_materials')) || []; }
function setMaterials(data) { localStorage.setItem('lk_materials', JSON.stringify(data)); }
function getMenus() { return JSON.parse(localStorage.getItem('lk_menus')) || []; }
function setMenus(data) { localStorage.setItem('lk_menus', JSON.stringify(data)); }
function getTransactions() { return JSON.parse(localStorage.getItem('lk_transactions')) || []; }
function setTransactions(data) { localStorage.setItem('lk_transactions', JSON.stringify(data)); }
function getLogs() { return JSON.parse(localStorage.getItem('lk_logs')) || []; }
function addLog(action) {
    let logs = getLogs();
    logs.unshift({ time: new Date().toLocaleTimeString(), user: currentUser ? currentUser.username : 'System', action });
    if(logs.length > 50) logs.pop();
    localStorage.setItem('lk_logs', JSON.stringify(logs));
}

// --- AUTHENTICATION ---
function doLogin() {
    let u = document.getElementById('loginUser').value.trim();
    let p = document.getElementById('loginPass').value.trim();
    let err = document.getElementById('loginError');

    if(u === 'admin' && p === 'admin123') {
        currentUser = { username: 'Adzka Ramdhani', role: 'Admin' };
    } else if(u === 'kasir' && p === 'kasir123') {
        currentUser = { username: 'Kasir Lokasi', role: 'Kasir' };
    } else if(u === 'barista' && p === 'barista123') {
        currentUser = { username: 'Barista Tim', role: 'Barista' };
    } else {
        err.style.display = 'block';
        err.innerText = 'Username atau Password salah!';
        return;
    }

    err.style.display = 'none';
    document.getElementById('loginWelcomeText').innerText = `Selamat datang, ${currentUser.username} (${currentUser.role})`;
    document.getElementById('loginSuccessModal').style.display = 'flex';

    setTimeout(() => {
        document.getElementById('loginSuccessModal').style.display = 'none';
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('userInfo').innerText = `${currentUser.username} (${currentUser.role})`;

        let adminNav = document.getElementById('adminNav');
        if(currentUser.role === 'Admin') {
            adminNav.style.display = 'flex';
            showPage('admin-page');
            loadAdminDashboard();
        } else if(currentUser.role === 'Kasir') {
            adminNav.style.display = 'none';
            showPage('kasir-page');
            loadKasirProducts();
        } else if(currentUser.role === 'Barista') {
            adminNav.style.display = 'none';
            showPage('barista-page');
            loadBaristaOrders();
        }
        addLog(`Login ke sistem sebagai ${currentUser.role}`);
    }, 1000);
}

function logout() {
    currentUser = null;
    cart = [];
    document.getElementById('navbar').style.display = 'none';
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
}

function showPage(pageId) {
    document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
    document.getElementById(pageId).style.display = 'flex';

    if(pageId === 'admin-page') loadAdminDashboard();
    if(pageId === 'admin-menu-page') loadAdminMenuPage();
    if(pageId === 'admin-stock-page') loadAdminStockPage();
    if(pageId === 'kasir-page') loadKasirProducts();
    if(pageId === 'barista-page') loadBaristaOrders();
}

// --- HITUNG STOK MAKSIMUM MENU BERDASARKAN RESEP ---
function calculateMaxMenuStock(menu) {
    if(!menu.recipe || menu.recipe.length === 0) return 0;
    let materials = getMaterials();
    let maxPortions = Infinity;

    for(let r of menu.recipe) {
        let mat = materials.find(m => m.id === r.materialId);
        if(!mat || mat.stock <= 0) return 0;
        let possible = Math.floor(mat.stock / r.amount);
        if(possible < maxPortions) maxPortions = possible;
    }
    return maxPortions === Infinity ? 0 : maxPortions;
}

// --- MODUL 4 & 5: ADMIN KELOLA MENU, RESEP & STOK ---
function loadAdminMenuPage() {
    let menus = getMenus();
    let materials = getMaterials();

    // Select dropdown menu & material
    let menuSelect = document.getElementById('recipeMenuSelect');
    let matSelect = document.getElementById('recipeMaterialSelect');

    menuSelect.innerHTML = menus.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    matSelect.innerHTML = materials.map(m => `<option value="${m.id}">${m.name} (${m.unit})</option>`).join('');

    renderAdminMenuList();
    renderRecipePreview();
}

let activeRecipeDraft = [];
document.getElementById('recipeMenuSelect')?.addEventListener('change', function() {
    renderRecipePreview();
});

function renderRecipePreview() {
    let menuId = document.getElementById('recipeMenuSelect').value;
    let menus = getMenus();
    let m = menus.find(x => x.id === menuId);
    let container = document.getElementById('recipePreviewList');
    let materials = getMaterials();

    if(!m || !m.recipe || m.recipe.length === 0) {
        container.innerHTML = '<em>Belum ada resep terdaftar untuk menu ini.</em>';
        return;
    }

    container.innerHTML = '<strong>Resep Saat Ini:</strong><ul style="margin:5px 0 0 15px; padding:0;">' + 
        m.recipe.map(r => {
            let mat = materials.find(x => x.id === r.materialId);
            return `<li>${mat ? mat.name : 'Bahan'} : ${r.amount} ${mat ? mat.unit : ''}</li>`;
        }).join('') + '</ul>';
}

function saveMenu() {
    let name = document.getElementById('inputMenuName').value.trim();
    let category = document.getElementById('inputMenuCategory').value.trim() || 'Umum';
    let price = parseFloat(document.getElementById('inputMenuPrice').value);

    if(!name || isNaN(price)) {
        alert('Mohon isi nama menu dan harga dengan benar!');
        return;
    }

    let menus = getMenus();
    let newMenu = {
        id: 'menu_' + Date.now(),
        name,
        category,
        price,
        recipe: []
    };
    menus.push(newMenu);
    setMenus(menus);

    document.getElementById('inputMenuName').value = '';
    document.getElementById('inputMenuPrice').value = '';
    loadAdminMenuPage();
    addLog(`Menambahkan menu baru: ${name}`);
}

function addRecipeItem() {
    let menuId = document.getElementById('recipeMenuSelect').value;
    let materialId = document.getElementById('recipeMaterialSelect').value;
    let amount = parseFloat(document.getElementById('recipeAmount').value);

    if(!menuId || !materialId || isNaN(amount) || amount <= 0) {
        alert('Takaran resep tidak valid!');
        return;
    }

    let menus = getMenus();
    let m = menus.find(x => x.id === menuId);
    if(m) {
        if(!m.recipe) m.recipe = [];
        // Cek jika bahan sudah ada, update takarannya
        let existing = m.recipe.find(r => r.materialId === materialId);
        if(existing) {
            existing.amount = amount;
        } else {
            m.recipe.push({ materialId, amount });
        }
        setMenus(menus);
        renderRecipePreview();
        renderAdminMenuList();
        document.getElementById('recipeAmount').value = '';
        addLog(`Memperbarui resep untuk menu ${m.name}`);
    }
}

function renderAdminMenuList() {
    let menus = getMenus();
    let materials = getMaterials();
    let tbody = document.getElementById('adminMenuListTbody');

    if(menus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Belum ada menu.</td></tr>';
        return;
    }

    tbody.innerHTML = menus.map(m => {
        let recipeStr = (m.recipe || []).map(r => {
            let mat = materials.find(x => x.id === r.materialId);
            return `${mat ? mat.name : 'Bahan'} (${r.amount} ${mat ? mat.unit : ''})`;
        }).join(', ') || '<em>Belum ada resep</em>';

        return `<tr>
            <td><strong>${m.name}</strong></td>
            <td>${m.category}</td>
            <td>Rp ${m.price.toLocaleString()}</td>
            <td style="font-size:0.85em; color:var(--text-muted);">${recipeStr}</td>
            <td><button class="btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="deleteMenu('${m.id}')">Hapus</button></td>
        </tr>`;
    }).join('');
}

function deleteMenu(id) {
    if(confirm('Yakin ingin menghapus menu ini?')) {
        let menus = getMenus().filter(m => m.id !== id);
        setMenus(menus);
        loadAdminMenuPage();
        addLog(`Menghapus menu ID: ${id}`);
    }
}

// Modul Bahan Baku & Stok
function loadAdminStockPage() {
    let materials = getMaterials();
    let select = document.getElementById('restockMatSelect');
    select.innerHTML = materials.map(m => `<option value="${m.id}">${m.name} (Stok: ${m.stock} ${m.unit})</option>`).join('');
    renderAdminMaterialList();
}

function saveMaterial() {
    let name = document.getElementById('inputMatName').value.trim();
    let unit = document.getElementById('inputMatUnit').value.trim();
    let stock = parseFloat(document.getElementById('inputMatStock').value);

    if(!name || !unit || isNaN(stock)) {
        alert('Mohon isi data bahan baku dengan lengkap!');
        return;
    }

    let materials = getMaterials();
    materials.push({ id: 'mat_' + Date.now(), name, unit, stock });
    setMaterials(materials);

    document.getElementById('inputMatName').value = '';
    document.getElementById('inputMatUnit').value = '';
    document.getElementById('inputMatStock').value = '';
    loadAdminStockPage();
    addLog(`Menambahkan bahan baku baru: ${name}`);
}

function processRestock() {
    let matId = document.getElementById('restockMatSelect').value;
    let qty = parseFloat(document.getElementById('restockQty').value);

    if(!matId || isNaN(qty) || qty <= 0) {
        alert('Jumlah restock tidak valid!');
        return;
    }

    let materials = getMaterials();
    let mat = materials.find(m => m.id === matId);
    if(mat) {
        mat.stock += qty;
        setMaterials(materials);
        document.getElementById('restockQty').value = '';
        loadAdminStockPage();
        addLog(`Restock bahan ${mat.name} sebanyak +${qty} ${mat.unit}`);
        alert(`Berhasil menambah stok ${mat.name}!`);
    }
}

function renderAdminMaterialList() {
    let materials = getMaterials();
    let tbody = document.getElementById('adminMaterialListTbody');

    tbody.innerHTML = materials.map(m => `<tr>
        <td><strong>${m.name}</strong></td>
        <td><strong style="color:var(--primary-navy);">${m.stock}</strong></td>
        <td>${m.unit}</td>
        <td><button class="btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="deleteMaterial('${m.id}')">Hapus</button></td>
    </tr>`).join('');
}

function deleteMaterial(id) {
    if(confirm('Hapus bahan baku ini? Pastikan tidak terikat di resep aktif.')) {
        let materials = getMaterials().filter(m => m.id !== id);
        setMaterials(materials);
        loadAdminStockPage();
        addLog(`Menghapus bahan baku ID: ${id}`);
    }
}

// --- KASIR MODULE ---
function loadKasirProducts() {
    let menus = getMenus();
    let tbody = document.querySelector('#productTable tbody');

    tbody.innerHTML = menus.map(m => {
        let maxStock = calculateMaxMenuStock(m);
        let stockBadge = maxStock > 0 ? `<span style="color:var(--success); font-weight:600;">${maxStock} porsi</span>` : `<span style="color:var(--danger); font-weight:600;">Habis</span>`;
        let btnDisabled = maxStock <= 0 ? 'disabled style="background:#cbd5e1; cursor:not-allowed;"' : '';

        return `<tr>
            <td><strong>${m.name}</strong><br><small style="color:var(--text-muted);">${m.category}</small></td>
            <td>Rp ${m.price.toLocaleString()}</td>
            <td>${stockBadge}</td>
            <td><button class="btn-primary" style="padding:6px 12px; font-size:0.85em;" onclick="addToCart('${m.id}')" ${btnDisabled}>+ Tambah</button></td>
        </tr>`;
    }).join('');
    renderCart();
}

function addToCart(menuId) {
    let menus = getMenus();
    let m = menus.find(x => x.id === menuId);
    if(!m) return;

    let maxStock = calculateMaxMenuStock(m);
    let existing = cart.find(item => item.id === menuId);
    let currentQtyInCart = existing ? existing.qty : 0;

    if(currentQtyInCart + 1 > maxStock) {
        alert('Stok bahan baku tidak mencukupi untuk porsi tambahan ini!');
        return;
    }

    if(existing) {
        existing.qty++;
    } else {
        cart.push({ id: m.id, name: m.name, price: m.price, qty: 1, recipe: m.recipe });
    }
    renderCart();
}

function updateCartQty(menuId, change) {
    let item = cart.find(x => x.id === menuId);
    if(!item) return;

    let menus = getMenus();
    let m = menus.find(x => x.id === menuId);
    let maxStock = calculateMaxMenuStock(m);

    if(change > 0 && item.qty + 1 > maxStock) {
        alert('Stok bahan baku tidak mencukupi!');
        return;
    }

    item.qty += change;
    if(item.qty <= 0) {
        cart = cart.filter(x => x.id !== menuId);
    }
    renderCart();
}

function renderCart() {
    let tbody = document.querySelector('#cartTable tbody');
    let total = 0;

    if(cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Keranjang kosong</td></tr>';
        document.getElementById('totalText').innerText = 'Total: Rp 0';
        return;
    }

    tbody.innerHTML = cart.map(item => {
        let sub = item.price * item.qty;
        total += sub;
        return `<tr>
            <td>${item.name}</td>
            <td>
                <button onclick="updateCartQty('${item.id}', -1)" style="padding:2px 6px;">-</button>
                <span style="margin:0 6px;">${item.qty}</span>
                <button onclick="updateCartQty('${item.id}', 1)" style="padding:2px 6px;">+</button>
            </td>
            <td>Rp ${sub.toLocaleString()}</td>
            <td><button class="btn-danger" style="padding:2px 6px; font-size:0.75em;" onclick="removeFromCart('${item.id}')">x</button></td>
        </tr>`;
    }).join('');

    document.getElementById('totalText').innerText = `Total: Rp ${total.toLocaleString()}`;
}

function removeFromCart(menuId) {
    cart = cart.filter(x => x.id !== menuId);
    renderCart();
}

// --- CHECKOUT & REDUKSI STOK OTOMATIS BERDASARKAN RESEP ---
let currentCheckoutTotal = 0;
function openCheckoutModal() {
    if(cart.length === 0) {
        alert('Keranjang belanja masih kosong!');
        return;
    }
    currentCheckoutTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('modalTotal').innerText = `Rp ${currentCheckoutTotal.toLocaleString()}`;
    document.getElementById('cashInput').value = '';
    document.getElementById('modalChange').innerText = 'Rp 0';
    document.getElementById('btnProcess').disabled = true;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closeCheckoutModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function addCash(amount) {
    let input = document.getElementById('cashInput');
    let current = parseFloat(input.value) || 0;
    input.value = current + amount;
    calculateChange();
}

function resetCash() {
    document.getElementById('cashInput').value = '';
    calculateChange();
}

function calculateChange() {
    let cash = parseFloat(document.getElementById('cashInput').value) || 0;
    let change = cash - currentCheckoutTotal;
    let changeEl = document.getElementById('modalChange');
    let btnProcess = document.getElementById('btnProcess');

    if(change >= 0) {
        changeEl.innerText = `Rp ${change.toLocaleString()}`;
        changeEl.style.color = 'var(--success)';
        btnProcess.disabled = false;
    } else {
        changeEl.innerText = `Kurang Rp ${Math.abs(change).toLocaleString()}`;
        changeEl.style.color = 'var(--danger)';
        btnProcess.disabled = true;
    }
}

function processCheckout() {
    let cash = parseFloat(document.getElementById('cashInput').value) || 0;
    let change = cash - currentCheckoutTotal;

    // REDUKSI STOK BAHAN BAKU BERDASARKAN RESEP
    let materials = getMaterials();
    for(let item of cart) {
        if(item.recipe && item.recipe.length > 0) {
            for(let r of item.recipe) {
                let mat = materials.find(m => m.id === r.materialId);
                if(mat) {
                    mat.stock -= (r.amount * item.qty);
                    if(mat.stock < 0) mat.stock = 0;
                }
            }
        }
    }
    setMaterials(materials);

    // Simpan Transaksi & Antrean Barista
    let trxId = 'TRX-' + Math.floor(1000 + Math.random() * 9000);
    let queueNo = 'A-' + Math.floor(100 + Math.random() * 900);
    let trxData = {
        id: trxId,
        queueNo,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: currentCheckoutTotal,
        cash,
        change,
        status: 'Menunggu Barista'
    };

    let transactions = getTransactions();
    transactions.unshift(trxData);
    setTransactions(transactions);
    addLog(`Checkout Sukses #${trxId} - Total: Rp ${currentCheckoutTotal.toLocaleString()}`);

    closeCheckoutModal();

    // Tampilkan Modal Struk Berhasil
    document.getElementById('successTrxId').innerText = trxId;
    document.getElementById('resQueueNo').innerText = queueNo;
    document.getElementById('resCartItems').innerHTML = cart.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align: right;">Rp ${(i.price*i.qty).toLocaleString()}</td></tr>`).join('');
    document.getElementById('resTotal').innerText = `Rp ${currentCheckoutTotal.toLocaleString()}`;
    document.getElementById('resCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('resChange').innerText = `Rp ${change.toLocaleString()}`;
    document.getElementById('successModal').style.display = 'flex';

    cart = [];
    loadKasirProducts();
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// --- BARISTA MODULE ---
function loadBaristaOrders() {
    let transactions = getTransactions();
    let tbody = document.getElementById('baristaTbody');
    let activeOrders = transactions.filter(t => t.status !== 'Selesai');

    if(activeOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Tidak ada antrean pesanan aktif.</td></tr>';
        return;
    }

    tbody.innerHTML = activeOrders.map(t => {
        let itemsList = t.items.map(i => `${i.name} (${i.qty})`).join(', ');
        let nextActionBtn = '';
        if(t.status === 'Menunggu Barista') {
            nextActionBtn = `<button class="btn-primary" style="padding:6px 12px; font-size:0.85em; background:var(--warning);" onclick="updateOrderStatus('${t.id}', 'Sedang Dibuat')">Proses Buat</button>`;
        } else if(t.status === 'Sedang Dibuat') {
            nextActionBtn = `<button class="btn-primary" style="padding:6px 12px; font-size:0.85em; background:var(--success);" onclick="updateOrderStatus('${t.id}', 'Selesai')">Selesai / Siap Saji</button>`;
        }

        return `<tr>
            <td>${t.time}</td>
            <td><strong>${t.id}</strong><br><small>${t.queueNo}</small></td>
            <td>${itemsList}</td>
            <td><span style="font-weight:600; color:${t.status === 'Sedang Dibuat' ? 'var(--warning)' : 'var(--primary-navy)'};">${t.status}</span></td>
            <td>${nextActionBtn}</td>
        </tr>`;
    }).join('');
}

function updateOrderStatus(trxId, newStatus) {
    let transactions = getTransactions();
    let trx = transactions.find(t => t.id === trxId);
    if(trx) {
        trx.status = newStatus;
        setTransactions(transactions);
        loadBaristaOrders();
        addLog(`Pesanan ${trxId} diubah statusnya menjadi: ${newStatus}`);
    }
}

// --- ADMIN DASHBOARD MODULE ---
function loadAdminDashboard() {
    let transactions = getTransactions();
    let materials = getMaterials();

    let totalTrx = transactions.length;
    let totalOmset = transactions.reduce((sum, t) => sum + t.total, 0);
    let totalItem = transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.qty, 0), 0);
    let basketSize = totalTrx > 0 ? (totalItem / totalTrx).toFixed(1) : 0;
    let avgBelanja = totalTrx > 0 ? Math.round(totalOmset / totalTrx) : 0;

    document.getElementById('dashTrx').innerText = totalTrx;
    document.getElementById('dashOmset').innerText = `Rp ${totalOmset.toLocaleString()}`;
    document.getElementById('dashItem').innerText = totalItem;
    document.getElementById('dashBasket').innerText = basketSize;
    document.getElementById('dashAvg').innerText = `Rp ${avgBelanja.toLocaleString()}`;

    // Tabel Sisa Stok di Dashboard
    let stockTbody = document.getElementById('adminStockTbody');
    stockTbody.innerHTML = materials.map(m => `<tr><td>${m.name}</td><td><strong>${m.stock}</strong> ${m.unit}</td></tr>`).join('');

    // Tabel Log
    let logTbody = document.getElementById('adminLogTbody');
    let logs = getLogs();
    if(logs.length === 0) {
        logTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Belum ada aktivitas.</td></tr>';
    } else {
        logTbody.innerHTML = logs.map(l => `<tr><td>${l.time}</td><td>${l.user}</td><td>${l.action}</td></tr>`).join('');
    }

    renderChart(transactions);
}

function renderChart(transactions) {
    const ctx = document.getElementById('omzetChart').getContext('2d');
    if(chartInstance) chartInstance.destroy();

    // Rekap sederhana per transaksi terakhir
    let labels = transactions.slice(0, 7).reverse().map(t => t.id);
    let data = transactions.slice(0, 7).reverse().map(t => t.total);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.length ? labels : ['1', '2', '3', '4', '5'],
            datasets: [{
                label: 'Omset Transaksi Terakhir (Rp)',
                data: data.length ? data : [0, 0, 0, 0, 0],
                borderColor: '#1e293b',
                backgroundColor: 'rgba(30, 41, 59, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Run initial storage setup on load
initStorage();
