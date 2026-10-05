// Endpoint SheetDB kamu (POS KASSA)
const SHEETDB_URL = "https://sheetdb.io/api/v1/1j6gs91k72kcy";

let userProfile = null;
let chartInstance = null;
let products = [];
let cart = [];
let currentTotal = 0;

// ======== LOGIN SYSTEM (Membaca Tab DataKaryawan di Sheet) ========
async function doLogin() {
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();
  const btn = document.getElementById("btnLogin");
  const err = document.getElementById("loginError");

  if (!user || !pass) {
    err.innerText = "Masukkan username dan password!";
    err.style.display = "block";
    return;
  }

  btn.innerText = "Memeriksa...";
  btn.disabled = true;
  err.style.display = "none";

  try {
    let response = await fetch(`${SHEETDB_URL}/?sheet=DataKaryawan`);
    let karyawanList = await response.json();
    
    let foundUser = null;
    if (Array.isArray(karyawanList)) {
      foundUser = karyawanList.find(k => 
        k.username && k.username.toString().trim().toLowerCase() === user.toLowerCase() && 
        k.password && k.password.toString().trim() === pass
      );
    }

    btn.innerText = "Masuk Sistem";
    btn.disabled = false;

    if (foundUser) {
      userProfile = {
        username: foundUser.username || foundUser.Username,
        nama: foundUser.nama || foundUser.Nama || "Karyawan",
        role: foundUser.role || foundUser.Role || "Kasir"
      };

      // Catat log login ke tab LogAktivitas
      await catatLogAktivitas(userProfile.nama, "Login Berhasil ke Sistem");

      document.getElementById("loginWelcomeText").innerText = `Halo, ${userProfile.nama} (${userProfile.role}) 👋`;
      document.getElementById("loginSuccessModal").style.display = "flex";

      setTimeout(() => {
        document.getElementById("loginSuccessModal").style.display = "none";
        document.getElementById("userInfo").innerText = `${userProfile.nama} (${userProfile.role})`;
        document.getElementById("login-page").style.display = "none";
        document.getElementById("navbar").style.display = "flex";

        if (userProfile.role.toLowerCase() === "admin") {
          document.getElementById("adminNav").style.display = "flex";
          showPage("admin-page");
        } else if (userProfile.role.toLowerCase() === "kasir") {
          showPage("kasir-page");
        } else if (userProfile.role.toLowerCase() === "barista") {
          showPage("barista-page");
        }
      }, 1000);
    } else {
      err.innerText = "Username atau password salah di database sheet!";
      err.style.display = "block";
    }
  } catch (e) {
    btn.innerText = "Masuk Sistem";
    btn.disabled = false;
    err.innerText = "Gagal koneksi ke SheetDB: " + e.message;
    err.style.display = "block";
  }
}

function logout() {
  if (userProfile) {
    catatLogAktivitas(userProfile.nama, "Logout dari Sistem");
  }
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

// ======== FUNGSI PENCATATAN LOG AKTIVITAS (Tab LogAktivitas) ========
async function catatLogAktivitas(namaUser, aksiStr) {
  try {
    let waktuStr = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    await fetch(`${SHEETDB_URL}/?sheet=LogAktivitas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [{ waktu: waktuStr, user: namaUser, aksi: aksiStr }] })
    });
  } catch (e) {
    console.error("Gagal mencatat log aktivitas:", e);
  }
}

// ======== KASIR (POS) - Membaca Tab Produk ========
async function loadKasirData() {
  const tbody = document.querySelector("#productTable tbody");
  tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Memuat menu dari sheet...</td></tr>";
  try {
    let res = await fetch(`${SHEETDB_URL}/?sheet=Produk`);
    products = await res.json();
    tbody.innerHTML = "";
    if (!Array.isArray(products) || products.length === 0) {
      tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Belum ada produk di sheet Produk.</td></tr>";
      return;
    }
    products.forEach((p, index) => {
      tbody.innerHTML += `<tr><td><strong>${p.nama}</strong></td><td>Rp ${parseFloat(p.harga || 0).toLocaleString()}</td><td>${p.stok || 0}</td><td><button class="btn-secondary" style="padding:6px 10px;" onclick="addToCart(${index})">Tambah</button></td></tr>`;
    });
  } catch (e) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center; color:red;'>Gagal memuat produk dari sheet.</td></tr>";
  }
}

function addToCart(index) {
  const product = products[index];
  if (!product || parseInt(product.stok) <= 0) {
    alert("Stok produk habis!");
    return;
  }
  let item = cart.find(i => i.nama === product.nama);
  if (item) {
    if (item.qty < parseInt(product.stok)) item.qty++;
    else alert("Stok tidak mencukupi!");
  } else {
    cart.push({ nama: product.nama, harga: parseFloat(product.harga), qty: 1 });
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
    alert("Keranjang masih kosong!");
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
    btn.disabled = false;
  } else {
    changeEl.innerText = "Kurang Rp " + Math.abs(change).toLocaleString();
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
  let itemsFormatted = lastCart.map(i => `${i.nama} (${i.qty}x)`).join(", ");

  let newTrx = {
    idTrx: trxId,
    nomorAntrian: queueNo,
    jam: jamStr,
    items: itemsFormatted,
    total: lastTotal,
    tunai: cash,
    kembalian: change,
    status: "Menunggu",
    kasir: userProfile ? userProfile.nama : "Kasir"
  };

  try {
    // 1. Kirim transaksi ke tab 'Transaksi'
    await fetch(`${SHEETDB_URL}/?sheet=Transaksi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [newTrx] })
    });

    // 2. Catat log aktivitas transaksi berhasil
    await catatLogAktivitas(userProfile ? userProfile.nama : "Kasir", `Melakukan Transaksi #${trxId}`);

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
  } catch (e) {
    alert("Gagal menyimpan transaksi ke sheet.");
  }
}

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
}

