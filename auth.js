import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "./firebase.js";

/**
 * 📌 Đăng nhập người dùng
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Đăng nhập thành công:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("❌ Lỗi đăng nhập:", error.message);
        alert("⚠️ Sai tài khoản hoặc mật khẩu!");
        return null;
    }
}

/**
 * 🆕 Đăng ký tài khoản mới
 */
export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("🎉 Đăng ký thành công:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("❌ Lỗi đăng ký:", error.message);
        alert("⚠️ Đăng ký thất bại!");
        return null;
    }
}

/**
 * 🚪 Đăng xuất người dùng
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("✅ Đã đăng xuất!");
        alert("Bạn đã đăng xuất thành công.");
    } catch (error) {
        console.error("❌ Lỗi đăng xuất:", error.message);
    }
}
