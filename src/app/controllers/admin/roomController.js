const roomModel = require('../../models/roomModel')
const db = require('../../../config/db')
const serverStore = require('../../../config/serverStore')

const showRooms = async (req, res) => {
    try {
        const rooms = await roomModel.getRoomData();
        res.render('admin/room/index', { rooms, title: 'Trang quản lý phòng' });
    } catch (err) {
        console.log("Lỗi khi tải danh sách phòng")
        res.status(500).send({ message: 'Lỗi khi tải danh sách phòng: ' + err.message });
    }
}

const renderCreateRoom = async (req, res) => {
    res.render('./admin/room/create')
}


const handelCreateRoom = async (req, res) => {
    const folderName = 'user'
    const upload = serverStore.uploadWithFolder(folderName);

    upload.single('image')(req, res, (err) => {
        if (err) {
          return res.status(500).send('Lỗi khi tải lên file!');
        }
        res.send({path : `/img/${folderName}/${req.file.filename}`})
    });
}
module.exports = {
    showRooms,
    renderCreateRoom,
    handelCreateRoom
}