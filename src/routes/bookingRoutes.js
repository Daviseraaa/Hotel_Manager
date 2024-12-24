const express = require('express')
const bookingController = require('../app/controllers/bookingController')
const auth = require('../middlewares/authMiddleware')

const router = express.Router()

// Router
router.get('/:number', bookingController.renderBooking)
router.post('/:number', bookingController.handleBooking)
router.get('/details/:id', bookingController.renderBookingDetails)
router.get('/manager', auth.admin, bookingController.renderManager)

module.exports = router