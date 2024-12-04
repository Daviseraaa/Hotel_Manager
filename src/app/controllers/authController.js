const bcrypt = require('bcrypt');
const userModel = require('../models/userModel.js');

// Hiển thị trang đăng nhập
const renderLoginPage = (req, res) => {
    res.render('login', { error: null });
};

// Xử lý đăng nhập
const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.render('login', { error: 'Email không tồn tại!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Mật khẩu không đúng!' });
        }

        req.session.user = { id: user.id, email: user.email }; // Lưu vào session
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
