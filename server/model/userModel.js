const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,  
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    blockStatus: {
        type: Boolean
    },
    address : [{
        name : { type : String } ,
        mobile : { type : Number },
        address1 : { type : String },
        address2 : { type : String },
        city : { type : String },
        state : { type : String },
        zip : { type : Number },
    }],
    profileImage : {
        type : String,
        default : 'nil'
    }
},{timestamps:true})

//model to access schema
const User = mongoose.model('User',userSchema)
module.exports = User;