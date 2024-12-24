const db = require('../../../config/db')
const userModel = require('../../models/userModel')
const bookingModel = require('../../models/bookingModel')
const serverStore = require('../../../config/serverStore')


const renderUserList = async (req, res) => {
    try {
        const users = await userModel.getAllUser()
        res.render('admin/user/index', {
            session: req.session,
            users: users
        })
    } catch (err) {
        console.log("ERROR in listing user!")
        res.status(500).send(`Lỗi trong quá trình tải trang ${err.message}`)
    }
}

const renderUserEdit = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.getUserInfor(userId); // Lấy thông tin người dùng từ DB
        const roles = ['user', 'admin', 'manager']; // Lựa chọn vai trò
    
        if (!user) {
          return res.status(404).send('Người dùng không tồn tại');
        }
    
        res.render('admin/user/edit', {
            session: req.session,
            user: user, 
            roles: roles 
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
      }
}

const editUser = async (req, res) => {
    const userId = req.params.id
    const folderName = 'user';
    const upload = serverStore.uploadWithFolder(folderName);

    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(500).send({success: false, message: "Lỗi khi tải file"});
        }
        var img
        try {
            const oldImage = req.body.oldImage

            try{
                img = `/img/${folderName}/${req.file.filename}`;
            } catch (err) {
                img = oldImage;
            }

            const user = {...req.body, img: img}


            if (img !== oldImage && oldImage !== '/img/default/prof.jpg') {
                serverStore.deleteFile(oldImage)
            }
            await userModel.updateUser(userId, user)
            
            res.redirect(`/admin/user/edit/${userId}`)
        } catch (err) {
            serverStore.deleteFile(img)
            console.log("ERROR in edit user!")
            res.status(500).send(`Lỗi trong quá trình sửa người dùng ${err.message}`)
        }
    })
}

const renderUserView = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await userModel.getUserInfor(userId);
        const bookings = await bookingModel.findByUserId(userId);

        if (!user) {
            return res.status(404).send('Người dùng không tồn tại');
        }

        res.render('admin/user/view', {
            session: req.session,
            user: user, 
            bookings: bookings 
        });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      res.status(500).send('Lỗi server');
    }
}

const confirmPayment = async (req, res) => {
    const bookingId = req.params.id;
    try {
        const amount = await bookingModel.calculateTotalAmount(bookingId)
        await bookingModel.confirmPayment(bookingId, amount)

        res.status(200).json({ message: 'Xác nhận thanh toán thành công.' });
    } catch (err) {
        console.error(err);
        await db.rollbackTransaction();
        res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
}

const checkout = async (req, res) => {
    const bookingId = req.params.id;

    try {
        await bookingModel.checkout(bookingId)

        res.status(200).json({ message: 'Checkout thành công.' });
    } catch (err) {
        console.error(err);
        await db.rollbackTransaction();
        res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
}

module.exports = {
    renderUserList,
    renderUserEdit,
    editUser,
    renderUserView,
    confirmPayment,
    checkout
}