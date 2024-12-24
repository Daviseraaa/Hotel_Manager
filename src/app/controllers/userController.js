const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');
const creditModel = require('../models/creditModel.js');
const roomModel = require('../models/roomModel.js')
const bookingModel = require('../models/bookingModel.js')
const serviceModel = require('../models/serviceModel.js')

const db = require('../../config/db.js')

// Hiển thị trang đăng ký
const renderRegisterPage = (req, res) => {
    res.render('auth/register', { error: null });
};

// Xử lý đăng ký
const handleRegister = async (req, res) => {
    const { username, password, confirmPassword, first_name, last_name, phone, email, address,credit_name, credit_number } = req.body;

    if (password !== confirmPassword) {
        return res.render('auth/register', { error: 'Mật khẩu không khớp!' });
    }

    try {
        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
            return res.render('auth/register', { error: 'Username đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        await db.beginTransaction();

        const user_id = await userModel.createUser(username, hashedPassword);

        await userModel.addUserinfor(user_id, {first_name, last_name, email, phone, address});

        // Adding credit
        if (credit_name)
        {
            for (let i = 0; i < credit_name.length; i++) {
                await creditModel.createCreditUser(credit_name[i], credit_number[i], user_id);
            }
        }

        // Commit transaction
        await db.commitTransaction()
    
        res.redirect('/login');
    } catch (error) {
        // Rollback if transaction failed
        await db.rollbackTransaction()
        
        // Error handler
        console.error("Đã xảy ra lỗi khi đăng ký: ", error.message);
        res.status(500).send(`Đã xảy ra lỗi trong quá trình đăng ký!<br>${error.message}`);
    }
};

// Hiển thị dashboard
const renderDashboard = async (req, res) => {

    const user = req.session.user;
    const filter = req.query.filter || 'all';

    try {
        const rooms = await roomModel.getRoomWithStatus(filter)
        const income = await bookingModel.getIncome()
        res.render('dashboard', {
            session: req.session,
            user: user,
            filter: filter,
            rooms: rooms,
            income: income
        });

    } catch (error) {
        console.error('Error fetching rooms:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

// Xử lý logout
const handleLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Không thể đăng xuất.');
        }
        res.redirect('/login');
    });
};

// Hiển thị profile
const renderProfile = async (req, res) => {
    try {
        if (!req.session || !req.session.user || !req.session.user.id) {
            return res.status(401).send("Bạn cần đăng nhập để truy cập trang này.");
        }
        const userID = req.session.user.id;
    
        const user = await userModel.getUserInfor(userID);
        if (!user) {
            return res.status(404).send("Không tìm thấy thông tin người dùng.");
        }
    
        const bookings = await userModel.getBookings(userID); 
        const services = await userModel.getServices(userID);
        const userCredits = await creditModel.getCreditsByUserId(userID);
        const curBookings = await bookingModel.findByUserId(userID)
        res.render('users/profile', {
            session: req.session,
            user: user,
            credits: userCredits,
            bookings: bookings,
            curBookings: curBookings,
            services: services
        });
    } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
        res.status(500).send("Đã xảy ra lỗi khi tải trang profile.<br>" + error.message);
    }    
};

const renderService = async (req, res) => {
    var selectedRoomNumber  = req.query.room_number
    const userId = req.session.user.id
    try {
        const bookings = await bookingModel.findByUserId(userId);
        const rooms = bookings.map(booking => booking.room_number);
        const services = await serviceModel.getServiceList()
        
        if (!selectedRoomNumber) {
            selectedRoomNumber = rooms[0]
        }
        if (selectedRoomNumber) {
            var currentServices = await serviceModel.getServicesByRoom(selectedRoomNumber)
        }
        
        res.render('admin/service/add', {
            session: req.session,
            rooms: rooms,
            services: services,
            currentServices: currentServices
        })
    } catch (error) {
        console.log("Lỗi khi tải dịch vụ: ", error);
        res.status(500).send("Đã xảy ra lỗi khi tải dịch vụvụ" + error.message);
    }

}
 
const addServiceToRoom = async (req, res) => {
    const { room_number, service_id, quantity } = req.body;
    const userId = req.session.user.id;

    try {
        const connection = await db.getConnection();
        
        const [booking] = await bookingModel.findByUserId(userId)

        if (booking.length === 0) {
            return res.status(400).json({ message: 'Không tìm thấy phòng đã đặt hoặc phòng chưa thanh toán.' });
        }
        

        const bookingId = Array.isArray(booking) ? booking[0].id : booking.id;

        const service = await serviceModel.getServiceById(service_id)

        if (!service) {
            return res.status(400).json({ message: 'Dịch vụ không tồn tại.' });
        }

        const serviceName = service.name;
        const servicePrice = service.price;

        const [result] = await connection.execute(
            `INSERT INTO serving (booking_id, service_id, service_name, number, serve_at, income)
             VALUES (?, ?, ?, ?, NOW(), ?)`,
            [bookingId, service_id, serviceName, quantity, servicePrice]
        );

        await connection.execute(
            `UPDATE service SET inventory = inventory - ? WHERE id = ?`,
            [quantity, service_id]
        );

        const totalIncome = servicePrice * quantity;
        await connection.execute(
            `INSERT INTO income_log (income_type, amount, description)
             VALUES ('service_income', ?, 'Thu nhập từ dịch vụ phòng ${room_number}')`,
            [totalIncome]
        );

        await db.commitTransaction()
        res.status(200).json({ message: 'Dịch vụ đã được thêm thành công.' });
    } catch (error) {
        await db.rollbackTransaction()
        console.log(error);
        res.status(500).json({ message: 'Lỗi khi thêm dịch vụ cho phòng.' });
    }
};


module.exports = {
    renderRegisterPage,
    handleRegister,
    renderDashboard,
    handleLogout,
    renderProfile,
    renderService,
    addServiceToRoom
};
