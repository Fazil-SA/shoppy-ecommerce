const express = require('express')
const router = express.Router()
const services = require('../../controller/render')

router.get('/user_registration',services.isLoggedOut,services.signupRouter)

router.post('/user_registration',services.signup)

module.exports = router