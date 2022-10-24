const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wishlistSchema = new Schema({
    userId : {
        type : String,
        required : true
    },
    item : [{
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
        image1 : {
            type : String,
            // required : true
        },
        author : {
            type : String,
        },
    }],
    wishlist : {
        type : Boolean,
    }
} , {timestamps : true} )

//model to access schema
const Wishlist = mongoose.model('Wishlist',wishlistSchema)
module.exports = Wishlist;