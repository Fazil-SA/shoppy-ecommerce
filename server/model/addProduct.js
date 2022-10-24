const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    pname : {
        type : String,
        required : true,
    } ,
    price : {
        type : Number,
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
        type : String,
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
    image2 : {
        type : String,
        // required : true
    },
    cart : {
        type : Boolean
    },
    wishlist : {
        type : Boolean
    }
} , {timestamps : true} )

//model to access schema
const Product = mongoose.model('Product',productSchema)
module.exports = Product;