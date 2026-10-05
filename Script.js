// Ganti dengan URL endpoint API Sheet kamu (misal dari SheetDB.io atau backend API Google Sheets)
const API_ENDPOINT = "https://sheetdb.io/api/v1/nyx7xdmeyab37"; 

let userProfile = null;
let chartInstance = null;
let products = [
  { id: 1, nama: "Kopi Susu Gula Aren", harga: 18000, stok: 50 },
  { id: 2, nama: "Americano", harga: 15000, stok: 40 },
  { id: 3, nama: "Matcha Latte", harga: 22000, stok: 30 }
];
let cart = [];
let currentTotal = 0;
let transactions = [];
let logs = [];

// ======== LOGIN SYSTEM ========
function doLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const err = document.getElementById("loginError");

  if (!user || !pass) {
    err.innerText = "Masukkan username dan password!";
    err.style.display = "block";
    return;
  }

  // Hardcode user default aman untuk kasir/admin/barista lokal
  let accounts = [
    { username: "admin", password: "123", nama: "Administrator", role: "Admin" },
    { username: "kasir", password: "123", nama: "Kasir Lokasi Kopi", role: "Kasir" },
    { username: "barista", password: "123", nama: "Barista Utama", role: "Barista" }
  ];

  let found = accounts.find(a => a.username === user && a.password === pass);

  if (found) {
    userProfile = found;
    document.getElementById("loginWelcomeText").innerText = `Halo, ${userProfile.nama} (${userProfile.role}) 👋`;
    document.getElementById("loginSuccessModal").style.display = "flex";

    setTimeout(() => {
      document.getElementById("loginSuccessModal").style.display = "none";
      document.getElementById("userInfo").innerText = `${userProfile.nama} (${userProfile.role})`;
      document.getElementById("login-page").style.display = "none";
      document.getElementById("navbar").style.display = "flex";

      if (userProfile.role === "Admin") {
        document.getElementById("adminNav").style.display = "flex";
        showPage("admin-page");
      } else if (userProfile.role === "Kasir") {
        showPage("kasir-page");
      } else if (userProfile.role === "Barista") {
        showPage("barista-page");
      }
    }, 1000);
  } else {
    err.innerText = "Username atau password salah!";
    err.style.display = "block";
  }
}

function logout() {
  userProfile = null;
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  document.getElementById("navbar").style.display = "none";
  document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
  document.getElementById("login-page").style.display = "flex";
}

function showPage(pageId) {
  document.querySelectorAll('.page-container').forEach(el => el.style.display = 'none');
  document.getElementById(pageId).style.display = "flex";
  if (pageId === 'kasir-page') loadKasirData();
  if (pageId === 'barista-page') loadBaristaOrders();
  if (pageId === 'admin-page') loadAdminDashboard();
}

// ======== KASIR (POS) ========
function loadKasirData() {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";
  products.forEach(p => {
    tbody.innerHTML += `<tr><td><strong>${p.nama}</strong></td><td>Rp ${p.harga.toLocaleString()}</td><td>${p.stok}</td><td><button onclick="addToCart(${p.id})">Tambah</button></td></tr>`;
  });
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product || product.stok <= 0) {
    alert("Stok habis!");
    return;
  }
  let item = cart.find(i => i.id === id);
  if (item) {
    if (item.qty < product.stok) item.qty++;
    else alert("Stok tidak cukup!");
  } else {
    cart.push({ id: product.id, nama: product.nama, harga: product.harga, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  currentTotal = 0;
  cart.forEach(i => {
    let sub = i.harga * i.qty;
    currentTotal += sub;
    tbody.innerHTML += `<tr><td>${i.nama}</td><td>${i.qty}</td><td>Rp ${sub.toLocaleString()}</td></tr>`;
  });
  document.getElementById("totalText").innerText = "Total: Rp " + currentTotal.toLocaleString();
}

function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Keranjang kosong!");
    return;
  }
  document.getElementById("modalTotal").innerText = "Rp " + currentTotal.toLocaleString();
  document.getElementById("cashInput").value = "";
  document.getElementById("modalChange").innerText = "Rp 0";
  document.getElementById("btnProcess").disabled = true;
  document.getElementById("paymentModal").style.display = "flex";
}

function closeCheckoutModal() {
  document.getElementById("paymentModal").style.display = "none";
}

function addCash(amt) {
  const input = document.getElementById("cashInput");
  input.value = (parseFloat(input.value) || 0) + amt;
  calculateChange();
}

function resetCash() {
  document.getElementById("cashInput").value = "";
  calculateChange();
}

function calculateChange() {
  const cash = parseFloat(document.getElementById("cashInput").value) || 0;
  const change = cash - currentTotal;
  const changeEl = document.getElementById("modalChange");
  const btn = document.getElementById("btnProcess");
  if (change >= 0) {
    changeEl.innerText = "Rp " + change.toLocaleString();
    changeEl.style.color = "#2e7d32";
    btn.disabled = false;
  } else {
    changeEl.innerText = "Kurang Rp " + Math.abs(change).toLocaleString();
    changeEl.style.color = "#c62828";
    btn.disabled = true;
  }
}

