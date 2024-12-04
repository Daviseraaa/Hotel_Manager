const express = require('express');
const authController = require('../app/controllers/authController');
const userController = require('../app/controllers/userController');

const router = express.Router();

// Routes liên quan đến login
router.get('/login', authController.renderLoginPage);
router.post('/login', authController.handleLogin);

// Routes liên quan đến register
router.get('/register', userController.renderRegisterPage);
router.post('/register', userController.handleRegister);

// Route dashboard
router.get('/dashboard', userController.renderDashboard);

// Route logout
router.get('/logout', userController.handleLogout);

module.exports = router;
