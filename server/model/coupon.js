const mongoose = require('mongoose')
const Schema = mongoose.Schema

const couponSchema = new Schema({
    couponName : {
        type : String,
        required : true
    },
    minimumValue : {
        type : Number,
    },
    discountValue : {
        type : Number,
    },
    activationDate : {
        type : String,
        required : true
    },
    expirationDate : {
        type : String,
        required : true
    },
    couponUsedCustomers : [{
        type : String,
    }],

} , {timestamps : true} )

//model to access schema
const Coupon = mongoose.model('Coupon',couponSchema)
module.exports = Coupon;