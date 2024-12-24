document.addEventListener('DOMContentLoaded', () => {
  const addServiceBtn = document.getElementById('add-service-btn');
  const addServiceForm = document.querySelector('.add-service-form');
  const overlay = document.querySelector('.modal-overlay');
  const cancelBtn = document.getElementById('cancel-btn');

  const showAddServiceForm = () => {
    addServiceForm.classList.add('active');
    overlay.classList.add('active');
  };

  const hideAddServiceForm = () => {
    addServiceForm.classList.remove('active');
    overlay.classList.remove('active');
  };

  addServiceBtn.addEventListener('click', showAddServiceForm);
  cancelBtn.addEventListener('click', hideAddServiceForm);
  overlay.addEventListener('click', hideAddServiceForm);

  // Xử lý xóa dịch vụ
  const deleteButtons = document.querySelectorAll(".delete-service-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (e) => {
      const serviceId = button.getAttribute("data-id");
      const confirmed = confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?");
      if (!confirmed) return;

      var img = document.getElementById(`service-row-${serviceId}`).querySelector("img").getAttribute("src")

      try {
        const response = await fetch(`/admin/service/delete/${serviceId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            img: img
          })
        });

        if (response.ok) {
          alert("Dịch vụ đã được xóa thành công!");
          location.reload();
        } else {
          alert("Không thể xóa dịch vụ. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi xóa dịch vụ:", error);
        alert("Đã xảy ra lỗi khi xóa dịch vụ. Vui lòng thử lại sau.");
      }
    });
  });
});
