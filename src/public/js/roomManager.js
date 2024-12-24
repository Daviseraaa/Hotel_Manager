function getImage(number) {
    const image = document.getElementById(`room-row-${number}`).querySelector("img").getAttribute("src");
    return image;
}

function deleteRoom(number) {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng số ${number}?`)) {
        let img = getImage(number);
        console.log('Image URL:', img);

        if (!img) {
            alert('Không tìm thấy thông tin hình ảnh, không thể xóa phòng!');
            return;
        }

        fetch(`/admin/room/delete/${number}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                img: img
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
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
            console.error('Fetch error:', err);
            alert('Có lỗi xảy ra, vui lòng thử lại! ' + err.message);
        });
    }
}
