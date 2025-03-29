function getQueryParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

document.addEventListener("DOMContentLoaded", function () {
    let tableId = getQueryParam("tableId");
    let totalAmount = getQueryParam("total");

    document.getElementById("table-info").textContent = `🔖 Bàn số: ${tableId}`;
    document.getElementById("total-amount").textContent = `💰 Tổng tiền: ${totalAmount}đ`;

    // Tạo URL mã QR có sẵn số tiền thanh toán
    let qrCodeImg = document.getElementById("qr-code");
    qrCodeImg.src = `https://img.vietqr.io/image/MbBank-0945768636-compact.jpg?amount=${totalAmount}`;
});

function goBack() {
    window.history.back();
}

function confirmCashPayment() {
    alert("✅ Thanh toán tiền mặt thành công!");
    window.location.href = "quanlibanan.html"; // Quay về trang chính
}