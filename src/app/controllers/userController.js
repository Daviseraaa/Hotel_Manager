const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');
const creditModel = require('../models/creditModel.js');
const roomModel = require('../models/roomModel.js')
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

        await userModel.addUserinfor(user_id, first_name, last_name, email, phone, address);

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
    if (!req.session.user) {
        return res.redirect('/login');
    }
    try {
        const rooms = await roomModel.getRoomWithStatus(filter)

        res.render('dashboard', {
            session: req.session,
            user: user,
            filter: filter,
            rooms: rooms,
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
    
        res.render('users/profile', {
            session: req.session,
            user: user,
            credits: userCredits,
            bookings: bookings,
            services: services
        });
    } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
        res.status(500).send("Đã xảy ra lỗi khi tải trang profile.<br>" + error.message);
    }    
};

module.exports = {
    renderRegisterPage,
    handleRegister,
    renderDashboard,
    handleLogout,
    renderProfile
};
