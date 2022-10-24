const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const sessions = require('express-session')
const db = require('./server/database/connection')
const Cart = require('./server/model/cart');

const loginRouter = require('./server/routes/user/loginRouter')
const signupRouter = require('./server/routes/user/signupRouter')
const otpRouter = require('./server/routes/user/otpRouter')
const homeRouter = require('./server/routes/user/homeRouter')

const adminloginRouter = require('./server/routes/admin/adminloginRouter')
const adminpanelRouter = require('./server/routes/admin/adminpanelRouter')
const logoutRouter = require('./server/routes/admin/logoutRouter')

//app init & middleware
const app = express()

app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(sessions({
    secret: "miniproject",
    saveUninitialized: true,
    cookie: {maxAge: 600000},
    resave: false
  }))
  app.use(function(req, res, next){
    res.set('cache-control', 'no-cache , no-store, must-revalidate, max-stale=0, post-check=0, pre-checked=0' );
    next();
})

dotenv.config({path:"config.env"})
const PORT = process.env.PORT || 8080

//setting view engine
app.set('view engine','ejs')

//db Connection
cb = (err)=>{
    if(!err){
        app.listen(PORT,()=>{
            console.log(`Server listening ${PORT}`)
        })
    }
}
db.connectToDb(cb)

app.use(loginRouter)
app.use(signupRouter)
app.use(otpRouter)
app.use(homeRouter)

app.use(adminloginRouter)
app.use(adminpanelRouter)
app.use(logoutRouter)

app.use(function(req,res){
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((cartResult) => {
            if (cartResult) {
                let cartNum2 = cartResult
                res.status(404).render('user/404.ejs' , { cartNum2 });
            }
        })
  });