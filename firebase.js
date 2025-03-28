// 📌 Import Firebase SDK từ CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } 
from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc, getDocs, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { openDB } from "./indexeddb.js"; // Import IndexedDB để làm cơ sở dữ liệu offline

// 🔥 **Cấu hình Firebase**
const firebaseConfig = {
    apiKey: "AIzaSyAizpMjBCqw-19Iwec-D51lR3Zj5GScCx8",
    authDomain: "quanlyungdung-2aca0.firebaseapp.com",
    projectId: "quanlyungdung-2aca0",
    storageBucket: "quanlyungdung-2aca0.appspot.com",
    messagingSenderId: "384810288132",
    appId: "1:384810288132:web:3f9e62e50a4b6b02ab6151",
    measurementId: "G-GKWQV2LX1B"
};

// 📌 **Khởi tạo Firebase**
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 **Xuất module Firebase để dùng trong các file khác**
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setDoc, doc, getDocs, deleteDoc };

/**
 * 🔐 **Đăng nhập người dùng**
 */
export async function loginWithDefaultUser() {
    const defaultEmail = "admin@example.com";  // 📌 Tài khoản mặc định
    const defaultPassword = "123456";          // 🔑 Mật khẩu mặc định

    try {
        const userCredential = await signInWithEmailAndPassword(auth, defaultEmail, defaultPassword);
        console.log("✅ Đăng nhập thành công với tài khoản mặc định:", userCredential.user);
        alert("🎉 Đăng nhập thành công!");
        return userCredential.user;
    } catch (error) {
        console.error("❌ Lỗi đăng nhập tài khoản mặc định:", error.message);
        alert("⚠️ Lỗi đăng nhập, vui lòng thử lại!");
        return null;
    }
}

/**
 * 🚪 **Đăng xuất người dùng**
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("✅ Đã đăng xuất!");
        alert("Bạn đã đăng xuất thành công.");
    } catch (error) {
        console.error("❌ Lỗi khi đăng xuất:", error.message);
    }
}

/**
 * 📦 **Thêm sản phẩm vào IndexedDB & Firebase**
 */
export async function addProduct(product) {
    try {
        // Mở IndexedDB
        const dbIndexedDB = await openDB();
        const tx = dbIndexedDB.transaction("products", "readwrite");
        const store = tx.objectStore("products");

        // Kiểm tra sản phẩm có tồn tại chưa
        const existingProduct = await store.get(product.name);
        if (existingProduct) {
            console.warn("⚠️ Sản phẩm đã tồn tại trong IndexedDB:", product.name);
            return;
        }

        // ✅ Thêm vào IndexedDB
        await store.put(product);
        console.log("✅ Sản phẩm đã lưu vào IndexedDB:", product);

        // 🌐 Nếu có mạng, thêm vào Firebase Firestore
        if (navigator.onLine) {
            await setDoc(doc(db, "products", product.name), product);
            console.log("✅ Sản phẩm đã lưu vào Firebase:", product);
        }
    } catch (error) {
        console.error("❌ Lỗi khi thêm sản phẩm:", error);
    }
}

/**
 * 🔄 **Đồng bộ dữ liệu từ IndexedDB lên Firebase khi có mạng**
 */
export async function syncOfflineData() {
    if (!navigator.onLine) return;

    console.log("🌐 Đang đồng bộ dữ liệu từ IndexedDB lên Firebase...");

    try {
        const dbIndexedDB = await openDB();
        const tx = dbIndexedDB.transaction("products", "readonly");
        const store = tx.objectStore("products");
        const products = await store.getAll();

        for (const product of products) {
            await setDoc(doc(db, "products", product.name), product);
            console.log("✅ Đã đồng bộ sản phẩm lên Firebase:", product.name);
        }

        console.log("🎉 Đồng bộ hoàn tất!");
    } catch (error) {
        console.error("❌ Lỗi khi đồng bộ:", error);
    }
}

// 📡 **Tự động đồng bộ khi có mạng**
window.addEventListener("online", syncOfflineData);

/**
 * 🗑️ **Xóa sản phẩm từ IndexedDB & Firebase**
 */
export async function deleteProduct(productName) {
    try {
        // Xóa khỏi IndexedDB
        const dbIndexedDB = await openDB();
        const tx = dbIndexedDB.transaction("products", "readwrite");
        const store = tx.objectStore("products");
        await store.delete(productName);
        console.log(`🗑️ Đã xóa sản phẩm ${productName} khỏi IndexedDB`);

        // Xóa khỏi Firebase Firestore nếu có mạng
        if (navigator.onLine) {
            await deleteDoc(doc(db, "products", productName));
            console.log(`🗑️ Đã xóa sản phẩm ${productName} khỏi Firebase Firestore`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm:", error);
    }
}

/**
 * 📂 **Lấy danh sách sản phẩm từ Firebase Firestore**
 */
export async function fetchProductsFromFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push(doc.data());
        });
        console.log("📥 Đã tải danh sách sản phẩm từ Firebase:", products);
        return products;
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm từ Firebase:", error);
        return [];
    }
}
