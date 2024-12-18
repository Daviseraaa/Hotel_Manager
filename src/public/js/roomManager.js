function getImage(number) {
    const image = document.getElementById(`room-row-${number}`).querySelector("img").getAttribute("src");
    return image;
}

function deleteRoom(number) {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng số ${number}?`)) {
        let img = getImage(number);
        console.log(img)
        if (!img) {
            alert('Không tìm thấy thông tin hình ảnh, không thể xóa phòng!');
            return;
        }

        fetch(`./api/delete/${number}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                img: img // Chuyển đổi dữ liệu thành dạng key=value
            }).toString()
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Xóa phòng thành công') {
                alert('Phòng đã được xóa thành công!');
                const row = document.getElementById(`room-row-${number}`);
                row.parentNode.removeChild(row);
            } else {
                alert(data.message);
            }
        })
        .catch(err => {
            alert('Có lỗi xảy ra, vui lòng thử lại!' + err.message);
        });
    }
}