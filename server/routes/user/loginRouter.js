const express = require('express')
const router = express.Router()


const services = require('../../controller/render')


router.get('/user_signin',services.isLoggedOut,services.loginRouter)

router.post('/user_signin',services.login)

module.exports = router