const User = require('../model/userModel')
const Admin = require('../model/adminModel');
const Product = require('../model/addProduct')
const { ObjectId } = require('bson')
const dotenv = require('dotenv').config()
const Cart = require('../model/cart');
const Wishlist = require('../model/wishlist');
const Order = require('../model/orders');
const Category = require('../model/category');
const Coupon = require('../model/coupon');
const otp = require('../middleware/otp')
const Razorpay = require('razorpay');
const Paypal = require('paypal-rest-sdk')
const { response } = require('express');
const ExcelJS = require('exceljs');

//session handling

let session
let validation = {
    status: false,
    redeem: false,
    activated: false,
    expired: false,
    criteria: false,
    found: false
}


exports.isLoggedIn = (req, res, next) => {
    session = req.session
    if (session.userId) {
        next()
    } else {
        res.redirect('/user_signin')
    }
}
exports.isLoggedOut = (req, res, next) => {
    session = req.session
    if (!session.userId) {
        next()
    } else {
        res.redirect('/user_home')
    }
}

exports.adminLoggedIn = (req, res, next) => {
    session = req.session
    if (session.adminId) {
        next()
    } else {
        res.redirect('/admin_login')
    }
}
exports.adminLoggedOut = (req, res, next) => {
    session = req.session
    if (!session.adminId) {
        next()
    } else {
        res.redirect('/admin_panel')
    }
}

exports.isMobileFound = (req, res, next) => {
    session = req.session
    if (session.phone) {
        next()
    } else {
        res.redirect('/mobile_verification')
    }
}

//////////////////



exports.loginRouter = (req, res) => {
    let response = {
        passErr: req.query.pass,
        loginErrMssg: "You Entered a Wrong Password !!",
        registerErr: req.query.register,
        registerErrMssg: "User is not Registered !!",
        blockErr: req.query.block,
        blockErrMssg: "User is blocked by Admin"
    }
    res.render('user/login', { response }) //render default folder is views
}
exports.signupRouter = (req, res) => {
    let response = {
        passMatch: req.query.passwordmatch,
        passMatchErrMssg: "Password is not Matching !!",
        userExist: req.query.userexist,
        userExistMssg: "User already exists !!"
    }
    res.render('user/signup', { response })
}
exports.signup = (req, res) => {
    if (req.body.password == req.body.confirmPassword) {
        User.findOne({ email: req.body.email })
            .then((result) => {
                if (result) {
                    res.redirect('/user_registration?userexist=false')
                } else {
                    const userData = new User(req.body)
                    userData.blockStatus = false
                    userData.save()
                        .then(() => {
                            res.redirect('/user_signin')
                        })
                        .catch((err) => {
                            console.log(err)
                            res.redirect('/user_registration')
                        })

                }
            })
    } else {
        res.redirect('/user_registration?passwordmatch=false')
    }
}

exports.login = (req, res) => {
    loginData = req.body
    User.findOne({ email: loginData.email, password: loginData.password, blockStatus: false })
        .then((result) => {
            if (result) {
                sessions = req.session
                sessions.userId = loginData.email
                res.redirect('/user_home')
            } else {
                User.findOne({ email: loginData.email })
                    .then((result) => {
                        if (result) {
                            if (result.blockStatus) {
                                res.redirect('/user_signin?block=true')
                            } else {
                                res.redirect('/user_signin?pass=false')
                            }
                        } else {
                            res.redirect('/user_signin?register=false')
                        }
                    })
                    .catch((err) => console.log(err))
            }
        })
        .catch((err) => console.log(err))
}
exports.guestHome = (req, res) => {
    req.session.orderValue = ''
    Product.find({})
        .then((result) => {
            if (result) {
                let user = req.session.userId
                Cart.find({ author: user, cart: true })
                    .then((cartResult) => {
                        if (cartResult) {
                            let cartNum2 = cartResult
                            res.render('user/guesthome', { result, cartNum2 })

                        }
                    })
            }
        })
}
exports.userHome = (req, res) => {
    req.session.orderValue = ''
    Product.find({})
        .then((result) => {
            if (result) {
                let user = req.session.userId
                Cart.find({ author: user, cart: true })
                    .then((cartResult) => {
                        if (cartResult) {
                            let cartNum2 = cartResult
                            res.render('user/home', { result, cartNum2 })

                        }
                    })
            }
        })
}
exports.userLogout = (req, res) => {
    // req.session.destroy()
    req.session.userId = ""
    req.session.orderValue = ""
    req.session.phone = ""
    req.session.otplogin = ''
    res.redirect('/user_signin')
}

