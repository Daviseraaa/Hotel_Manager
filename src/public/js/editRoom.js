document.addEventListener("DOMContentLoaded", function () {
    const furnitureContainer = document.getElementById("furniture-container");
    const newFurnitureContainer = document.getElementById("new-furniture-container");
    const furnitureTemplate = document.getElementById("furniture-template").content;
    const addFurnitureBtn = document.getElementById("add-furniture-btn");
    
    // Add and remove furniture
    addFurnitureBtn.addEventListener("click", () => {
        const newFurniture = document.importNode(furnitureTemplate, true);
        newFurnitureContainer.appendChild(newFurniture);
    });
        
    newFurnitureContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-furniture")) {
            e.target.closest(".furniture-entry").remove();
        }
    });
    furnitureContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-furniture")) {
          e.target.closest(".furniture-entry").remove();
      }
    });

    // Form handler
    const form = document.querySelector("form");
    let initialData = {};
  
    // Capture initial data for comparison
    function captureInitialData() {
      initialData = Array.from(form.elements).reduce((data, input) => {
        if (!["","furniture_name", "furniture_number"].includes(input.name) && input.type !== "file") {
            data[input.name] = input.value;
        }
        return data;
      }, {});

      // Add furiture to data
      initialData.furnitures = Array.from(furnitureContainer.children).map((entry) => ({
        name: entry.querySelector('[name="furniture_name"]').value,
        number: entry.querySelector('[name="furniture_number"]').value,
      }));

      initialData.newFurnitures = [];
    }
    captureInitialData();
  
    // On form submit, send only changed fields
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Collect updated data
      const updatedData = Array.from(form.elements).reduce((data, input) => {
        if (!["","furniture_name", "furniture_number"].includes(input.name) && input.type !== "file") {
            data[input.name] = input.value;
        }
        return data;
      }, {});
      // Add furiture to data
      updatedData.furnitures = Array.from(furnitureContainer.children).map((entry) => ({
        name: entry.querySelector('[name="furniture_name"]').value,
        number: entry.querySelector('[name="furniture_number"]').value,
      }));
      updatedData.newFurnitures = Array.from(newFurnitureContainer.children).map((entry) => ({
        name: entry.querySelector('[name="furniture_name"]').value,
        number: entry.querySelector('[name="furniture_number"]').value,
      }));
  
      // Compare with initial data to find changes
      const changes = {};
      for (const key in updatedData) {
        if (["furnitures", "newFurnitures"].includes(key)) {
          const initialFurnitures = initialData[key] || [];
          const updatedFurnitures = updatedData[key] || [];
          if (JSON.stringify(initialFurnitures) !== JSON.stringify(updatedFurnitures)) {
            changes[key] = updatedFurnitures;
          }
        } else if (updatedData[key] !== initialData[key]) {
          changes[key] = updatedData[key];
        }
      }
  
      console.log(changes)
      // If there are changes, send them via a POST request
      if (Object.keys(changes).length > 0 || document.getElementById("image").files.length > 0) {
        const formData = new FormData();
        for (const key in changes) {
          if (key === "furnitures") {
            let furnitures = new Array()
            changes.furnitures.forEach((item, index) => {
              furnitures.push({name: item.name, number: item.number})
            });
            formData.append("furnitures", JSON.stringify(furnitures))
          } else if (key === "newFurnitures") {
            let newFurnitures = new Array()
            changes.newFurnitures.forEach((item, index) => {
              newFurnitures.push({name: item.name, number: item.number})
            });
            formData.append("newFurnitures", JSON.stringify(newFurnitures))
          } else {
            formData.append(key, changes[key]);
          }
        }
  
        // Add image file if it has changed
        const imageInput = document.getElementById("image");
        if (imageInput.files.length > 0) {
          formData.append("image", imageInput.files[0]);
          formData.append("oldImage", document.getElementById("room_image").getAttribute("src"));
        }
  
        // Send change data to server
        try {
          const response = await fetch(form.action, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (result.success) {
            alert("Cập nhật thành công!");
            location.reload();
          } else {
            alert(result.message);
          }
        } catch (err) {
          console.error("Error updating room:", err);
          alert("Có lỗi xảy ra khi kết nối đến máy chủ!");
        }
      } else {
        alert("Không có thay đổi nào để lưu!");
      }
    });
  });