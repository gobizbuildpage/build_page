import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js';  // Sesuaikan path sesuai dengan lokasi file Anda
import { onClick } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';


onClick('buttonsimpaninfouser', saveUserInfo);

// Event listener pada tombol simpan
document.addEventListener('DOMContentLoaded', function () {
    checkCookies();

    fetch('./data/menu.json')
        .then(response => response.json())
        .then(data => {
            renderMenu(data);
        })
        .catch(error => console.error('Error loading menu:', error));

    const saveButton = document.getElementById("buttonsimpaninfouser");
    if (saveButton) {
        saveButton.addEventListener("click", () => {
            saveUserInfo();
            hideModal();
        });
    }
});

function checkCookies() {
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    if (!userName || !userWhatsapp || !userAddress) {
        showModal();
    } else {
        hideModal();
    }
}

//fungsi untuk menyimpan informasi pengguna
function saveUserInfo() {
    const name = document.getElementById('name').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const address = document.getElementById('address').value;

    if (name && whatsapp && address) {
        setCookie("name", name, 365);
        setCookie("whatsapp", whatsapp, 365);
        setCookie("address", address, 365);
        hideModal();
    } else {
        alert("Silakan masukkan semua informasi.");
    }
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(name) === 0) {
            return c.substring(name.length);
        }
    }
    return "";
}

function renderMenu(menuItems) {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = ''; // Bersihkan elemen menuGrid sebelum menambahkan item baru

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        // Struktur HTML untuk setiap item menu
        menuItem.innerHTML = `
            <img src="./menu/${item.image}" alt="${item.name}" class="menu-image">
            <div class="menu-info">
                <div class="price-quantity">
                    <p class="price">Rp ${item.price.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, -1)">-</button>
                        <input type="number" id="qty${item.id}" name="qty${item.id}" value="0" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                        <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, 1)">+</button>
                    </div>
                </div>
                <div class="name-button">
                    <h3 class="product-name">${item.name}</h3>
                </div>
            </div>
        `;
        
        // Menambahkan item ke dalam menu grid
        menuGrid.appendChild(menuItem);
    });
}

//function changeQuantity(id, price, delta) {
window.changeQuantity = function (id, price, delta) {
    var qtyInput = document.getElementById(id);
    var currentValue = parseInt(qtyInput.value);
    if (!isNaN(currentValue)) {
        qtyInput.value = Math.max(0, currentValue + delta); // Tidak boleh kurang dari 0
    } else {
        qtyInput.value = 0;
    }
    calculateTotal(); // Perbarui total setiap kali kuantitas berubah
}
function calculateTotal() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let total = 0;
    let orders = [];
    const rek = "Pembayaran akan dilakukan dengan metode COD";
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    // Kosongkan orderList sebelum mengisi ulang
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = ''; // Kosongkan order list

    inputs.forEach(input => {
        const quantity = parseInt(input.value);
        const price = parseInt(input.getAttribute('data-price'));
        const name = input.getAttribute('data-name');

        if (quantity > 0) {
            total += quantity * price;
            // Tambahkan item ke daftar pesanan
            addItemToOrderList(name, quantity, quantity * price);
        }
    });

    // Tampilkan total
    document.getElementById('totalPrice').innerText = total.toLocaleString();

    // Update WhatsApp link
    const whatsappLink = document.getElementById('whatsappLink');
    const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${rek}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    whatsappLink.href = `https://wa.me/6285607253198?text=${encodeURIComponent(message)}`;
}


document.getElementById('whatsappLink').addEventListener('click', function (event) {
    event.preventDefault();

    const paymentMethod = document.getElementById('paymentMethod').value; // Ambil metode pembayaran yang dipilih
    const rek = "Pembayaran akan dilakukan dengan metode COD";
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
    const whatsappUrl = `https://wa.me/6285607253198?text=${encodeURIComponent(message)}`;

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

    postJSON('https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/order/' + getLastPathSegment(), 'login', '', postData, function (response) {
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

function searchMenu() {
    const query = document.getElementById("searchInput").value;
    if (query) {
        console.log("Hasil pencarian untuk:", query);
        alert(`Hasil pencarian untuk: ${query}`);
        // Tambahkan logika pencarian sesuai kebutuhan, seperti mengarahkan ke halaman hasil
    } else {
        alert("Masukkan kata kunci pencarian.");
    }
}

const saveButton = document.getElementById("buttonsimpaninfouser");

// Fungsi untuk menampilkan modal
function showModal() {
    const modal = document.getElementById("userModal");
    modal.style.display = "block";
}

// Fungsi untuk menyembunyikan modal
function hideModal() {
    const modal = document.getElementById("userModal");
    modal.style.display = "none";
}

// Tambahkan event listener pada tombol simpan
saveButton.addEventListener("click", hideModal);

// Memanggil showModal() pada event yang diinginkan
document.getElementById("buttonsimpaninfouser").addEventListener("click", hideModal);

// Menutup modal saat klik di luar modal
window.onclick = function (event) {
    const modal = document.getElementById("userModal");
    if (event.target == modal) {
        hideModal();
    }
};

// Tambahkan fungsi ke window agar dapat diakses di HTML
window.showModal = showModal;
window.hideModal = hideModal;

function addItemToOrderList(menuName, quantity, price) {
    const orderList = document.getElementById("orderList");

    // Panggil fungsi ini satu kali saat mengatur ulang order list
    addOrderHeader();


    // Buat elemen baru untuk item pesanan
    const listItem = document.createElement("li");

    // Tambahkan tiga span untuk Menu, Satuan, dan Harga
    listItem.innerHTML = `
        <span>${menuName}</span>
        <span>${quantity}</span>
        <span>Rp ${price.toLocaleString()}</span>
    `;

    orderList.appendChild(listItem);
}

function addOrderHeader() {
    const orderList = document.getElementById("orderList");

    // Cek apakah header sudah ditambahkan
    if (!orderList.querySelector(".order-header")) {
        const headerItem = document.createElement("li");
        headerItem.classList.add("order-header");
        headerItem.innerHTML = `
            <span>Menu</span>
            <span>Satuan</span>
            <span>Harga</span>
        `;
        orderList.appendChild(headerItem);
    }
}


