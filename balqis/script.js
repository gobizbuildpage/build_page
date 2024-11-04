import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js';
import { onClick } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';

const rek = "Pembayaran akan dilakukan dengan transfer ke rekening\nBCA 7750878347\nNedi Sopian";

onClick('buttonsimpaninfouser', saveUserInfo);

document.addEventListener('DOMContentLoaded', function () {
    checkCookies();

    fetch('./data/menu.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Data menu:', data);  // Debugging untuk melihat apakah data dimuat
            window.menuItems = data;
            renderMenu(menuItems);

            const searchButton = document.getElementById('searchButton');
            const whatsappLink = document.getElementById('whatsappLink');

            if (searchButton) searchButton.addEventListener('click', searchMenu);
            if (whatsappLink) whatsappLink.addEventListener('click', handleOrderSubmission);
        })
        .catch(error => console.error('Error loading menu:', error));
});

document.getElementById("whatsapp").addEventListener("input", function (e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

document.getElementById("buttonsimpaninfouser").addEventListener("click", function () {
    let name = document.getElementById("name").value;
    let whatsapp = document.getElementById("whatsapp").value;
    let address = document.getElementById("address").value;

    if (!name || !whatsapp || !address) {
        alert("Silakan lengkapi semua informasi.");
    } else if (isNaN(whatsapp)) {
        alert("Nomor WhatsApp harus berupa angka.");
    }
});

document.getElementById("searchInput").addEventListener("input", function () {
    let query = this.value.toLowerCase();
    let menuItems = document.querySelectorAll(".menu-item");

    menuItems.forEach(item => {
        let itemName = item.textContent.toLowerCase();
        if (itemName.includes(query)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
});

function searchMenu() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredMenu = window.menuItems.filter(item => item.name.toLowerCase().includes(searchInput));
    renderMenu(filteredMenu);
}

function checkCookies() {
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    if (!userName || !userWhatsapp || !userAddress) {
        document.getElementById('userModal').style.display = 'flex';
    } else {
        document.getElementById('userModal').style.display = 'none';
    }
}

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

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = `${cname}=${cvalue};${expires};path=/`;
}

function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) return c.substring(name.length);
    }
    return "";
}

// Fungsi untuk menampilkan menu
function renderMenu(menuItems) {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';
    menuItems.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <h3>${item.name}</h3>
            <img src="./menu/${item.image}" alt="${item.name}" class="menu-image">
            <div class="menu-footer">
                <p class="price">Rp ${item.price.toLocaleString()}</p>
                <div class="quantity-controls">
                    <button type="button" id="btn${index}" class="btn-tambah" onclick="toggleButton(${index}, ${item.price})">Tambah</button> <!-- Ubah di sini -->
                    <div class="qty-input" id="qtyControl${index}" style="display: none;">
                        <button type="button" class="qty-btn" onclick="changeQuantity('qty${index}', ${item.price}, -1)">-</button>
                        <input type="number" id="qty${index}" name="qty${index}" value="1" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                        <button type="button" class="qty-btn" onclick="changeQuantity('qty${index}', ${item.price}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
} 


// Fungsi untuk menampilkan atau menyembunyikan quantity controls ketika tombol "Add" diklik
window.toggleButton = function (index, price) {
    const addButton = document.getElementById(`btn${index}`);
    const qtyControl = document.getElementById(`qtyControl${index}`);
    const qtyInput = document.getElementById(`qty${index}`);
    
    if (qtyControl.style.display === 'none') {
        addButton.style.display = 'none';
        qtyControl.style.display = 'flex';
        qtyInput.value = 1; // Set nilai awal menjadi 1
        calculateTotal(); // Hitung total setelah tombol "Add" diklik
    } else {
        addButton.style.display = 'block';
        qtyControl.style.display = 'none';
        qtyInput.value = 0; // Reset quantity ke 0
        calculateTotal(); // Hitung ulang total setelah tombol "Add" diklik lagi
    }
};


window.changeQuantity = function (id, price, delta) {
    const qtyInput = document.getElementById(id);
    const currentValue = parseInt(qtyInput.value) || 0;
    qtyInput.value = Math.max(0, currentValue + delta);
    calculateTotal();
}


// Fungsi untuk mengubah quantity
window.changeQuantity = function (id, price, delta) {
    const qtyInput = document.getElementById(id);
    const currentValue = parseInt(qtyInput.value) || 0;
    qtyInput.value = Math.max(0, currentValue + delta);

    // Jika quantity menjadi 0, kembali ke kondisi awal
    if (qtyInput.value == 0) {
        toggleButton(parseInt(id.replace("qty", "")), price);
    }
    
    calculateTotal();
}

// Fungsi untuk menghitung total harga dan menampilkan pesanan
function calculateTotal() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let total = 0;
    let orders = [];
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    inputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const price = parseInt(input.getAttribute('data-price')) || 0;
        const name = input.getAttribute('data-name');

        // Hanya tambahkan item ke total dan daftar pesanan jika quantity lebih dari 0
        if (quantity > 0) {
            total += quantity * price;
            orders.push(`${name} x${quantity} - Rp ${(quantity * price).toLocaleString()}`);
        }
    });

   // Perbarui total harga dan daftar pesanan di UI
   document.getElementById('totalPrice').innerText = total.toLocaleString();

   const orderList = document.getElementById('orderList');
   orderList.innerHTML = '';
   orders.forEach(order => {
       const li = document.createElement('li');
       li.innerText = order;
       orderList.appendChild(li);
   });

    // Update link WhatsApp dengan pesan yang sesuai
    const whatsappLink = document.getElementById('whatsappLink');
    const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${rek}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    whatsappLink.href = `https://wa.me/628111269691?text=${encodeURIComponent(message)}`;
}
function handleOrderSubmission(event) {
    event.preventDefault();

    const paymentMethod = document.getElementById('paymentSelect').value;
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    const inputs = document.querySelectorAll('input[type="number"]');
    let orders = [];
    let total = 0;

    inputs.forEach(input => {
        const quantity = parseInt(input.value) || 0;
        const price = parseInt(input.getAttribute('data-price')) || 0;
        const name = input.getAttribute('data-name');

        if (quantity > 0) {
            total += quantity * price;
            orders.push({ name, quantity, price: quantity * price });
        }
    });

    let paymentInfo = paymentMethod === "Transfer" ? rek : "Pembayaran akan dilakukan dengan metode COD.";

    const message = `Saya ingin memesan:\n${orders.map(order => `${order.name} x${order.quantity} - Rp ${order.price.toLocaleString()}`).join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${paymentInfo}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    const whatsappUrl = `https://wa.me/628111269691?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');

    const postData = {
        orders: orders,
        total: total,
        user: {
            name: userName,
            whatsapp: userWhatsapp,
            address: userAddress
        },
        payment: paymentInfo,
        paymentMethod: paymentMethod
    };

    postJSON('https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/order/' + getLastPathSegment(), 'login', '', postData, function (response) {
        console.log('API Response:', response);
    }, function (error) {
        console.error('Error in POST request:', error);
    });
}

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