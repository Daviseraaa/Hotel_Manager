const express = require('express')
const serviceController = require('../../app/controllers/admin/serviceController')

const router = express.Router()

router.get('/', serviceController.renderServicePage)
router.get('/:id', serviceController.getServiceByID)
router.post('/create', serviceController.handleCreateService)
router.post('/edit/:id', serviceController.handleEditService)

router.post('/delete/:id', serviceController.handleDeleteService)

module.exports = router