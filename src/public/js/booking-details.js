// booking-details.js

// Hàm định dạng ngày giờ
function formatDateTime(dateString) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', options);
}

// Áp dụng định dạng lên các phần tử có data-datetime
function applyDateFormatting() {
    const dateElements = document.querySelectorAll('[data-datetime]');
    dateElements.forEach((element) => {
        const rawDate = element.getAttribute('data-datetime');
        element.textContent = formatDateTime(rawDate);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    applyDateFormatting()
});
