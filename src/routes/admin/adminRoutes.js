const express = require('express')
const roomRoutes = require('./roomRoutes')

const auth = require('../../middlewares/authMiddleware')

const route = express.Router()

//route.use(auth.admin)

route.use('/room', roomRoutes)

module.exports = route