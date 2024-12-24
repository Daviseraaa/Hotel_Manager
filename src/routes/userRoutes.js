const express = require('express')

const userController = require('../app/controllers/userController');
const auth = require('../middlewares/authMiddleware')

const router = express.Router()

// Using auth
router.use(auth.loginRequired)
router.use(auth.user)

// Render profile
router.get('/profile', userController.renderProfile);
router.get('/service', userController.renderService);
router.post('/service/add', userController.addServiceToRoom);


module.exports = router