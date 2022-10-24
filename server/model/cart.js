const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
    pname : {
        type : String,
        required : true
    } ,
    price : {
        type : String,
        required : true
    },
    offerPrice : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    // subCategory : {
    //     type : String,
    //     required : true
    // },
    image1 : {
        type : String,
        // required : true
    },
    cart : {
        type : Boolean
    },
    author : {
        type : String,
    },
    quantity : {
        type : Number,
    },
    productId : {
        type : String,
    },
    orderStatus : {
        type : String,
    },
    totalPrice : {
        type : Number,
    }
} , {timestamps : true} )

//model to access schema
const Cart = mongoose.model('Cart',cartSchema)
module.exports = Cart;

