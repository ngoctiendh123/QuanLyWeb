import { openDB, saveToIndexedDB, checkProductExists } from "./indexeddb.js"; // Xử lý IndexedDB

// 📌 Thêm sản phẩm mới
async function addProduct(event) {
    event.preventDefault(); // Ngăn form reload trang

    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value.trim());
    const quantity = parseInt(document.getElementById("productQuantity").value.trim(), 10);

    if (!name || isNaN(price) || isNaN(quantity)) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin hợp lệ!");
        return;
    }

    const product = { name, price, quantity, firebaseID: null };

    // 📌 Kiểm tra xem sản phẩm đã tồn tại chưa
    if (await checkProductExists(name)) {
        alert("⚠️ Sản phẩm đã tồn tại trong hệ thống!");
        return;
    }

    // 🚀 Lưu vào IndexedDB (đồng bộ sẽ xử lý riêng)
    await saveToIndexedDB(product);

    // 🔄 Reset form
    document.getElementById("productForm").reset();
    alert("🎉 Sản phẩm đã được thêm thành công!");
}

// 📌 Gán sự kiện cho nút "Thêm sản phẩm"
document.addEventListener("DOMContentLoaded", () => {
    const addProductBtn = document.getElementById("addProductBtn");
    if (addProductBtn) {
        addProductBtn.addEventListener("click", addProduct);
    } else {
        console.error("❌ Không tìm thấy nút 'Thêm sản phẩm'!");
    }
});
