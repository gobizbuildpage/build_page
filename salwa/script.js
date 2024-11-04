import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js';  
import { onClick } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';

onClick('buttonsimpaninfouser', saveUserInfo);

document.addEventListener('DOMContentLoaded', function() {
    checkCookies();
    loadMenu(); // Panggil loadMenu di sini
});

function checkCookies() {
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    document.getElementById('userModal').style.display = userName && userWhatsapp && userAddress ? 'none' : 'flex';
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
    document.cookie = `${cname}=${cvalue}; ${expires}; path=/`;
}

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

// Fungsi untuk mengambil dan menampilkan menu dari data/menu.json
async function loadMenu() {
    try {
        const response = await fetch('data/menu.json');
        const menuData = await response.json();

        const menuContainer = document.getElementById('menu-container');
        menuContainer.innerHTML = menuData.map(item => `
            <div class="menu-item">
                <h3><i class="fas fa-utensils"></i> ${item.name}</h3>
                <img src="menu/${item.image}" alt="${item.name}">
                <p><i class="fas fa-tag"></i> Rp${item.price.toLocaleString('id-ID')}</p>
                <div class="quantity-controls">
                    <button onclick="changeQuantity('qty${item.id}', ${item.price}, -1)"><i class="fas fa-minus"></i></button>
                    <input type="number" id="qty${item.id}" value="0" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                    <button onclick="changeQuantity('qty${item.id}', ${item.price}, 1)"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Gagal memuat menu:', error);
    }
}

// Fungsi untuk mengubah jumlah item
window.changeQuantity = function(id, price, delta) {
    const qtyInput = document.getElementById(id);
    let currentValue = parseInt(qtyInput.value);
    currentValue = !isNaN(currentValue) ? Math.max(0, currentValue + delta) : 0;
    qtyInput.value = currentValue;
    calculateTotal(); // Panggil calculateTotal setiap kali kuantitas berubah
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

    // Update link WhatsApp
    const whatsappLink = document.getElementById('whatsappLink');
    const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}`;
    whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
}