//product-view
exports.productsView = (req, res) => {
    let prodId = req.query.id
    Product.findOne({ _id: prodId })
        .then((product) => {
            if (product) {
                let user = req.session.userId
                Cart.find({ author: user, cart: true })
                    .then((result) => {
                        if (result) {
                            let cartNum2 = result
                            res.render('user/productView', { product, cartNum2 })
                        }
                    })

            }

        })
}

exports.cart1 = (req, res) => {
    let userId = req.session.userId
    let productId = req.query.id
    let qty = 1
    Cart.findOne({ author: userId })
        .then((user) => {
            if (user) {
                Cart.findOne({ author: userId, productId: productId })
                    .then((sameProd) => {
                        if (sameProd) {
                            Cart.updateOne({ author: userId }, { $inc: { quantity: qty } }).then(() => {

                                res.redirect('/user_home')
                            })
                        } else {
                            Product.findOne({ _id: productId })
                                .then((cartResult) => {
                                    if (cartResult) {
                                        let cartData = new Cart({
                                            pname: cartResult.pname,
                                            price: cartResult.price,
                                            offerPrice: cartResult.offerPrice,
                                            description: cartResult.description,
                                            stock: cartResult.stock,
                                            category: cartResult.category,
                                            image1: cartResult.image1,
                                            cart: true,
                                            author: userId,
                                            quantity: 1,
                                            productId: productId,
                                            orderStatus: "none",
                                        })
                                        cartData.save()
                                            .then(() => {
                                                if (req.query.id && req.query.productView) {
                                                    id = req.query.id
                                                    res.redirect(`/user_home/product-view?id=${id}`)
                                                } else
                                                    res.redirect('/user_home')
                                            })
                                    }
                                })
                        }
                    })
            } else {
                Product.findOne({ _id: productId })
                    .then((cartResult) => {
                        if (cartResult) {
                            let cartData = new Cart({
                                pname: cartResult.pname,
                                price: cartResult.price,
                                offerPrice: cartResult.offerPrice,
                                description: cartResult.description,
                                stock: cartResult.stock,
                                category: cartResult.category,
                                image1: cartResult.image1,
                                cart: true,
                                author: userId,
                                quantity: 1,
                                productId: productId,
                                orderStatus: "none"
                            })
                            cartData.save()
                                .then(() => {
                                    if (req.query.id && req.query.productView) {
                                        id = req.query.id
                                        res.redirect(`/user_home/product-view?id=${id}`)
                                    } else
                                        res.redirect('/user_home')
                                })
                        }
                    })
            }

        })
}

exports.changeQty = (req, res) => {
    prodId = req.body.prodId
    count = req.body.count
    let userId = req.session.userId
    let product
    Cart.updateOne({ author: userId, productId: prodId }, { $inc: { quantity: count } })
        .then((response) => {
            Cart.findOne({ author: userId, productId: prodId })
                .then((product) => {
                    stock = product.stock
                    qty = product.quantity
                    if (qty > stock) {
                        Cart.updateOne({ author: userId, productId: prodId }, { $set: { quantity: stock } })
                            .then(() => {
                                validation.status = true
                                response.change = true
                                res.send(response)
                            })
                            .catch((e) => {
                                console.log(e)
                            })
                    }
                    if (product.quantity == 0) {
                        Cart.deleteOne({ author: userId, productId: prodId })
                            .then(() => { })
                    }
                }).catch((e) => {
                    console.log(e)
                })
            response.change = true
            res.send(response)
        })
}

exports.deleteCartProduct = (req, res) => {
    prId = req.query.id
    Cart.deleteOne({ _id: prId })
        .then(() => {
            res.redirect('/user_home/shopping-cart')
        })
}
exports.deleteWishlistProduct = (req, res) => {
    prId = req.query.id
    Wishlist.deleteOne({ "item._id": prId })
        .then(() => {
            res.redirect('/user_home/wishlist')
        })
}

