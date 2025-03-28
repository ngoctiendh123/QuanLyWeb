import { openDB } from "./indexeddb.js";

// ========================== MENU ==========================

function toggleMenu() {
    let menu = document.getElementById("menu");
    if (menu) {
        menu.classList.toggle("active");
    } else {
        console.error("❌ Không tìm thấy menu!");
    }
}

document.addEventListener("click", function(event) {
    let menu = document.getElementById("menu");
    let menuButton = document.querySelector(".menu-btn");
    
    if (menu && menuButton && !menu.contains(event.target) && !menuButton.contains(event.target)) {
        menu.classList.remove("active");
    }
});

// ========================== HIỂN THỊ SẢN PHẨM ==========================

async function displayProducts() {
    try {
        console.log("🚀 Đang mở IndexedDB...");
        const db = await openDB();
        console.log("✅ IndexedDB mở thành công!");

        const transaction = db.transaction("products", "readonly");
        const store = transaction.objectStore("products");
        const products = await store.getAll();
        console.log("📦 Dữ liệu lấy từ IndexedDB:", products);

        const productList = document.getElementById("productList");
        if (!productList) {
            console.error("❌ Không tìm thấy phần tử 'productList'");
            return;
        }

        productList.innerHTML = "";

        if (!products || products.length === 0) {
            productList.innerHTML = "<p class='no-products'>⚠️ Chưa có sản phẩm nào!</p>";
            return;
        }

        products.forEach(product => {
            if (!product.name || !product.price || !product.quantity) {
                console.warn("⚠️ Dữ liệu sản phẩm bị thiếu:", product);
                return;
            }

            const productItem = document.createElement("div");
            productItem.classList.add("product-card");
            productItem.innerHTML = `
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>Giá:</strong> ${Number(product.price).toLocaleString()} VND</p>
                    <p><strong>Số lượng:</strong> ${product.quantity}</p>
                </div>
                <button class="edit-btn" data-name="${product.name}">✏️ Sửa</button>
                <button class="delete-btn" data-name="${product.name}">❌ Xóa</button>
            `;
            productList.appendChild(productItem);
        });

    } catch (error) {
        console.error("❌ Lỗi khi hiển thị sản phẩm:", error);
    }
}

// ========================== XÓA SẢN PHẨM ==========================
async function deleteProduct(productName) {
    try {
        const db = await openDB();
        const transaction = db.transaction("products", "readwrite");
        const store = transaction.objectStore("products");
        await store.delete(productName);
        console.log(`✅ Đã xóa sản phẩm: ${productName}`);
        displayProducts();
    } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm:", error);
    }
}

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
        const productName = event.target.getAttribute("data-name");
        if (confirm(`Bạn có chắc muốn xóa sản phẩm \"${productName}\"?`)) {
            deleteProduct(productName);
        }
    }
});

// ========================== KHỞI CHẠY ==========================
document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 DOM đã tải xong!");
    displayProducts();
    let menuButton = document.querySelector(".menu-btn");
    if (menuButton) {
        menuButton.addEventListener("click", toggleMenu);
    }
});
