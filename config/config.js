const dotenv = require('dotenv')
dotenv.config({path:"config.env"})

module.exports={

    ServiceID: process.env.ServiceID,
    accountSID: process.env.accountSID,
    authTocken:process.env.authTocken

}