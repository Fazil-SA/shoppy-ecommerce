const express = require('express')
const router = express.Router()


const services = require('../../controller/render')


router.get('/mobile_verification',services.isLoggedOut,services.mobileVerification)
router.post('/user/send-otp',services.sendOtp)

router.get('/verifyOtp',services.isMobileFound,services.otpPage)
router.post('/verifyOtp',services.verifyOtp)


module.exports = router