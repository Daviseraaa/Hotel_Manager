const express = require('express')
const roomRoutes = require('./roomRoutes')
const serviceRoutes = require('./serviceRoutes')
const adminController = require('./../../app/controllers/admin/adminController')

const auth = require('../../middlewares/authMiddleware')

const router = express.Router()

// Auth middleware
router.use(auth.loginRequired)
router.use(auth.admin)

// Room and service
router.use('/room', roomRoutes)
router.use('/service', serviceRoutes)
router.get('/user', adminController.renderUserList)
router.get('/user/edit/:id', adminController.renderUserEdit)
router.post('/user/edit/:id', adminController.editUser)
router.get('/user/view/:id', adminController.renderUserView)


module.exports = router