function processCheckout() {
  const cash = parseFloat(document.getElementById("cashInput").value) || 0;
  const change = cash - currentTotal;
  const lastCart = [...cart];
  const lastTotal = currentTotal;
  closeCheckoutModal();

  let trxId = "TRX-" + Math.floor(1000 + Math.random() * 9000);
  let queueNo = "A-" + Math.floor(100 + Math.random() * 900);
  let jamStr = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

  let itemsFormatted = lastCart.map(i => `${i.nama} (${i.qty}x)`);

  let newTrx = {
    idTrx: trxId,
    nomorAntrian: queueNo,
    jam: jamStr,
    items: itemsFormatted,
    total: lastTotal,
    tunai: cash,
    kembalian: change,
    status: "Menunggu",
    kasir: userProfile ? userProfile.nama : "Kasir",
    timestamp: Date.now()
  };

  transactions.unshift(newTrx);

  // Kurangi stok lokal
  lastCart.forEach(item => {
    let p = products.find(prod => prod.id === item.id);
    if (p) p.stok -= item.qty;
  });

  // Tampilkan Struk
  document.getElementById("successTrxId").innerText = "No. Trx: " + trxId;
  document.getElementById("resQueueNo").innerText = queueNo;
  const resCart = document.getElementById("resCartItems");
  resCart.innerHTML = "";
  lastCart.forEach(i => {
    resCart.innerHTML += `<tr><td>${i.nama}</td><td>${i.qty}x</td><td style="text-align: right;">Rp ${(i.harga * i.qty).toLocaleString()}</td></tr>`;
  });
  document.getElementById("resTotal").innerText = "Rp " + lastTotal.toLocaleString();
  document.getElementById("resCash").innerText = "Rp " + cash.toLocaleString();
  document.getElementById("resChange").innerText = "Rp " + change.toLocaleString();
  document.getElementById("successModal").style.display = "flex";

  cart = [];
  renderCart();
  loadKasirData();
}

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
}

// ======== BARISTA ========
function loadBaristaOrders() {
  const tbody = document.getElementById("baristaTbody");
  tbody.innerHTML = "";
  if (transactions.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada antrean pesanan.</td></tr>";
    return;
  }

  transactions.forEach((p, idx) => {
    let btnHtml = "";
    let color = "";
    if (p.status === "Menunggu") {
      color = "#f39c12";
      btnHtml = `<button style="background:#f39c12; width:100%;" onclick="updateStatus(${idx}, 'Diterima')">1. Terima</button>`;
    } else if (p.status === "Diterima") {
      color = "#3498db";
      btnHtml = `<button style="background:#3498db; width:100%;" onclick="updateStatus(${idx}, 'Diproses')">2. Proses</button>`;
    } else if (p.status === "Diproses") {
      color = "#28a745";
      btnHtml = `<button style="background:#28a745; width:100%;" onclick="updateStatus(${idx}, 'Selesai')">3. Selesai ✓</button>`;
    } else {
      color = "#7f8c8d";
      btnHtml = `<span style="color:#7f8c8d;">Selesai</span>`;
    }

    tbody.innerHTML += `
      <tr>
        <td>${p.jam}</td>
        <td><strong>${p.idTrx}</strong></td>
        <td>${p.items.join("<br>")}</td>
        <td><strong style="color:${color};">${p.status}</strong></td>
        <td>${btnHtml}</td>
      </tr>
    `;
  });
}

function updateStatus(index, status) {
  transactions[index].status = status;
  loadBaristaOrders();
}

function closeBaristaModal() {
  document.getElementById("baristaConfirmModal").style.display = "none";
}

// ======== ADMIN DASHBOARD ========
function loadAdminDashboard() {
  let totalTrx = transactions.length;
  let totalOmset = transactions.reduce((acc, curr) => acc + curr.total, 0);
  let totalItem = 0;
  transactions.forEach(t => {
    t.items.forEach(itemStr => {
      let m = itemStr.match(/\((\d+)x\)/);
      if (m) totalItem += parseInt(m[1]);
    });
  });

  let basketSize = totalTrx > 0 ? (totalItem / totalTrx).toFixed(1) : 0;
  let avg = totalTrx > 0 ? Math.round(totalOmset / totalTrx) : 0;

  document.getElementById("dashTrx").innerText = totalTrx;
  document.getElementById("dashOmset").innerText = "Rp " + totalOmset.toLocaleString();
  document.getElementById("dashItem").innerText = totalItem;
  document.getElementById("dashBasket").innerText = basketSize;
  document.getElementById("dashAvg").innerText = "Rp " + avg.toLocaleString();

  // Stok table
  const tbodyStock = document.getElementById("adminStockTbody");
  tbodyStock.innerHTML = "";
  products.forEach(p => {
    tbodyStock.innerHTML += `<tr><td>${p.nama}</td><td><strong>${p.stok}</strong></td></tr>`;
  });

  // Log table
  const tbodyLog = document.getElementById("adminLogTbody");
  tbodyLog.innerHTML = `<tr><td>${new Date().toLocaleTimeString()}</td><td>${userProfile ? userProfile.nama : 'System'}</td><td>Akses Dashboard Admin</td></tr>`;

  // Chart
  const ctx = document.getElementById('omzetChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['H-4', 'H-3', 'H-2', 'Kemarin', 'Hari Ini'],
      datasets: [{
        label: 'Omset (Rp)',
        data: [0, 0, 0, 0, totalOmset],
        borderColor: '#6f4e37',
        backgroundColor: 'rgba(111,78,55,0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}
