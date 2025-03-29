// Lấy ID bàn từ URL
// Lấy tableId từ URL để xác định bàn ăn
let db;

const request = indexedDB.open("MenuDB", 1);
function getTableIdFromURL() {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("tableId") || "default"; // Trả về "default" nếu không có tableId
}

// Lấy tableId khi trang tải xong
document.addEventListener("DOMContentLoaded", function () {
    const tableId = getTableIdFromURL();
    document.getElementById("table-info").textContent = `Bạn đang xem thông tin của bàn số ${tableId}`;
    
    // Hiển thị danh sách món ăn đã chọn từ LocalStorage của bàn hiện tại
    displaySelectedItems(tableId);
});

// Hiển thị món ăn đã chọn
function displaySelectedItems() {
    let tableId = getTableIdFromURL();
    if (!tableId) return;

    let cartKey = `cart_${tableId}`;
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];

    let cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = ""; // Xóa danh sách cũ

    if (cartData.length === 0) {
        cartContainer.innerHTML = "<p>Chưa có món ăn nào được chọn.</p>";
        return;
    }

    cartData.forEach(item => {
        let itemElement = document.createElement("div");
        itemElement.innerHTML = `
            <p>${item.name} - ${item.price}đ x ${item.quantity}</p>
            <button onclick="removeFromCart('${item.name}')">❌ Bỏ</button>
        `;
        cartContainer.appendChild(itemElement);
    });
}



// Khởi tạo IndexedDB


request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("foods")) {
        let objectStore = db.createObjectStore("foods", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    loadFoodList(); // Hiển thị danh sách món ăn
    loadSelectedFoods(); // Hiển thị món đã chọn
};

// Hiển thị danh sách món ăn
function loadFoodList() {
    let transaction = db.transaction(["foods"], "readonly");
    let objectStore = transaction.objectStore("foods");

    let request = objectStore.getAll();
    request.onsuccess = function () {
        const foodList = document.getElementById("food-list");
        foodList.innerHTML = "";

        request.result.forEach(food => {
            let foodItem = document.createElement("div");
            foodItem.classList.add("food-item");
            foodItem.innerHTML = `
                <p><strong>${food.name}</strong> - ${food.price}đ</p>
                <button onclick="addSelectedFood('${food.name}', ${food.price})">➕ Chọn</button>
            `;
            foodList.appendChild(foodItem);
        });
    };
}

// Lưu món ăn đã chọn vào LocalStorage
function addSelectedFood(name, price) {
    const tableId = getTableIdFromURL();
    if (!tableId) return alert("Không tìm thấy bàn ăn!");

    let selectedFoods = JSON.parse(localStorage.getItem(`selected_${tableId}`)) || [];

    let existingItem = selectedFoods.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        selectedFoods.push({ name, price, quantity: 1 });
    }

    localStorage.setItem(`selected_${tableId}`, JSON.stringify(selectedFoods));
    loadSelectedFoods();
}

// Hiển thị món ăn đã chọn
function loadSelectedFoods() {
    const tableId = getTableIdFromURL();
    if (!tableId) return;

    let selectedFoods = JSON.parse(localStorage.getItem(`selected_${tableId}`)) || [];
    const selectedList = document.getElementById("selected-list");
    selectedList.innerHTML = "";

    if (selectedFoods.length === 0) {
        selectedList.innerHTML = "<p>Chưa có món nào được chọn!</p>";
        return;
    }

    selectedFoods.forEach((item, index) => {
        let selectedItem = document.createElement("div");
        selectedItem.classList.add("selected-item");
        selectedItem.innerHTML = `
            <p>${item.name} - ${item.price}đ x ${item.quantity}</p>
            <button onclick="removeSelectedFood(${index})">❌ Bỏ</button>
        `;
        selectedList.appendChild(selectedItem);
    });
}

// Xóa món đã chọn
function removeSelectedFood(index) {
    const tableId = getTableIdFromURL();
    let selectedFoods = JSON.parse(localStorage.getItem(`selected_${tableId}`)) || [];
    
    selectedFoods.splice(index, 1);
    localStorage.setItem(`selected_${tableId}`, JSON.stringify(selectedFoods));

    loadSelectedFoods();
}

// Quay lại trang trước
function goBack() {
    window.history.back();
}

// Khi DOM load xong, hiển thị dữ liệu bàn
document.addEventListener("DOMContentLoaded", function () {
    const tableId = getTableIdFromURL();
    if (!tableId) {
        document.getElementById("table-info").textContent = "Không tìm thấy bàn ăn!";
    }
});
function searchFood() {
    let input = document.getElementById("search-food").value.toLowerCase();
    let items = document.querySelectorAll(".food-item");

    items.forEach(item => {
        let nameElement = item.querySelector("p"); // Lấy phần tử <p> đầu tiên
        if (!nameElement) return; // Nếu không tìm thấy thì bỏ qua

        let name = nameElement.textContent.toLowerCase();
        item.style.display = name.includes(input) ? "flex" : "none";
    });
}

function checkout() {
    let tableId = getTableIdFromURL();  
    let cartKey = `selected_${tableId}`;  // Đổi thành selected_ thay vì cart_
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];

    console.log("🔍 Bàn hiện tại:", tableId);
    console.log("📦 Giỏ hàng trước khi thanh toán:", cartData);

    if (cartData.length === 0) {
        alert("Giỏ hàng đang trống!");
        return;
    }
    let totalAmount = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let orderDetails = "Bạn có muốn thanh toán các món sau không?\n";
    cartData.forEach(item => {
        orderDetails += `- ${item.name} x ${item.quantity} : ${item.price * item.quantity}đ\n`;
        orderDetails += `\n💰 Tổng tiền: ${totalAmount}đ`;
    });

    let confirmPayment = confirm(orderDetails);
    if (confirmPayment) {
        alert(`✅ Thanh toán thành công bàn số ${tableId}!`);
        
        localStorage.removeItem(cartKey); // Xóa toàn bộ giỏ hàng
        console.log("🗑️ Giỏ hàng đã bị xóa!");
        window.location.href = `thanhtoan.html?tableId=${tableId}&total=${totalAmount}`;
        
    }
}




function addToCart(name, price) {
    let tableId = getTableIdFromURL();
    let cartKey = `cart_${tableId}`;
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];

    let existingItem = cartData.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartData.push({ name, price, quantity: 1 });
    }

    localStorage.setItem(cartKey, JSON.stringify(cartData));
    displaySelectedItems(tableId); // Cập nhật UI ngay lập tức
}



function loadCart() {
    let tableId = getTableIdFromURL();
    let cartKey = `cart_${tableId}`;
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];
    let selectedList = document.getElementById("selected-list");

    selectedList.innerHTML = ""; // Xóa nội dung cũ

    if (cartData.length === 0) {
        selectedList.innerHTML = "<p>Giỏ hàng trống.</p>";
        return;
    }

    cartData.forEach(item => {
        let listItem = document.createElement("div");
        listItem.innerHTML = `${item.name} - ${item.quantity} x ${item.price}đ
            <button onclick="removeFromCart('${item.name}')">❌ Bỏ</button>`;
        selectedList.appendChild(listItem);
    });
}