// ======== BARISTA - Membaca Tab Transaksi ========
async function loadBaristaOrders() {
  const tbody = document.getElementById("baristaTbody");
  tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Memuat antrean...</td></tr>";
  try {
    let res = await fetch(`${SHEETDB_URL}/?sheet=Transaksi`);
    let orders = await res.json();
    tbody.innerHTML = "";
    if (!Array.isArray(orders) || orders.length === 0) {
      tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada pesanan masuk.</td></tr>";
      return;
    }

    orders.reverse().forEach((p) => {
      let color = p.status === "Menunggu" ? "#f39c12" : (p.status === "Diterima" ? "#3498db" : "#28a745");
      tbody.innerHTML += `
        <tr>
          <td>${p.jam || '-'}</td>
          <td><strong>${p.idTrx}</strong></td>
          <td>${p.items}</td>
          <td><strong style="color:${color};">${p.status}</strong></td>
          <td><button class="btn-secondary" onclick="alert('Status diperbarui')">Ubah Status</button></td>
        </tr>
      `;
    });
  } catch (e) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color:red;'>Gagal memuat antrean.</td></tr>";
  }
}

function closeBaristaModal() {
  document.getElementById("baristaConfirmModal").style.display = "none";
}

// ======== ADMIN DASHBOARD - Membaca Tab Produk, Transaksi, & LogAktivitas ========
async function loadAdminDashboard() {
  try {
    let [resTrx, resProd, resLog] = await Promise.all([
      fetch(`${SHEETDB_URL}/?sheet=Transaksi`),
      fetch(`${SHEETDB_URL}/?sheet=Produk`),
      fetch(`${SHEETDB_URL}/?sheet=LogAktivitas`)
    ]);

    let orders = await resTrx.json();
    let prodList = await resProd.json();
    let logList = await resLog.json();

    let totalTrx = Array.isArray(orders) ? orders.length : 0;
    let totalOmset = Array.isArray(orders) ? orders.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0) : 0;

    document.getElementById("dashTrx").innerText = totalTrx;
    document.getElementById("dashOmset").innerText = "Rp " + totalOmset.toLocaleString();
    document.getElementById("dashItem").innerText = totalTrx * 2;
    document.getElementById("dashBasket").innerText = totalTrx > 0 ? "2.0" : "0";
    document.getElementById("dashAvg").innerText = totalTrx > 0 ? "Rp " + Math.round(totalOmset / totalTrx).toLocaleString() : "Rp 0";

    // 1. Tampilkan Sisa Stok Produk dari tab 'Produk'
    const stockTbody = document.getElementById("adminStockTbody");
    stockTbody.innerHTML = "";
    if (Array.isArray(prodList) && prodList.length > 0) {
      prodList.forEach(p => {
        stockTbody.innerHTML += `<tr><td>${p.nama}</td><td><strong>${p.stok || 0}</strong></td></tr>`;
      });
    } else {
      stockTbody.innerHTML = "<tr><td colspan='2'>Belum ada data produk.</td></tr>";
    }

    // 2. Tampilkan Log Aktivitas dari tab 'LogAktivitas'
    const logTbody = document.getElementById("adminLogTbody");
    logTbody.innerHTML = "";
    if (Array.isArray(logList) && logList.length > 0) {
      logList.reverse().slice(0, 10).forEach(l => {
        logTbody.innerHTML += `<tr><td>${l.waktu || '-'}</td><td><strong>${l.user || '-'}</strong></td><td>${l.aksi || '-'}</td></tr>`;
      });
    } else {
      logTbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Belum ada log aktivitas.</td></tr>";
    }

    // Grafik Chart.js
    const ctx = document.getElementById('omzetChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['H-3', 'H-2', 'Kemarin', 'Hari Ini'],
        datasets: [{
          label: 'Omset (Rp)',
          data: [0, 0, 0, totalOmset],
          borderColor: '#00b4d8',
          backgroundColor: 'rgba(0,180,216,0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: { responsive: true }
    });
  } catch (e) {
    console.error("Gagal memuat admin dashboard:", e);
  }
}
