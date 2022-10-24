const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
    username : {
        type : String,
        required : true
    } ,
    password : {
        type :String,
        required : true
    }
} , {timestamps : true} )

//model to access schema
const Admin = mongoose.model('Admin',adminSchema)
module.exports = Admin;