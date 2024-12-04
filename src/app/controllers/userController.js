const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');

// Hiển thị trang đăng ký
const renderRegisterPage = (req, res) => {
    res.render('register', { error: null });
};

// Xử lý đăng ký
const handleRegister = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Mật khẩu không khớp!' });
    }

    try {
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.render('register', { error: 'Email đã được sử dụng!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(email, hashedPassword);

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi trong quá trình đăng ký.');
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

module.exports = {
    renderRegisterPage,
    handleRegister,
    renderDashboard,
    handleLogout,
};
