const roomModel = require('../../models/roomModel')
const db = require('../../../config/db')
const serverStore = require('../../../config/serverStore')

const showRooms = async (req, res) => {
    try {
        const { status = 'all', floor = 'all', type = 'all' } = req.query;

        let rooms = await roomModel.getRoomWithStatus(status);

        const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
        const roomTypes = [...new Set(rooms.map(room => room.type))];


        if (floor !== 'all') {
            rooms = rooms.filter(room => room.floor == floor);
        }

        if (type !== 'all') {
            rooms = rooms.filter(room => room.type === type);
        }

        res.render('admin/room/index',
        {
            session: req.session,
            rooms: rooms,
            floors: floors,
            roomTypes: roomTypes,
            status: status,
            floor: floor,
            type: type,
        });
    } catch (err) {
        console.log("Lỗi khi tải danh sách phòng")
        res.status(500).send({ message: 'Lỗi khi tải danh sách phòng: ' + err.message });
    }
}

const renderCreateRoom = async (req, res) => {
    res.render('./admin/room/create',
    {
        session: req.session
    })
}

const handelCreateRoom = async (req, res) => {
    const folderName = 'room';
    const upload = serverStore.uploadWithFolder(folderName);

    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(500).send('Lỗi khi tải lên file!');
        }
        
        var image
        try{
            image = `/img/${folderName}/${req.file.filename}`;
        } catch (err) {
            image = `/img/default/room.jpg`
        }

        const {room_number, floor, area, hour_price, daily_price, type, status, notes, furniture_name, furniture_number} = req.body

        var furniture = [];
        if (furniture_name && furniture_number) {
            let fname = Array.isArray(furniture_name) ? furniture_name : [furniture_name];
            let fnumber = Array.isArray(furniture_number) ? furniture_number : [furniture_number];
    
            for (var i = 0; i < fname.length; i++) {
                furniture.push({ name: fname[i], number: fnumber[i] });
            }
        }
        
        try {
            await roomModel.createRoom(room_number, status, floor, area, hour_price, daily_price, type, image, notes, furniture)

            res.redirect('/admin/room/');
        } catch (err) {
            if (req.file && image !== "/img/default/room.jpg") {
                serverStore.deleteFile(image)
            }            
            return res.status(500).send('Lỗi khi tạo phòng! <br>' + err.message)
        }
    })
};

const renderEditPage = async (req, res) => {
    const {number} = req.params
    try {
        const room = await roomModel.getRoomDetail(number)
        res.render('admin/room/edit',{
            session: req.session,
            room: room
        })
    } catch (err) {
        console.log('Lỗi khi tải thông tin phòng')
        res.status(500).send({message: 'Lỗi khi lấy thông tin phòng: ' + err.message})
    }
}

const handelEditPage = async (req, res) => {
    const folderName = 'room';
    const upload = serverStore.uploadWithFolder(folderName);
    var img

    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(500).send({success: false, message: "Lỗi khi tải file"});
        }
        try {
            try{
                img = `/img/${folderName}/${req.file.filename}`;
            } catch (err) {
                img = undefined;
            }

            const room_number = req.params.number
            const { floor, area, hour_price, daily_price, type, status, notes, furnitures, newFurnitures} = req.body


            await roomModel.editRoom({ room_number, floor, area, hour_price, daily_price, type, status, notes, furnitures, newFurnitures, img })
            if (req.body.oldImage && req.body.oldImage !== "/img/default/room.jpg") {
                serverStore.deleteFile(req.body.oldImage)
            }            

            res.status(200).send({success: true})
        } catch (err) {
            serverStore.deleteFile(img)
            console.log('Lỗi khi sửa phòng' + err.message)
            res.status(500).send({success: false, message: "Lỗi khi sửa phòng"})
        }  
    })
}

const handelDelete = async (req, res) => {
    const { number } = req.params;
    const { img } = req.body;
    try {
        console.log("Đường dẫn hình ảnh cần xóa:", img);

        if (img && img !== "/img/default/room.jpg") {
            // Kiểm tra file có tồn tại trước khi xóa
            const fileExists = serverStore.checkFileExists(img); // Giả sử bạn có hàm kiểm tra
            if (fileExists) {
                serverStore.deleteFile(img);
            } else {
                console.log("Hình ảnh không tồn tại, bỏ qua xóa file:");
            }
        }

        const result = await roomModel.deleteRoom(number);
        if (result) {
            return res.status(200).json({ message: 'Xóa phòng thành công' });
        } else {
            return res.status(404).json({ message: 'Phòng không tồn tại' });
        }
    } catch (err) {
        console.log("Error in delete Room!")
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    showRooms,
    renderCreateRoom,
    handelCreateRoom,
    renderEditPage,
    handelEditPage,
    handelDelete
}