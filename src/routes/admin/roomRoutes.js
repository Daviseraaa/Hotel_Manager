const express = require('express')
const roomController = require('../../app/controllers/admin/roomController')

const router = express.Router()

router.get('/', roomController.showRooms)
router.get('/create', roomController.renderCreateRoom)
router.post('/create', roomController.handelCreateRoom)
router.get('/edit/:number', roomController.renderEditPage)
router.post('/edit/:number', roomController.handelEditPage)

router.delete('/delete/:number', roomController.handelDelete)

module.exports = router