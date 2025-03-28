import { addProduct } from "./sync.js";
import { loginUser, registerUser, logoutUser } from "./auth.js";

document.getElementById("addProductBtn").addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value.trim());
    const quantity = parseInt(document.getElementById("productQuantity").value.trim(), 10);

    if (!name || isNaN(price) || isNaN(quantity)) {
        alert("⚠️ Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const product = { name, price, quantity };
    await addProduct(product);
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    await loginUser(email, password);
});

document.getElementById("registerBtn").addEventListener("click", async () => {
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    await registerUser(email, password);
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await logoutUser();
});
