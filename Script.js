<script>
  let userProfile = null;
  let chartInstance = null;
  
  // ======== FUNGSI LOGIN DENGAN POPUP SUKSES ========
  function doLogin() {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;
    const btn = document.getElementById("btnLogin");
    const err = document.getElementById("loginError");
    
    if(!user || !pass) { err.innerText = "Isi username & password!"; err.style.display = "block"; return; }
    
    btn.innerText = "Memeriksa..."; btn.disabled = true;
    
    google.script.run.withSuccessHandler(function(res) {
      btn.innerText = "Masuk Sistem"; btn.disabled = false;
      if(res.sukses) {
        userProfile = res;
        
        document.getElementById("loginWelcomeText").innerText = "Halo, " + res.nama + " (" + res.role + ") 👋";
        document.getElementById("loginSuccessModal").style.display = "flex";
        
        setTimeout(function() {
          document.getElementById("loginSuccessModal").style.display = "none";
          document.getElementById("userInfo").innerText = res.nama + " (" + res.role + ")";
          document.getElementById("login-page").style.display = "none";
          document.getElementById("navbar").style.display = "flex";
          
          if(res.role === "Admin") {
            document.getElementById("adminNav").style.display = "flex";
            showPage("admin-page");
          } else if(res.role === "Kasir") {
            document.getElementById("adminNav").style.display = "none";
            showPage("kasir-page");
          } else if(res.role === "Barista") {
            document.getElementById("adminNav").style.display = "none";
            showPage("barista-page");
          }
        }, 1200);

      } else {
        err.innerText = res.pesan; err.style.display = "block";
      }
    }).prosesLogin(user, pass);
  }

  function logout() {
    if(userProfile) {
      google.script.run.catatLog(userProfile.nama + " (" + userProfile.role + ")", "Logout dari sistem");
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
    
    if(pageId === 'kasir-page') loadKasirData();
    if(pageId === 'barista-page') loadBaristaOrders();
    if(pageId === 'admin-page') loadAdminDashboard();
  }

  // ======== FUNGSI ADMIN & GRAFIK DUAL-AXIS ========
  function loadAdminDashboard() {
    google.script.run.withSuccessHandler(function(data) {
      document.getElementById("dashTrx").innerText = data.totalTransaksi;
      document.getElementById("dashOmset").innerText = "Rp " + data.totalUang.toLocaleString();
      document.getElementById("dashItem").innerText = data.totalProdukKeluar;
      document.getElementById("dashBasket").innerText = data.basketSize;
      document.getElementById("dashAvg").innerText = "Rp " + data.rataBelanja.toLocaleString();
      
      const tbodyStock = document.getElementById("adminStockTbody");
      tbodyStock.innerHTML = "";
      if(data.stokProduk.length === 0) tbodyStock.innerHTML = "<tr><td colspan='2'>Data stok kosong.</td></tr>";
      data.stokProduk.forEach(p => {
        tbodyStock.innerHTML += `<tr><td>${p.nama}</td><td><strong>${p.stok}</strong></td></tr>`;
      });

      const tbodyLog = document.getElementById("adminLogTbody");
      tbodyLog.innerHTML = "";
      if(data.logs.length === 0) {
        tbodyLog.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Belum ada aktifitas.</td></tr>";
      } else {
        data.logs.forEach(l => {
          tbodyLog.innerHTML += `<tr><td>${l.waktu}</td><td><strong>${l.user}</strong></td><td>${l.aksi}</td></tr>`;
        });
      }

      const ctx = document.getElementById('omzetChart').getContext('2d');
      if(chartInstance) { chartInstance.destroy(); }
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.chartLabels,
          datasets: [
            {
              label: 'Omset (Rp)',
              data: data.chartOmzet,
              borderColor: '#6f4e37',
              backgroundColor: 'rgba(111, 78, 55, 0.1)',
              borderWidth: 2,
              yAxisID: 'y',
              fill: true,
              tension: 0.3
            },
            {
              label: 'Total Qty Terjual',
              data: data.chartQty,
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

    }).getDashboardData();
  }

  // ======== FUNGSI KASIR (POS) ========
  let products = [];
  let cart = [];
  let currentTotal = 0;

  function loadKasirData() {
    google.script.run.withSuccessHandler(function(data) {
      products = data; renderProducts();
    }).getProduk();
  }

  function renderProducts() {
    const tbody = document.querySelector("#productTable tbody");
    tbody.innerHTML = "";
    products.forEach(p => {
      tbody.innerHTML += `<tr><td><strong>${p.nama}</strong></td><td>Rp ${p.harga.toLocaleString()}</td><td>${p.stok}</td><td><button onclick="addToCart('${p.id}')">Tambah</button></td></tr>`;
    });
  }

  function addToCart(id) {
    const product = products.find(p => p.id == id);
    if (!product || product.stok <= 0) { alert("Stok habis!"); return; }
    const cartItem = cart.find(item => item.id == id);
    if (cartItem) {
      if (cartItem.qty < product.stok) cartItem.qty++; else alert("Stok tidak mencukupi!");
    } else {
      cart.push({ id: product.id, nama: product.nama, harga: product.harga, qty: 1 });
    }
    renderCart();
  }

  function renderCart() {
    const tbody = document.querySelector("#cartTable tbody");
    tbody.innerHTML = ""; currentTotal = 0;
    cart.forEach(item => {
      let subtotal = item.harga * item.qty; currentTotal += subtotal;
      tbody.innerHTML += `<tr><td>${item.nama}</td><td>${item.qty}</td><td>Rp ${subtotal.toLocaleString()}</td></tr>`;
    });
    document.getElementById("totalText").innerText = "Total: Rp " + currentTotal.toLocaleString();
  }

  function openCheckoutModal() {
    if (cart.length === 0) { alert("Keranjang kosong!"); return; }
    document.getElementById("modalTotal").innerText = "Rp " + currentTotal.toLocaleString();
    document.getElementById("cashInput").value = "";
    document.getElementById("modalChange").innerText = "Rp 0";
    document.getElementById("btnProcess").disabled = true;
    document.getElementById("paymentModal").style.display = "flex";
  }

  function closeCheckoutModal() { document.getElementById("paymentModal").style.display = "none"; }
  function addCash(amount) { const el = document.getElementById("cashInput"); el.value = (parseFloat(el.value) || 0) + amount; calculateChange(); }
  function resetCash() { document.getElementById("cashInput").value = ""; calculateChange(); }
  function calculateChange() {
    const cash = parseFloat(document.getElementById("cashInput").value) || 0;
    const change = cash - currentTotal;
    const btn = document.getElementById("btnProcess");
    const changeEl = document.getElementById("modalChange");
    if (change >= 0) { changeEl.innerText = "Rp " + change.toLocaleString(); changeEl.style.color = "#2e7d32"; btn.disabled = false; } 
    else { changeEl.innerText = "Kurang Rp " + Math.abs(change).toLocaleString(); changeEl.style.color = "#c62828"; btn.disabled = true; }
  }

  function processCheckout() {
    const cash = parseFloat(document.getElementById("cashInput").value) || 0;
    const change = cash - currentTotal;
    const lastCart = [...cart];
    const lastTotal = currentTotal;

    closeCheckoutModal();

    google.script.run.withSuccessHandler(function(res) {
      document.getElementById("successTrxId").innerText = "No. Trx: " + res.idTransaksi;
      document.getElementById("resQueueNo").innerText = res.nomorAntrian;
      
      const resCartEl = document.getElementById("resCartItems");
      resCartEl.innerHTML = "";
      lastCart.forEach(item => {
        resCartEl.innerHTML += `<tr><td>${item.nama}</td><td>${item.qty}x</td><td style="text-align: right;">Rp ${(item.harga * item.qty).toLocaleString()}</td></tr>`;
      });
      document.getElementById("resTotal").innerText = "Rp " + lastTotal.toLocaleString();
      document.getElementById("resCash").innerText = "Rp " + cash.toLocaleString();
      document.getElementById("resChange").innerText = "Rp " + change.toLocaleString();
      document.getElementById("successModal").style.display = "flex";

      cart = []; renderCart(); loadKasirData();
    }).prosesTransaksi(cart, userProfile.nama);
  }

  function printReceipt() { window.print(); }
  function closeSuccessModal() { document.getElementById("successModal").style.display = "none"; }

  // ======== FUNGSI BARISTA DENGAN INSTANT UPDATE (TANPA DELAY) ========
  function loadBaristaOrders() {
    const tbody = document.getElementById("baristaTbody");
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Memuat pesanan...</td></tr>";
    
    google.script.run.withSuccessHandler(function(data) {
      tbody.innerHTML = "";
      if(data.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada pesanan masuk.</td></tr>";
        return;
      }
      data.forEach(p => {
        let btnHtml = ""; let statColor = "";
        
        if (p.status === "Menunggu") {
          statColor = "#f39c12"; 
          btnHtml = `<button style="background:#f39c12; width:100%;" onclick="confirmBaristaAction('${p.idTrx}', 'Diterima')">1. Terima</button>`;
        } else if (p.status === "Diterima") {
          statColor = "#3498db"; 
          btnHtml = `<button style="background:#3498db; width:100%;" onclick="confirmBaristaAction('${p.idTrx}', 'Diproses')">2. Proses</button>`;
        } else if (p.status === "Diproses") {
          statColor = "#28a745"; 
          btnHtml = `<button style="background:#28a745; width:100%;" onclick="confirmBaristaAction('${p.idTrx}', 'Selesai')">3. Selesai ✓</button>`;
        }

        let daftarPesananHtml = p.items.join("<br>");

        tbody.innerHTML += `
          <tr id="row-${p.idTrx}">
            <td style="vertical-align: top;">${p.jam}</td>
            <td style="vertical-align: top;"><strong>${p.idTrx}</strong></td>
            <td style="color:#c62828; font-weight:bold; vertical-align: top; line-height: 1.5;">${daftarPesananHtml}</td>
            <td style="vertical-align: top;"><strong style="color:${statColor};">${p.status}</strong></td>
            <td style="vertical-align: top;">${btnHtml}</td>
          </tr>
        `;
      });
    }).getPesananBarista();
  }

  function confirmBaristaAction(idTrx, statusBaru) {
    const modal = document.getElementById("baristaConfirmModal");
    const textEl = document.getElementById("baristaConfirmText");
    const yesBtn = document.getElementById("btnConfirmBaristaYes");

    textEl.innerText = `Ubah status transaksi [${idTrx}] menjadi "${statusBaru}"?`;
    modal.style.display = "flex";

    yesBtn.onclick = function() {
      modal.style.display = "none";
      
      // OPTIMISTIC UI: Langsung ubah tampilan baris secara instan di layar barista tanpa menunggu server
      const row = document.getElementById(`row-${idTrx}`);
      if(row) {
        const statusCell = row.cells[3];
        const actionCell = row.cells[4];
        
        if(statusBaru === "Diterima") {
          statusCell.innerHTML = `<strong style="color:#3498db;">Diterima</strong>`;
          actionCell.innerHTML = `<button style="background:#3498db; width:100%;" onclick="confirmBaristaAction('${idTrx}', 'Diproses')">2. Proses</button>`;
        } else if(statusBaru === "Diproses") {
          statusCell.innerHTML = `<strong style="color:#28a745;">Diproses</strong>`;
          actionCell.innerHTML = `<button style="background:#28a745; width:100%;" onclick="confirmBaristaAction('${idTrx}', 'Selesai')">3. Selesai ✓</button>`;
        } else if(statusBaru === "Selesai") {
          row.style.transition = "opacity 0.4s";
          row.style.opacity = "0";
          setTimeout(() => row.remove(), 400); // Hilangkan baris jika sudah selesai
        }
      }

      // Kirim proses ke Google Sheets di latar belakang secara senyap
      google.script.run.withSuccessHandler(function(res) {
        // Sinkronisasi data di background agar akurat
      }).updateStatusPesananTrx(idTrx, statusBaru, userProfile.nama);
    };
  }

  function closeBaristaModal() {
    document.getElementById("baristaConfirmModal").style.display = "none";
  }
</script>