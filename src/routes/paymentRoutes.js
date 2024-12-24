const express = require('express')
const paymentController = require('../app/controllers/paymentController')

const router = express.Router()

router.get('/', paymentController.renderPayment)

module.exports = router