const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');
const creditModel = require('../models/creditModel.js');
const db = require('../../config/db.js')

// Hiển thị trang đăng ký
const renderRegisterPage = (req, res) => {
    res.render('register', { error: null });
};

// Xử lý đăng ký
const handleRegister = async (req, res) => {
    const { username, password, confirmPassword, first_name, last_name, phone, email, address,credit_name, credit_number } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Mật khẩu không khớp!' });
    }

    try {
        const existingUser = await userModel.findByUsername(username);
        if (existingUser) {
            return res.render('register', { error: 'Username đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Begin transaction
        await db.beginTransaction();

        const user_id = await userModel.createUser(username, hashedPassword);

        await userModel.addUserinfor(user_id, first_name, last_name, email, phone, address);

        // Adding credit
        for (let i = 0; i < credit_name.length; i++) {
            await creditModel.createCreditUser(credit_name[i], credit_number[i], user_id);
        }

        // Commit transaction
        await db.commitTransaction()
    
        res.redirect('/login');
    } catch (error) {
        // Rollback if transaction failed
        await db.rollbackTransaction()
        
        // Error handler
        console.error("Đã xảy ra lỗi khi đăng ký: ", error.message);
        res.status(500).send(`Đã xảy ra lỗi trong quá trình đăng ký: ${error.message}`);
    }
};

// Hiển thị dashboard
const renderDashboard = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
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
        const userID = req.session.user.id; 
        const userInfo = await userModel.findByUserID(userID);
        const userCredits = await creditModel.getCreditsByUserId(userID);

        // Render trang profile với dữ liệu từ DB
        res.render('users/profile', {
            user: userInfo,
            credits: userCredits,
        });
    } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng: ", error);
        res.status(500).send("Đã xảy ra lỗi khi tải trang profile.");
    }     
};

module.exports = {
    renderRegisterPage,
    handleRegister,
    renderDashboard,
    handleLogout,
    renderProfile
};
