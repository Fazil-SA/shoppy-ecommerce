const path = require('path') 
const multer = require('multer')

let storage = multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null,'public/image')
    },
    filename: function(req,file,cb) {
        console.log(file.fieldname)
        let ext = path.extname(file.originalname)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    }
})

store = multer({
    storage : storage
})

module.exports = store
