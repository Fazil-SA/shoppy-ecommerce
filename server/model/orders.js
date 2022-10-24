const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    userId : {
        type : String,
        required : true
    },
    orderDetails : [{

    }],
    method : {
        type : String,
            },
    address : {
        type : Object,
    },
    status : {
        type : String,
    },
    date : {
        type : String,
    },
    orderValue : {
        type : Number,
    }
},{timestamps:true})

//model to access schema
const Order = mongoose.model('Order',orderSchema)
module.exports = Order;