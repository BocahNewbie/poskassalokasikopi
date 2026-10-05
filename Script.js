// Konfigurasi Firebase (Sesuaikan dengan project Lokasi Kopi 17 kamu)
const firebaseConfig = {
  databaseURL: "https://lokasi-kopi-17-default-rtdb.firebaseio.com/" // Ganti jika pakai custom domain/region realtime db
};

// Variabel Global Sesi
let userProfile = null;
let chartInstance = null;
let products = [];
let cart = [];
let currentTotal = 0;

// Inisialisasi Firebase Database via REST / SDK (Menggunakan Fetch API agar ringan & kompatibel)
const DB_URL = "https://lokasi-kopi-17-default-rtdb.firebaseio.com";

// ======== FUNGSI LOGIN ========
async function doLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const btn = document.getElementById("btnLogin");
  const err = document.getElementById("loginError");

  if (!user || !pass) {
    err.innerText = "Isi username & password!";
    err.style.display = "block";
    return;
  }

  btn.innerText = "Memeriksa...";
  btn.disabled = true;
  err.style.display = "none";

  try {
    // Ambil data user dari Firebase node /users
    let response = await fetch(`${DB_URL}/users.json`);
    let usersData = await response.json();
    
    let loggedInUser = null;
    if (usersData) {
      // Cari user berdasarkan username & password
      let foundKey = Object.keys(usersData).find(key => {
        let u = usersData[key];
        return u.username === user && u.password === pass;
      });
      if (foundKey) {
        loggedInUser = usersData[foundKey];
      }
    }

    btn.innerText = "Masuk Sistem";
    btn.disabled = false;

    if (loggedInUser) {
      userProfile = loggedInUser;
      document.getElementById("loginWelcomeText").innerText = "Halo, " + userProfile.nama + " (" + userProfile.role + ") 👋";
      document.getElementById("loginSuccessModal").style.display = "flex";

      // Catat log login
      catatLog(userProfile.nama + " (" + userProfile.role + ")", "Login ke sistem");

      setTimeout(function() {
        document.getElementById("loginSuccessModal").style.display = "none";
        document.getElementById("userInfo").innerText = userProfile.nama + " (" + userProfile.role + ")";
        document.getElementById("login-page").style.display = "none";
        document.getElementById("navbar").style.display = "flex";

        if (userProfile.role === "Admin") {
          document.getElementById("adminNav").style.display = "flex";
          showPage("admin-page");
        } else if (userProfile.role === "Kasir") {
          document.getElementById("adminNav").style.display = "none";
          showPage("kasir-page");
        } else if (userProfile.role === "Barista") {
          document.getElementById("adminNav").style.display = "none";
          showPage("barista-page");
        }
      }, 1200);
    } else {
      err.innerText = "Username atau password salah!";
      err.style.display = "block";
    }
  } catch (e) {
    btn.innerText = "Masuk Sistem";
    btn.disabled = false;
    err.innerText = "Koneksi database gagal: " + e.message;
    err.style.display = "block";
  }
}

