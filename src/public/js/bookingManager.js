function formatDateTime(datetimeString) {
    const date = new Date(datetimeString);

    // Lấy ngày, tháng, năm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // Lấy giờ, phút
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // Trả về chuỗi thời gian định dạng
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Thực hiện định dạng thời gian trên tất cả các phần tử có class `.datetime`
document.addEventListener('DOMContentLoaded', () => {
    const datetimeElements = document.querySelectorAll('.datetime');

    datetimeElements.forEach(element => {
        const originalDatetime = element.textContent.trim();
        const formattedDatetime = formatDateTime(originalDatetime);
        element.textContent = formattedDatetime;
    });

    // Hàm gọi API
    async function callApi(url, method = 'POST') {
        try {
            const response = await fetch(url, { method });
            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Thao tác thành công!');
                // Reload lại trang sau khi thành công
                window.location.reload();
            } else {
                const error = await response.json();
                alert(error.message || 'Có lỗi xảy ra!');
            }
        } catch (err) {
            console.error('API call error:', err);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    }

    // Xử lý xác nhận thanh toán
    const paymentButtons = document.querySelectorAll('.payment-btn');
    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.dataset.id;
            const url = `/admin/api/confirm-payment/${bookingId}`;
            if (confirm('Bạn có chắc chắn muốn xác nhận thanh toán?')) {
                callApi(url);
            }
        });
    });

    // Xử lý checkout
    const checkoutButtons = document.querySelectorAll('.checkout-btn');
    checkoutButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.dataset.id;
            const url = `/admin/api/checkout/${bookingId}`;
            if (confirm('Bạn có chắc chắn muốn thực hiện checkout?')) {
                callApi(url);
            }
        });
    });
});
