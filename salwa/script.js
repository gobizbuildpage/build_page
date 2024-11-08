import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js';  
import { onClick } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';

onClick('buttonsimpaninfouser', saveUserInfo);

document.addEventListener('DOMContentLoaded', function() {
    checkCookies();
    loadMenu(); // Panggil loadMenu di sini
});

// Variabel global untuk menyimpan data menu
let menuData = [];

// Fungsi untuk mengecek cookie
function checkCookies() {
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    document.getElementById('userModal').style.display = userName && userWhatsapp && userAddress ? 'none' : 'flex';
}

// Fungsi untuk menyimpan informasi pengguna
function saveUserInfo() {
    const name = document.getElementById('name').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const address = document.getElementById('address').value;

    if (name && whatsapp && address) {
        setCookie("name", name, 365);
        setCookie("whatsapp", whatsapp, 365);
        setCookie("address", address, 365);
        document.getElementById('userModal').style.display = 'none';
    } else {
        alert("Silakan masukkan semua informasi.");
    }
}

// Fungsi untuk mengatur cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
}

// Fungsi untuk mendapatkan cookie
function getCookie(cname) {
    let name = `${cname}=`;
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "";
}

// Fungsi untuk mengambil dan menampilkan menu dari file JSON
async function loadMenu() {
    try {
        const response = await fetch('data/menu.json');
        menuData = await response.json(); // Simpan data ke variabel global
        displayMenu(menuData); // Tampilkan menu
    } catch (error) {
        console.error('Gagal memuat menu:', error);
    }
}

// Fungsi untuk menampilkan menu berdasarkan data
function displayMenu(data) {
    const menuContainer = document.getElementById('menu-container');
    menuContainer.innerHTML = data.map(item => 
        `<div class="menu-item">
            <h3><i class="fas fa-martini-glass"></i> ${item.name}</h3>
            <img src="menu/${item.image}" alt="${item.name}">
            <p><i class="fas fa-tag"></i> Rp${item.price.toLocaleString('id-ID')}</p>
            <div class="quantity-controls">
                <button onclick="changeQuantity('qty${item.id}', ${item.price}, -1)"><i class="fas fa-minus"></i></button>
                <input type="number" id="qty${item.id}" value="0" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                <button onclick="changeQuantity('qty${item.id}', ${item.price}, 1)"><i class="fas fa-plus"></i></button>
            </div>
        </div>`
    ).join('');
}

// Fungsi untuk menyaring menu berdasarkan kata kunci
function filterMenu(keyword) {
    const filteredData = menuData.filter(item => 
        item.name.toLowerCase().includes(keyword.toLowerCase())
    );
    displayMenu(filteredData);
}

// Tambahkan event listener ke kolom pencarian
document.getElementById('searchBar').addEventListener('input', function(event) {
    const keyword = event.target.value;
    filterMenu(keyword); // Panggil fungsi filterMenu
});

// Fungsi untuk mengubah jumlah item
window.changeQuantity = function(id, price, delta) {
    const qtyInput = document.getElementById(id);
    let currentValue = parseInt(qtyInput.value);
    currentValue = !isNaN(currentValue) ? Math.max(0, currentValue + delta) : 0;
    qtyInput.value = currentValue;
    calculateTotal(); // Hitung total setiap kali kuantitas berubah
}

// Fungsi untuk menghitung total harga
function calculateTotal() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let total = 0;
    let orders = [];

    inputs.forEach(input => {
        const quantity = parseInt(input.value);
        const price = parseInt(input.getAttribute('data-price'));
        const name = input.getAttribute('data-name');

        if (quantity > 0) {
            total += quantity * price;
            orders.push(`${name} x${quantity} - Rp ${(quantity * price).toLocaleString()}`);
        }
    });

    document.getElementById('totalPrice').innerText = `Rp ${total.toLocaleString()}`; // Tampilkan total harga

    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    orders.forEach(order => {
        const li = document.createElement('li');
        li.innerText = order;
        orderList.appendChild(li);
    });

   // Update WhatsApp link
  const whatsappLink = document.getElementById('whatsappLink');
  const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${rek}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
  whatsappLink.href = `https://wa.me/6285221323317?text=${encodeURIComponent(message)}`;
}

// Panggil updateTotal setiap kali quantity berubah
document.querySelectorAll('.quantity-controls input').forEach(input => {
  input.addEventListener('change', updateTotal);
});


document.getElementById('whatsappLink').addEventListener('click', function(event) {
  event.preventDefault();

  const paymentMethod = document.getElementById('paymentMethod').value; // Ambil metode pembayaran yang dipilih
  const rek = "Pembayaran akan dilakukan dengan transfer ke rekening\nBCA 2820321726\nKiki Santi Noviana";
  const userName = getCookie("name");
  const userWhatsapp = getCookie("whatsapp");
  const userAddress = getCookie("address");
  
  const inputs = document.querySelectorAll('input[type="number"]');
  let orders = [];
  let total = 0;

  inputs.forEach(input => {
      const quantity = parseInt(input.value);
      const price = parseInt(input.getAttribute('data-price'));
      const name = input.getAttribute('data-name');

      if (quantity > 0) {
          total += quantity * price;
          orders.push({ name, quantity, price: quantity * price });
      }
  });

  let paymentInfo = paymentMethod === "Transfer" ? rek : "Pembayaran akan dilakukan dengan metode COD.";
  
  const message = `Saya ingin memesan:\n${orders.map(order => `${order.name} x${order.quantity} - Rp ${order.price.toLocaleString()}`).join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${paymentInfo}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
  const whatsappUrl = `https://wa.me/6285221323317?text=${encodeURIComponent(message)}`;

  // Redirect to WhatsApp
  window.open(whatsappUrl, '_blank');

  // POST request to API
  const postData = {
      orders: orders,
      total: total,
      user: {
          name: userName,
          whatsapp: userWhatsapp,
          address: userAddress
      },
      payment: paymentInfo,
      paymentMethod: paymentMethod // Tambahkan paymentMethod ke postData
  };

  postJSON('https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/order/'+getLastPathSegment(), 'login', '', postData, function(response) {
      console.log('API Response:', response);
  });
});




function getLastPathSegment() {
  // Ambil pathname dari URL
  let pathname = window.location.pathname;

  // Hapus leading slash dan trailing slash jika ada
  pathname = pathname.replace(/^\/|\/$/g, '');

  // Pisahkan pathname menjadi bagian-bagian
  let parts = pathname.split('/');

  // Ambil bagian terakhir dari URL
  return parts[parts.length - 1];
}