const express = require('express')
const router = express.Router()


const services = require('../../controller/render')


router.get('/admin_login',services.adminLoggedOut,services.adminLoginRouter)

router.post('/admin_login',services.adminLogin)

module.exports = router