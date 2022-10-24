const express = require('express')
const router = express.Router()


const services = require('../../controller/render')


router.get('/admin_logout',services.adminLogout)

router.get('/user_logout',services.userLogout)

// router.post('/admin_panel',services.adminLogin)

module.exports = router