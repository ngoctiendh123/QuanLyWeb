import { auth, signInWithEmailAndPassword } from "./firebase.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        // Đăng nhập bằng Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Đăng nhập thành công:", userCredential.user);
        
        // Chuyển hướng đến trang chính
        window.location.href = "giaodien.html";
    } catch (error) {
        console.error("❌ Lỗi đăng nhập:", error.message);
        errorMessage.textContent = "Sai tài khoản hoặc mật khẩu!";
    }
});

// 📌 Tự động điền tài khoản mặc định
document.getElementById("email").value = "admin@gmail.com";
document.getElementById("password").value = "123456";
