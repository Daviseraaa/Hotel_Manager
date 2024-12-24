document.addEventListener('DOMContentLoaded', () => {
  const editServiceForm = document.querySelector('.edit-service-form');
  const overlay = document.querySelector('.modal-overlay');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editServiceFormData = document.querySelector('.edit-service-form form');

  /**
   * Hiển thị form sửa dịch vụ với dữ liệu từ hàng được chọn
   * @param {string} serviceId ID của dịch vụ
   */
  const openEditForm = async (serviceId) => {
    try {
      const response = await fetch(`/admin/service/${serviceId}`);
      if (!response.ok) throw new Error("Không thể tải dữ liệu dịch vụ.");

      const service = await response.json();

      // Điền dữ liệu vào form sửa
      editServiceFormData.querySelector("input[name='id']").value = service.id;
      document.getElementById("edit-name").value = service.name;
      document.getElementById("edit-price").value = service.price;
      document.getElementById("edit-inventory").value = service.inventory;
      document.getElementById("edit-unit").value = service.unit;
      document.getElementById("edit-income").value = service.income;
      document.getElementById("edit-current-image").src = service.image || "/img/default/service.jpg";

      // Hiển thị form sửa
      editServiceForm.classList.add('active');
      overlay.classList.add('active');
    } catch (error) {
      alert("Đã xảy ra lỗi khi tải dữ liệu dịch vụ.");
      console.error(error);
    }
  };

  const closeEditForm = () => {
    editServiceForm.classList.remove('active');
    overlay.classList.remove('active');
  };

  editServiceFormData.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const serviceId = editServiceFormData.querySelector("input[name='id']").value;
    
    const formData = new FormData(editServiceFormData);
    const currentImage = document.getElementById("edit-current-image").getAttribute("src");
    formData.append("currentImage", currentImage);
    
    try {
      const response = await fetch(`/admin/service/edit/${serviceId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Dịch vụ đã được cập nhật thành công!");
        location.reload(); // Làm mới trang sau khi cập nhật thành công
      } else {
        throw new Error("Không thể cập nhật dịch vụ.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi cập nhật dịch vụ.");
      console.error(error);
    }
  });

  cancelEditBtn.addEventListener('click', closeEditForm);
  overlay.addEventListener('click', closeEditForm);

  // Thêm sự kiện mở form sửa khi nhấn nút "Sửa"
  document.querySelectorAll('.edit-service-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const serviceId = button.getAttribute('data-id');
      openEditForm(serviceId);
    });
  });
});
