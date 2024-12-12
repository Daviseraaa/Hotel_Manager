const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');
const { urlencoded } = require('express');

// Hiển thị trang đăng nhập
const renderLoginPage = (req, res) => {
    res.render('login', { error: null });
};

// Xử lý đăng nhập
const handleLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await userModel.findByUsername(username);
        if (!user) {
            return res.render('login', { error: 'Username không tồn tại!' });
        }

        const isMatch = await bcrypt.compare(password, user.hash);
        if (!isMatch) {
            return res.render('login', { error: 'Mật khẩu không đúng!' });
        }

        // Lưu vào session
        req.session.user = { id: user.id, username: user.username, role: user.role}; 
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi.');
    }
};

module.exports = {
    renderLoginPage,
    handleLogin,
};