exports.cartPage = (req, res) => {
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((result) => {
            if (result) {
                var cartNum2 = result
                let totalPrice = 0;
                for (let i = 0; i < result.length; i++) {
                    total = result[i].quantity * result[i].offerPrice
                    totalPrice += total
                }
                res.render('user/cart', { result, cartNum2, totalPrice, validation })
                validation.status = false
            }
        })
}
exports.wishlistPage = (req, res) => {
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((result) => {
            if (result) {
                let cartNum2 = result
                Wishlist.find({ userId: user })
                    .then((wishlist) => {
                        if (wishlist) {
                            res.render('user/wishlist', { cartNum2, wishlist })
                        }
                    })
            }
        })
}
exports.wishlist = (req, res) => {
    let prId = req.query.id
    let user = req.session.userId
    Wishlist.findOne({ "item._id": prId, userId: user })
        .then((wishlist) => {
            if (wishlist) {
                Wishlist.deleteOne({ "item._id": prId, userId: user })
                    .then(() => {
                        Product.updateOne({ _id: prId }, { $set: { wishlist: false } })
                            .then(() => {
                                res.redirect('/user_home')
                            })
                    })
            } else {
                Product.findOne({ _id: prId })
                    .then((product) => {
                        if (product) {
                            let wishlistData = new Wishlist({
                                userId: user,
                                item: product,
                            })
                            wishlistData.save()
                                .then(() => {
                                    let updatedProduct = {
                                        pname: product.pname,
                                        price: product.price,
                                        offerPrice: product.offerPrice,
                                        description: product.description,
                                        stock: product.stock,
                                        category: product.category,
                                        image1: product.image1,
                                        image2: product.image2,
                                        cart: product.cart,
                                    }
                                    Product.replaceOne({ _id: prId }, updatedProduct)
                                        .then(() => {
                                            res.redirect('/user_home')
                                        })

                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        }
                    })
            }
        })
}


exports.profile = (req, res) => {
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((cartResult) => {
            if (cartResult) {
                let cartNum2 = cartResult
                User.findOne({ email: user })
                    .then((profile) => {
                        res.render('user/myAccount', { cartNum2, profile })
                        console.log(profile)
                    })
            }
        })
}
exports.profileEditPage = (req, res) => {
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((result) => {
            if (result) {
                let cartNum2 = result
                User.findOne({ email: user })
                    .then((usr) => {
                        res.render('user/editMyAccount', { cartNum2, usr })
                    })
            }
        })
}
exports.profileEdit = (req, res) => {
    let profileId = req.query.id
    const files = req.files
    User.updateOne({ _id: ObjectId(profileId) }, {
        $set: {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            profileImage: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
        }
    })
        .then((result) => {
            res.redirect('/user_home/profile')
        })
}
exports.userOrders = (req, res) => {
    prodId = req.query.id
    user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((result) => {
            if (result) {
                let cartNum2 = result
                Order.find({ userId: user })
                    .then((newOrder) => {
                        res.render('user/userOrders', { cartNum2, newOrder })
                    })
            }
        })

}

exports.viewOrderedProducts = (req, res) => {
    orderId = req.query.id
    user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((result) => {
            if (result) {
                let cartNum2 = result
                Order.findOne({ _id: orderId })
                    .then((viewOrder) => {
                        res.render('user/viewOrderedProduct', { viewOrder, cartNum2 })
                    })
            }
        })

}
exports.cancelOrderUserSide = (req, res) => {
    orderId = req.query.id
    prodId = req.query.prodId
    Order.updateOne({ _id: ObjectId(orderId), "orderDetails.productId": prodId }, { $set: { "orderDetails.$.orderStatus": "User Cancelled" } })
        .then(() => {
            res.redirect(`/user_home/your-orders/view-order-product?id=${orderId}`)
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.applyCoupon = (req, res) => {
    let userId = req.session.userId
    let couponId = req.body.couponId
    totalPrice = req.body.totalPrice
    currentDate = new Date().toLocaleString('en-US', { hour12: false })
    Coupon.findOne({ couponName: couponId })
        .then((coupon) => {
            if (coupon.minimumValue <= +totalPrice) {
                if (currentDate > coupon.activationDate && currentDate < coupon.expirationDate) {
                    let isAppliedUser = coupon.couponUsedCustomers.some((user) => {
                        return userId.includes(user)
                    })
                    if (isAppliedUser) {
                        validation.redeem = true;
                        response.validation = true
                        res.send(response)
                        // console.log('already redeemed')
                    }
                    else {
                        // Coupon.updateOne({couponName : couponId},{$push:{couponUsedCustomers : userId}})
                        // .then(() => {

                        // console.log('coupon activated codes to discount here');

                        let couponDiscountedBill = totalPrice - coupon.discountValue

                        req.session.orderValue = couponDiscountedBill
                        req.session.couponName = couponId || ''

                        res.json({ change: true, couponDiscountedBill })
                        // })
                    }
                } else {
                    validation.expired = true;
                    response.validation = true
                    res.send(response)
                    // console.log('coupon expired');
                }
            } else {
                validation.criteria = true;
                response.validation = true
                res.send(response)
                // console.log('not meeteed the minimum value criteria')
            }
        })
        .catch(() => {
            validation.found = true;
            response.validation = true
            res.send(response)
            // console.log('coupon not found');
        })
}
exports.categorySelectionHome = (req,res) => {
    categ = req.query.category
    user = req.session.userId
    // console.log(categ)
    Cart.find({ author: user, cart: true })
        .then((cartResult) => {
            if (cartResult) {
                let cartNum2 = cartResult
                Product.find({category : categ})
                    .then((result) => {
                        res.render('user/home', { cartNum2 , result})
                    })
            }
        })
}
exports.mobileVerification = (req, res) => {
    if (req.session.otplogin) {
        res.redirect('user_home')
    } else {
        res.render('user/otp')
    }

}

exports.sendOtp = (req, res) => {
    User.findOne({ phone: req.body.phone })
        .then((user) => {
            if (user) {
                req.session.phone = req.body.phone,
                    otp.sendOtp(req.body.phone)
                res.redirect('/verifyOtp')
            } else {
                res.send('not found')
            }
        })
}

exports.otpPage = (req, res) => {
    if (req.session.otplogin) {
        res.redirect('/user_home')
    } else {
        res.render('user/verifyOtp')
    }
}
exports.verifyOtp = (req, res) => {
    let otpObject = req.body
    otp.veriOtp(otpObject.otp, req.session.phone)
        .then((verify) => {
            if (verify) {
                User.findOne({ phone: req.session.phone })
                    .then((user) => {
                        req.session.userId = user.email
                        req.session.otplogin = true
                        res.redirect('/user_home')
                    })
            } else {
                res.redirect('/verifyOtp?otp=false')
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

exports.checkoutPage = (req, res) => {
    let user = req.session.userId
    User.findOne({ email: user })
        .then((result) => {
            let userAddress = result
            Cart.find({ author: user, cart: true })
                .then((cartResult) => {
                    if (cartResult) {
                        let cartNum2 = cartResult
                        let totalPrice = 0;
                        for (let i = 0; i < cartNum2.length; i++) {
                            total = cartNum2[i].quantity * cartNum2[i].offerPrice
                            totalPrice += total
                        }

                        res.render('user/checkout', { validation, cartNum2, userAddress, totalPrice });
                        validation.redeem = false,
                        validation.expired = false
                        validation.criteria = false
                        validation.found = false
                    }
                })
        })

}

exports.addNewAddressPage = (req, res) => {
    let user = req.session.userId
    Cart.find({ author: user, cart: true })
        .then((cartResult) => {
            if (cartResult) {
                let cartNum2 = cartResult
                res.render('user/addNewAddress', { cartNum2 })

            }
        })
}
exports.addNewAddress = (req, res) => {
    let userEmail = req.session.userId
    User.updateOne({ email: userEmail }, {
        $push: {
            address: {
                name: req.body.name,
                mobile: req.body.mobile,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                zip: req.body.zip,
            }
        }
    })
        .then((result) => {
            res.redirect('/user_home/shopping-cart/checkout/')
        })
    //updateone also can done as below by saving data in local and replacing it
    // User.findOne( {email : userEmail} )
    //     .then((user) => {
    //         user.address.push({
    //             name : req.body.name ,
    //             mobile : req.body.mobile ,
    //             address1 : req.body.address1 ,
    //             address2 : req.body.address2 ,
    //             city : req.body.city,
    //             state : req.body.state,
    //             zip : req.body.zip,
    //         })
    //         User.replaceOne( {email : userEmail} , user )
    //             .then(() => {
    //                 res.send('replaced')
    //             })
    //     })

    // .catch((err)=>{
    //     console.log(err);
    // })
}

exports.payment = (req, res) => {
    function createOrder(userMail, paymentMethod, selectedAddress, product) {
        if (req.session.orderValue == '') {
            req.session.orderValue = req.body.orderValue
        }
        const newOrder = {
            userId: userMail,
            orderDetails: product,
            method: paymentMethod,
            address: selectedAddress,
            date: new Date().toLocaleString('en-US', { hour12: false }),
            orderValue: req.session.orderValue
        }
        req.session.order = newOrder;
    }

    let userMail = req.session.userId
    let paymentMethod = req.body.paymentType
    let selectedAddressIndex = req.body.selectedAddress
    User.findOne({ email: userMail })
        .then((user) => {
            // for (i = 0; i <= user.address.length; i++) {
            //     if (i == selectedAddressIndex) {
            //         var selectedAddress = user.address[i]
            //     }
            // }
            let selectedAddress
            user.address.forEach((element, index) => {
                if (selectedAddressIndex == index)
                    selectedAddress = element
            })
            Cart.find({ owner: req.session.userId })
                .then((product) => {
                    if (paymentMethod === "cod") {
                        createOrder(userMail, paymentMethod, selectedAddress, product)
                        res.json({ codSuccess: true })
                    }
                    else if (paymentMethod === "paypal") {
                        createOrder(userMail, paymentMethod, selectedAddress, product)
                        res.json({ paypal: true });
                    } else {
                        createOrder(userMail, paymentMethod, selectedAddress, product)
                        res.redirect('/payment/razorpay');
                    }
                })
        })
}
exports.orderSuccess = (req, res) => {
    user = req.session.userId
    couponId = req.session.couponName
    Cart.find({ author: user, cart: true })
        .then((cartResult) => {
            if (cartResult) {
                let cartNum2 = cartResult
                Cart.deleteMany({ email: user, cart: true })
                    .then(() => {
                        let order = req.session.order
                        order.orderDetails.forEach((element) => {
                            element.orderStatus = "New"
                        })
                        let orderUp = new Order(req.session.order)
                        orderUp.save()
                            .then(() => {
                                if (!req.session.couponName == '') {
                                    Coupon.updateOne({ couponName: couponId }, { $push: { couponUsedCustomers: user } })
                                        .then(() => {
                                            res.render('user/orderSuccess', { cartNum2 })
                                        })
                                } else {
                                    res.render('user/orderSuccess', { cartNum2 })
                                }


                            })
                    })
            }
        })
}



exports.paypal = (req, res) => {
    // let billAmount = Order.findOne({ owner : req.session.userId })
    // .then((order) => {
    //    return order.orderValue;
    // })
    // billAmount.then((bill) => {
    let orderValue = req.session.orderValue
    bill = Math.round(+orderValue * 0.01368)

    Paypal.configure({
        'mode': 'sandbox', //sandbox or live 
        'client_id': 'AQY5jG4aY7eeHYXSFiqqmfWOnCRUv8_zz6EZhv0hcSwuWAyKdbktMuDTx5uXhKy8-HtLPn7wFxrOWoeD',
        // please provide your client id here 
        'client_secret': 'EDOJ3OW2WrOxR8eL57r3lFUE9bhSTIfBT9IcSBRbsZQaCGSdchZMXX2nUDyvfCid9e5fIOU3F3oKvXst' // provide your client secret here 
    });

    // create payment object 
    let payment = {
        "intent": "authorize",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": 'http://localhost:5050/order-success',
            "cancel_url": "http://127.0.0.1:3000/err"
        },
        "transactions": [{
            "amount": {
                "total": `${+bill}`,
                "currency": "USD"
            },
            "description": " a book on mean stack "
        }]
    }

    let createPay = (payment) => {
        return new Promise((resolve, reject) => {
            Paypal.payment.create(payment, function (err, payment) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(payment);
                }
            });
        });
    }

    // call the create Pay method 
    createPay(payment)
        .then((transaction) => {
            // console.log(transaction)
            var id = transaction.id;
            var links = transaction.links;
            var counter = links.length;
            while (counter--) {
                if (links[counter].method == 'REDIRECT') {
                    // console.log(transaction);
                    // redirect to paypal where user approves the transaction 
                    return res.redirect(links[counter].href)
                }
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/err');
        });


}


exports.razorpay = (req, res) => {
    // const bill = Cart.findOne({ owner : req.session.userId })
    //                  .then((order) => {
    //                     return order.orderValue
    //      })
    // bill.then((totalBill) => {
    console.log(req.session)
    const bill = +req.session.orderValue
    const razorpay = new Razorpay({
        key_id: `${process.env.RAZORPAY_KEY_ID}`,
        key_secret: `${process.env.RAZORPAY_KEY_SECRET}`
    })

    let options = {
        amount: bill * 100,  // amount in the smallest currency unit
        currency: "INR"
    };

    razorpay.orders.create(options, function (err, order) {
        console.log(order);
        res.json({ razorpay: true, order });
    });
    // })
}

///////ADMIN ROUTES////////

exports.adminLogout = (req, res) => {
    // req.session.destroy()
    req.session.adminId = ""
    res.redirect('/admin_login')
}
exports.adminLoginRouter = (req, res) => {
    let response = {
        pass: req.query.pass,
        passErrMssg: "Wrong Password !!",
        admin: req.query.admin,
        adminMssg: "Admin not exists !!"
    }
    res.render('admin/login', { response })
}
exports.adminLogin = (req, res) => {
    const adminData = req.body
    Admin.findOne({ username: adminData.name, password: adminData.password })
        .then((result) => {
            if (result) {
                session = req.session
                session.adminId = adminData.name
                res.redirect('/admin_panel')
            } else {
                Admin.findOne({ username: adminData.name })
                    .then((result) => {
                        if (result) {
                            // res.send('password incorrect')
                            res.redirect('/admin_login?pass=false')
                        } else {
                            // res.send('Admin Not Exist')
                            res.redirect('/admin_login?admin=false')
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        })
}
exports.adminpanelRouter = (req, res) => {
    res.render('admin/adminPanel')
}


exports.products = (req, res) => {
    Product.find((err, docs) => {
        let num = 1
        if (!err) {
            res.render('admin/productManagement', { num, docs })
        }
    })
}


exports.addProductRouter = (req, res) => {
    Category.findOne({})
        .then((category) => {
            console.log(category)
            res.render('admin/add-product', { result: '', category })
        })
}

exports.editProduct = (req, res) => {
    let updateId = req.query.id
    Product.findOne({ _id: ObjectId(updateId) })
        .then((result) => {
            if (result) {
                Category.findOne({})
                    .then((category) => {
                        res.render('admin/add-product', { result, category })
                    })
            }
        })
        .catch((err) => console.log(err))
}


exports.addProduct = (req, res, next) => {
    const files = req.files
    // console.log(files)
    if (!files) {
        const error = new Error('please choose file')
        error.httpStatusCode = 400
        return next(error)
    }
    let productDetail = new Product({
        pname: req.body.pname,
        price: req.body.price,
        offerPrice: req.body.offerprice,
        description: req.body.description,
        stock: req.body.stock,
        category: req.body.category,
        image1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
        image2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
        cart: false
    })
    productDetail.save()
        .then(() => {
            res.redirect('/admin_panel/product_management/add-product')
        })
        .catch((err) => {
            console.log(err);
        })
}

exports.updateProduct = (req, res) => {
    let updateId = req.query.id
    let updatedData = {
        pname: req.body.pname,
        price: req.body.price,
        offerPrice: req.body.offerprice,
        description: req.body.description,
        stock: req.body.stock,
        category: req.body.category,
        subCategory: req.body.subCategory,
        image1: req.files[0] && req.files[0].filename ? req.files[0].filename : "",
        image2: req.files[1] && req.files[1].filename ? req.files[1].filename : "",
        cart: false
    }
    Product.replaceOne({ _id: ObjectId(updateId) }, updatedData)
        .then(() => {
            res.redirect('/admin_panel/product_management')
        })
        .catch((err) => console.log(err))
}

exports.deleteProduct = (req, res) => {
    let deleteId = req.query.id
    Product.deleteOne({ _id: ObjectId(deleteId) })
        .then(() => {
            res.redirect('/admin_panel/product_management')
        })
}

exports.orders = (req, res) => {
    prodId = req.query.id
    Order.find({})
        .then((newOrder) => {
            res.render('admin/orders', { newOrder })
        })
}

exports.viewOrderProducts = (req, res) => {
    orderId = req.query.id
    Order.findOne({ _id: orderId })
        .then((viewOrder) => {
            res.render('admin/viewOrderedProduct', { viewOrder })
        })
}
exports.orderAcceptButton = (req, res) => {
    orderId = req.query.id
    prodId = req.query.prodId
    Order.updateOne({ _id: ObjectId(orderId), "orderDetails.productId": prodId }, { $set: { "orderDetails.$.orderStatus": "Proceeding" } })
        .then(() => {
            res.redirect(`/admin_panel/order_management/view-order-product?id=${orderId}`)
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.shipOrderButton = (req, res) => {
    orderId = req.query.id
    prodId = req.query.prodId
    Order.updateOne({ _id: ObjectId(orderId), "orderDetails.productId": prodId }, { $set: { "orderDetails.$.orderStatus": "Shipped" } })
        .then(() => {
            res.redirect(`/admin_panel/order_management/view-order-product?id=${orderId}`)
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.completeOrderButton = (req, res) => {
    orderId = req.query.id
    prodId = req.query.prodId
    Order.updateOne({ _id: ObjectId(orderId), "orderDetails.productId": prodId }, { $set: { "orderDetails.$.orderStatus": "Delivered" } })
        .then(() => {
            res.redirect(`/admin_panel/order_management/view-order-product?id=${orderId}`)
        })
        .catch((err) => {
            console.log(err)
        })
}
exports.cancelProductOrder = (req, res) => {
    orderId = req.query.id
    prodId = req.query.prodId
    Order.updateOne({ _id: ObjectId(orderId), "orderDetails.productId": prodId }, { $set: { "orderDetails.$.orderStatus": "Vendor Cancelled" } })
        .then(() => {
            res.redirect(`/admin_panel/order_management/view-order-product?id=${orderId}`)
        })
        .catch((err) => {
            console.log(err)
        })
}

exports.userManagement = (req, res) => {
    let num = 1
    User.find((err, docs) => {
        if (!err) {
            res.render('admin/userManagement', { docs, num })
        }
    })
}
exports.categoryManagementPage = (req, res) => {
    Category.findOne({})
        .then((categories) => {
            res.render('admin/category', { categories })
        })
}
exports.categoryManagement = (req, res) => {
    let newCategory = req.body.category
    Category.find({})
        .then((result) => {
            if (result[0]) {
                Category.updateOne({}, { $push: { category: newCategory } })
                    .then(() => {
                        res.redirect('/admin_panel/category-management')
                    })
            } else {
                let category = new Category({
                    category: newCategory
                })
                category.save()
                    .then(() => {
                        res.redirect('/admin_panel/category-management')
                    })
            }
        })

}
exports.deleteCategory = (req, res) => {
    itemId = req.query.id
    Category.updateOne({ category: itemId }, { $pull: { category: itemId } })
        .then(() => {
            res.redirect('/admin_panel/category-management')
        })
}
exports.couponManagementPage = (req, res) => {
    Coupon.find({})
        .then((coupon) => {
            res.render('admin/coupon', { coupon })
        })
        .catch((e) => {
            console.log(e)
        })
}
exports.couponManagement = (req, res) => {
    let coupon = new Coupon({
        couponName: req.body.coupon,
        minimumValue: req.body.minimumValue,
        discountValue: req.body.discountValue,
        activationDate: new Date(req.body.activationTime).toLocaleString('en-US', { hour12: false }),
        expirationDate: new Date(req.body.expirationTime).toLocaleString('en-US', { hour12: false }),
    })
    coupon.save()
        .then(() => {
            res.redirect('/admin_panel/coupon-management')
        })
}
exports.deleteCoupon = (req, res) => {
    couponId = req.query.id
    Coupon.deleteOne({ _id: couponId })
        .then(() => {
            res.redirect('/admin_panel/coupon-management')
        })
}
exports.exportExcel = (req, res) => {
    
//excel chart operation 
   Order.find()
  .then((SalesReport)=>{
    

//  console.log(SalesReport)
  try {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "S no.", key: "s_no" },
      { header: "OrderID", key: "_id" },
      { header: "Date", key: "date" },
      { header: "Products", key: "order" },
      { header: "Method", key:"method" },
      { header: "User", key: 'userId', width: 10 },
      { header: "OrderValue", key: 'orderValue', width: 10 },
    ];
    let counter = 1;
    SalesReport.forEach((report) => {
      report.s_no = counter;
      report.order = "";
      report.name = report.userId;
      report.orderDetails.forEach((eachproduct) => {
      report.order += eachproduct.pname + ", ";
      });
      worksheet.addRow(report);
      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    

    res.header(
      "Content-Type",
      "application/vnd.oppenxmlformats-officedocument.spreadsheatml.sheet"
    );
    res.header("Content-Disposition", "attachment; filename=report.xlsx");

    workbook.xlsx.write(res);
  } catch (err) {
    console.log(err.message);
  }
});
}
// excel sales report end
   

exports.userBlock = (req, res) => {
    User.updateOne({ _id: ObjectId(req.query.id) }, { $set: { blockStatus: true } })
        .then(() => {
            req.session.userId = ""
            res.redirect('/admin_panel/user_management')
        })
        .catch((err) => console.log(err))
}
exports.userUnblock = (req, res) => {
    User.updateOne({ _id: ObjectId(req.query.id) }, { $set: { blockStatus: false } })
        .then(() => {
            res.redirect('/admin_panel/user_management')
        })
        .catch((err) => console.log(err))
}

exports.chart = (req,res) => {
        const months = [
            january = [],
            february = [],
            march = [],
            april = [],
            may = [],
            june = [],
            july = [],
            august = [],
            september = [],
            october = [],
            november = [],
            december = []
        ]
        
        const quarters = [
            Q1 = [],
            Q2 = [],
            Q3 = [],
            Q4 = []
        ]
    
        const monthNum = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
    
        Order.find({ "orderDetails.orderStatus" : "Delivered" })
            .then((orderDetails) => {
                monthNum.forEach((month, monthIndex) => {
                    orderDetails.forEach((order, index) => {
                        if(order.createdAt.getMonth()+1 == monthIndex+1 ) {
                            months[monthIndex].push(order);
                        }
                    })
                })
                
                orderDetails.forEach((order) => {
                    if(order.createdAt.getMonth()+1 <= 3){
                        quarters[0].push(order)
                    }else if(order.createdAt.getMonth()+1 > 3 && order.createdAt.getMonth()+1 <= 6){
                        quarters[1].push(order)
                    }else if(order.createdAt.getMonth()+1 > 6 && order.createdAt.getMonth()+1 <= 9){
                        quarters[2].push(order)
                    }else if(order.createdAt.getMonth()+1 >9 && order.createdAt.getMonth()+1 <= 12){
                        quarters[3].push(order)
                    }
                })
                
                const monthlySalesTurnover = [];
                const quarterlySalesTurnover = [];
                months.forEach((month) => {
                    let eachMonthTurnover = month.reduce((acc, curr) => {
                        acc += +curr.orderValue;
                        return acc;
                    }, 0)
                    monthlySalesTurnover.push(eachMonthTurnover);
                })
    
                quarters.forEach((quarter) => {
                    let eachQuarterTurnover = quarter.reduce((acc, curr) => {
                        acc += curr.orderValue;
                        return acc;
                    }, 0)
                    quarterlySalesTurnover.push(eachQuarterTurnover)
                })
    
                let annualSales = orderDetails.reduce((acc, curr) => {
                    acc += curr.orderValue
                    return acc;
                }, 0)
    
                res.json({ salesOfTheYear : monthlySalesTurnover, quarterlySales : quarterlySalesTurnover, annualSales : annualSales })
            })
    }


