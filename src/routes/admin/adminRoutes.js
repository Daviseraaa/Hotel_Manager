const express = require('express')
const roomRoutes = require('./roomRoutes')

const auth = require('../../middlewares/authMiddleware')

const router = express.Router()

// Auth middleware
router.use(auth.loginRequired)
router.use(auth.admin)

router.use('/room', roomRoutes)

module.exports = router