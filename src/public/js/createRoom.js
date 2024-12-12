document.addEventListener('DOMContentLoaded', function () {
    const addFurnitureBtn = document.getElementById('add-furniture-btn');
    const furnitureContainer = document.getElementById('furniture-container');
  
    // Thêm nội thất mới
    addFurnitureBtn.addEventListener('click', function () {
      const template = document.getElementById('furniture-template').content.cloneNode(true);
      furnitureContainer.appendChild(template);
    });
  
    // Xóa nội thất
    furnitureContainer.addEventListener('click', function (event) {
      if (event.target.classList.contains('remove-furniture')) {
        event.target.parentElement.remove();
      }
    });
  });
  