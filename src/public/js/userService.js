document.addEventListener('DOMContentLoaded', () => {
  const roomSelect = document.getElementById('room_number');
  const servicesContainer = document.querySelector('.services-container');

  servicesContainer.addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.target;
    const roomNumber = form.querySelector('[name="room_number"]').value;
    const serviceId = form.querySelector('[name="service_id"]').value;
    const quantity = form.querySelector('[name="quantity"]').value;

    fetch('/user/service/add/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room_number: roomNumber,
        service_id: serviceId,
        quantity: quantity,
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error('Lỗi:', error);
      alert('Đã xảy ra lỗi khi thêm dịch vụ.');
    });
  });
});
