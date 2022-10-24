const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
    category : [{
        type : String,
        default : "category",
}],
} , {timestamps : true} )

//model to access schema
const Category = mongoose.model('Category',categorySchema)
module.exports = Category;