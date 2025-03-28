import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { db } from "./firebase.js"; // Firebase config

// 📌 Mở IndexedDB
export async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ProductDB", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("products")) {
                db.createObjectStore("products", { keyPath: "id", autoIncrement: true });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// 📌 Kiểm tra sản phẩm đã tồn tại chưa
export async function checkProductExists(productName) {
    const db = await openDB();
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");

    // 📦 Lấy toàn bộ sản phẩm từ IndexedDB
    const request = store.getAll();
    const products = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });

    if (!Array.isArray(products)) {
        console.warn("⚠️ Dữ liệu không hợp lệ, products không phải mảng:", products);
        return false;
    }

    // Kiểm tra trong IndexedDB
    if (products.some(p => p.name.toLowerCase() === productName.toLowerCase())) {
        return true;
    }

    // Kiểm tra trong Firebase nếu có mạng
    if (navigator.onLine) {
        try {
            const q = query(collection(db, "products"), where("name", "==", productName));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("❌ Lỗi kiểm tra sản phẩm trên Firebase:", error);
        }
    }

    return false;
}

// 📌 Lưu sản phẩm vào IndexedDB
export async function saveToIndexedDB(product) {
    try {
        const db = await openDB();
        const tx = db.transaction("products", "readwrite");
        const store = tx.objectStore("products");

        const request = store.put(product);
        return new Promise((resolve, reject) => {
            request.onsuccess = async () => {
                console.log("✅ Đã lưu vào IndexedDB:", product);

                // 🔄 Nếu có mạng, đồng bộ Firebase
                if (navigator.onLine) {
                    console.log("🌐 Có mạng! Đồng bộ lên Firebase...");
                    const firebaseID = await saveToFirebase(product);
                    if (firebaseID) {
                        product.firebaseID = firebaseID;
                        await store.put(product); // Cập nhật lại IndexedDB với Firebase ID
                    }
                }

                resolve(true);
            };
            request.onerror = (error) => reject(error);
        });
    } catch (error) {
        console.error("❌ Lỗi khi lưu IndexedDB:", error);
    }
}

// 📌 Lưu sản phẩm vào Firebase
async function saveToFirebase(product) {
    try {
        if (product.firebaseID) {
            console.log("✅ Sản phẩm đã có trên Firebase, không cần thêm lại.");
            return product.firebaseID;
        }

        const docRef = await addDoc(collection(db, "products"), product);
        console.log("✅ Đã lưu vào Firebase:", product);
        return docRef.id;
    } catch (error) {
        console.error("❌ Lỗi khi lưu Firebase:", error);
        return null;
    }
}

// 📌 Đồng bộ IndexedDB với Firebase khi có mạng
export async function syncDataWithFirebase() {
    try {
        const db = await openDB();
        const tx = db.transaction("products", "readwrite");
        const store = tx.objectStore("products");
        const products = await store.getAll();

        if (products.length === 0) {
            console.log("📭 Không có sản phẩm nào cần đồng bộ.");
            return;
        }

        console.log(`🔄 Đang đồng bộ ${products.length} sản phẩm với Firebase...`);

        for (const product of products) {
            if (!product.firebaseID) {
                const firebaseID = await saveToFirebase(product);
                if (firebaseID) {
                    product.firebaseID = firebaseID;
                    await store.put(product);
                }
            }
        }

        console.log("✅ Đồng bộ thành công!");
    } catch (error) {
        console.error("❌ Lỗi đồng bộ dữ liệu:", error);
    }
}

// 🔄 Tự động đồng bộ khi có mạng trở lại
window.addEventListener("online", async () => {
    console.log("🌐 Mạng đã trở lại, tiến hành đồng bộ...");
    await syncDataWithFirebase();
});
