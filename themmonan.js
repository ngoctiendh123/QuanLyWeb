// Khai báo biến database
let db;

// Mở hoặc tạo IndexedDB
const request = indexedDB.open("MenuDB", 1);

// Cấu hình database khi tạo lần đầu hoặc cập nhật
request.onupgradeneeded = function (event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("foods")) {
        let objectStore = db.createObjectStore("foods", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("name", "name", { unique: true });
    }
};

// Khi mở IndexedDB thành công
request.onsuccess = function (event) {
    db = event.target.result;
};

// Khi có lỗi xảy ra
request.onerror = function (event) {
    console.error("Lỗi IndexedDB:", event.target.errorCode);
};

// Thêm món ăn vào IndexedDB (chỉ khi chưa có)
function addFood() {
    let foodName = document.getElementById("foodName").value.trim();
    let foodPrice = document.getElementById("foodPrice").value.trim();
    let foodQuantity = document.getElementById("foodQuantity").value.trim();

    if (foodName === "" || foodPrice === "" || foodQuantity === "") {
        alert("Vui lòng nhập đầy đủ thông tin món ăn!");
        return;
    }

    let transaction = db.transaction(["foods"], "readonly");
    let objectStore = transaction.objectStore("foods");
    let index = objectStore.index("name");

    let request = index.get(foodName);

    request.onsuccess = function () {
        if (request.result) {
            alert(`Món ăn "${foodName}" đã có trong hệ thống!`);
        } else {
            saveFood(foodName, foodPrice, foodQuantity);
        }
    };

    request.onerror = function () {
        console.error("Lỗi khi kiểm tra món ăn trong IndexedDB");
    };
}

// Lưu món ăn vào IndexedDB nếu chưa có
function saveFood(name, price, quantity) {
    let newFood = {
        name: name,
        price: parseFloat(price),
        quantity: parseInt(quantity)
    };

    let transaction = db.transaction(["foods"], "readwrite");
    let objectStore = transaction.objectStore("foods");

    let request = objectStore.add(newFood);
    request.onsuccess = function () {
        document.getElementById("foodName").value = "";
        document.getElementById("foodPrice").value = "";
        document.getElementById("foodQuantity").value = "";
        alert(`Món ăn "${name}" đã thêm thành công!`);
    };

    request.onerror = function () {
        console.error("Lỗi khi thêm món ăn vào IndexedDB");
    };
}