function logout() {
  if (userProfile) {
    catatLog(userProfile.nama + " (" + userProfile.role + ")", "Logout dari sistem");
  }
  userProfile = null;
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  document.getElementById("loginError").style.display = "none";
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

// ======== FUNGSI LOG AKTIVITAS ========
async function catatLog(userStr, aksiStr) {
  try {
    let waktuStr = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    await fetch(`${DB_URL}/logs.json`, {
      method: "POST",
      body: JSON.stringify({ waktu: waktuStr, user: userStr, aksi: aksiStr })
    });
  } catch(e) {
    console.error("Gagal mencatat log:", e);
  }
}

// ======== FUNGSI KASIR (POS) ========
async function loadKasirData() {
  try {
    let res = await fetch(`${DB_URL}/products.json`);
    let data = await res.json();
    products = [];
    if (data) {
      Object.keys(data).forEach(key => {
        products.push({ id: key, ...data[key] });
      });
    }
    renderProducts();
  } catch (e) {
    console.error("Gagal memuat produk:", e);
  }
}

function renderProducts() {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "";
  if (products.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Belum ada produk di Firebase.</td></tr>";
    return;
  }
  products.forEach(p => {
    tbody.innerHTML += `<tr><td><strong>${p.nama}</strong></td><td>Rp ${p.harga.toLocaleString()}</td><td>${p.stok}</td><td><button onclick="addToCart('${p.id}')">Tambah</button></td></tr>`;
  });
}

function addToCart(id) {
  const product = products.find(p => p.id == id);
  if (!product || product.stok <= 0) {
    alert("Stok habis!");
    return;
  }
  const cartItem = cart.find(item => item.id == id);
  if (cartItem) {
    if (cartItem.qty < product.stok) cartItem.qty++;
    else alert("Stok tidak mencukupi!");
  } else {
    cart.push({ id: product.id, nama: product.nama, harga: product.harga, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const tbody = document.querySelector("#cartTable tbody");
  tbody.innerHTML = "";
  currentTotal = 0;
  cart.forEach(item => {
    let subtotal = item.harga * item.qty;
    currentTotal += subtotal;
    tbody.innerHTML += `<tr><td>${item.nama}</td><td>${item.qty}</td><td>Rp ${subtotal.toLocaleString()}</td></tr>`;
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

function addCash(amount) {
  const el = document.getElementById("cashInput");
  el.value = (parseFloat(el.value) || 0) + amount;
  calculateChange();
}

function resetCash() {
  document.getElementById("cashInput").value = "";
  calculateChange();
}

function calculateChange() {
  const cash = parseFloat(document.getElementById("cashInput").value) || 0;
  const change = cash - currentTotal;
  const btn = document.getElementById("btnProcess");
  const changeEl = document.getElementById("modalChange");
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

async function processCheckout() {
  const cash = parseFloat(document.getElementById("cashInput").value) || 0;
  const change = cash - currentTotal;
  const lastCart = [...cart];
  const lastTotal = currentTotal;
  closeCheckoutModal();

  let trxId = "TRX-" + Math.floor(1000 + Math.random() * 9000);
  let queueNo = "A-" + Math.floor(100 + Math.random() * 900);
  let jamStr = new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

  // Format items untuk barista
  let itemsFormatted = lastCart.map(i => `${i.nama} (${i.qty}x)`);

  let transaksiBaru = {
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

  try {
    // Simpan transaksi ke Firebase
    await fetch(`${DB_URL}/transactions.json`, {
      method: "POST",
      body: JSON.stringify(transaksiBaru)
    });

    // Kurangi stok di Firebase berdasarkan produk yang dibeli
    for (let item of lastCart) {
      let currentProd = products.find(p => p.id === item.id);
      if (currentProd) {
        let sisaStok = currentProd.stok - item.qty;
        await fetch(`${DB_URL}/products/${item.id}.json`, {
          method: "PATCH",
          body: JSON.stringify({ stok: sisaStok })
        });
      }
    }

    // Tampilkan modal sukses
    document.getElementById("successTrxId").innerText = "No. Trx: " + trxId;
    document.getElementById("resQueueNo").innerText = queueNo;
    const resCartEl = document.getElementById("resCartItems");
    resCartEl.innerHTML = "";
    lastCart.forEach(item => {
      resCartEl.innerHTML += `<tr><td>${item.nama}</td><td>${item.qty}x</td><td style="text-align: right;">Rp ${(item.harga * item.qty).toLocaleString()}</td></tr>`;
    });
    document.getElementById("resTotal").innerText = "Rp " + lastTotal.toLocaleString();
    document.getElementById("resCash").innerText = "Rp " + cash.toLocaleString();
    document.getElementById("resChange").innerText = "Rp " + change.toLocaleString();
    document.getElementById("successModal").style.display = "flex";

    cart = [];
    renderCart();
    loadKasirData();
  } catch (e) {
    alert("Gagal memproses transaksi ke Firebase: " + e.message);
  }
}

function printReceipt() {
  window.print();
}

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
}

// ======== FUNGSI BARISTA ========
async function loadBaristaOrders() {
  const tbody = document.getElementById("baristaTbody");
  tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Memuat pesanan dari Firebase...</td></tr>";
  
  try {
    let res = await fetch(`${DB_URL}/transactions.json`);
    let data = await res.json();
    tbody.innerHTML = "";
    
    if (!data) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada pesanan masuk.</td></tr>";
      return;
    }

    let orders = Object.keys(data).map(key => ({ firebaseKey: key, ...data[key] }));
    // Filter hanya yang belum selesai atau urutkan dari yang terbaru
    orders.sort((a, b) => b.timestamp - a.timestamp);

    if (orders.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada pesanan masuk.</td></tr>";
      return;
    }

    orders.forEach(p => {
      let btnHtml = "";
      let statColor = "";
      if (p.status === "Menunggu") {
        statColor = "#f39c12";
        btnHtml = `<button style="background:#f39c12; width:100%;" onclick="updateBaristaStatus('${p.firebaseKey}', '${p.idTrx}', 'Diterima')">1. Terima</button>`;
      } else if (p.status === "Diterima") {
        statColor = "#3498db";
        btnHtml = `<button style="background:#3498db; width:100%;" onclick="updateBaristaStatus('${p.firebaseKey}', '${p.idTrx}', 'Diproses')">2. Proses</button>`;
      } else if (p.status === "Diproses") {
        statColor = "#28a745";
        btnHtml = `<button style="background:#28a745; width:100%;" onclick="updateBaristaStatus('${p.firebaseKey}', '${p.idTrx}', 'Selesai')">3. Selesai ✓</button>`;
      } else {
        statColor = "#7f8c8d";
        btnHtml = `<span style="color:#7f8c8d; font-size:0.9em;">Selesai</span>`;
      }

      let daftarPesananHtml = Array.isArray(p.items) ? p.items.join("<br>") : p.items;
      tbody.innerHTML += `
        <tr id="row-${p.firebaseKey}">
          <td style="vertical-align: top;">${p.jam || '-'}</td>
          <td style="vertical-align: top;"><strong>${p.idTrx}</strong></td>
          <td style="color:#c62828; font-weight:bold; vertical-align: top; line-height: 1.5;">${daftarPesananHtml}</td>
          <td style="vertical-align: top;"><strong style="color:${statColor};">${p.status}</strong></td>
          <td style="vertical-align: top;">${btnHtml}</td>
        </tr>
      `;
    });
  } catch (e) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color:red;'>Gagal memuat antrean.</td></tr>";
  }
}

function updateBaristaStatus(firebaseKey, idTrx, statusBaru) {
  const modal = document.getElementById("baristaConfirmModal");
  const textEl = document.getElementById("baristaConfirmText");
  const yesBtn = document.getElementById("btnConfirmBaristaYes");
  
  textEl.innerText = `Ubah status transaksi [${idTrx}] menjadi "${statusBaru}"?`;
  modal.style.display = "flex";

  yesBtn.onclick = async function() {
    modal.style.display = "none";
    try {
      await fetch(`${DB_URL}/transactions/${firebaseKey}.json`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusBaru })
      });
      loadBaristaOrders();
    } catch (e) {
      alert("Gagal memperbarui status: " + e.message);
    }
  };
}

function closeBaristaModal() {
  document.getElementById("baristaConfirmModal").style.display = "none";
}

// ======== FUNGSI DASHBOARD ADMIN & GRAFIK ========
async function loadAdminDashboard() {
  try {
    let [resTrx, resProd, resLog] = await Promise.all([
      fetch(`${DB_URL}/transactions.json`),
      fetch(`${DB_URL}/products.json`),
      fetch(`${DB_URL}/logs.json`)
    ]);

    let trxData = await resTrx.json();
    let prodData = await resProd.json();
    let logData = await resLog.json();

    // Hitung Metrik Dashboard
    let totalTrx = 0;
    let totalOmset = 0;
    let totalItemKeluar = 0;
    let omsetPerHari = {};

    if (trxData) {
      Object.keys(trxData).forEach(k => {
        let t = trxData[k];
        totalTrx++;
        totalOmset += (t.total || 0);
        if (Array.isArray(t.items)) {
          t.items.forEach(itemStr => {
            // Ekstrak angka qty dari format "Nama (2x)"
            let match = itemStr.match(/\((\d+)x\)/);
            if (match) totalItemKeluar += parseInt(match[1]);
          });
        }
      });
    }

    let basketSize = totalTrx > 0 ? (totalItemKeluar / totalTrx).toFixed(1) : 0;
    let rataBelanja = totalTrx > 0 ? Math.round(totalOmset / totalTrx) : 0;

    document.getElementById("dashTrx").innerText = totalTrx;
    document.getElementById("dashOmset").innerText = "Rp " + totalOmset.toLocaleString();
    document.getElementById("dashItem").innerText = totalItemKeluar;
    document.getElementById("dashBasket").innerText = basketSize;
    document.getElementById("dashAvg").innerText = "Rp " + rataBelanja.toLocaleString();

    // Stok Produk
    const tbodyStock = document.getElementById("adminStockTbody");
    tbodyStock.innerHTML = "";
    let produkArr = [];
    if (prodData) {
      Object.keys(prodData).forEach(k => produkArr.push(prodData[k]));
    }
    if (produkArr.length === 0) {
      tbodyStock.innerHTML = "<tr><td colspan='2'>Data stok kosong.</td></tr>";
    } else {
      produkArr.forEach(p => {
        tbodyStock.innerHTML += `<tr><td>${p.nama}</td><td><strong>${p.stok}</strong></td></tr>`;
      });
    }

    // Log Aktivitas
    const tbodyLog = document.getElementById("adminLogTbody");
    tbodyLog.innerHTML = "";
    let logsArr = [];
    if (logData) {
      Object.keys(logData).forEach(k => logsArr.push(logData[k]));
    }
    logsArr.reverse(); // Terbaru di atas
    if (logsArr.length === 0) {
      tbodyLog.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Belum ada aktivitas.</td></tr>";
    } else {
      logsArr.slice(0, 10).forEach(l => {
        tbodyLog.innerHTML += `<tr><td>${l.waktu}</td><td><strong>${l.user}</strong></td><td>${l.aksi}</td></tr>`;
      });
    }

    // Grafik Chart.js (Dummy 7 hari / data real)
    const ctx = document.getElementById('omzetChart').getContext('2d');
    if (chartInstance) { chartInstance.destroy(); }
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'Kemarin', 'Hari Ini'],
        datasets: [
          {
            label: 'Omset (Rp)',
            data: [0, 0, 0, 0, 0, 0, totalOmset],
            borderColor: '#6f4e37',
            backgroundColor: 'rgba(111, 78, 55, 0.1)',
            borderWidth: 2,
            yAxisID: 'y',
            fill: true,
            tension: 0.3
          },
          {
            label: 'Total Qty Terjual',
            data: [0, 0, 0, 0, 0, 0, totalItemKeluar],
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            borderWidth: 2,
            yAxisID: 'y1',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Omset (Rp)' },
            ticks: { callback: function(value) { return 'Rp ' + value.toLocaleString(); } }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Qty Terjual' },
            grid: { drawOnChartArea: false },
            ticks: { precision: 0 }
          }
        }
      }
    });

  } catch (e) {
    console.error("Gagal memuat dashboard admin:", e);
  }
}
