const express = require('express')
const router = express.Router()

const store = require('../../middleware/multer')
const services = require('../../controller/render')

// router.get('/user_home', services.isLoggedIn, services.userHome)
router.get('/', services.guestHome)
router.get('/user_home', services.isLoggedIn , services.userHome)

router.get('/user_home/product-view', services.isLoggedIn, services.productsView)

router.get("/user_home/shopping-cart", services.isLoggedIn, services.cartPage)
router.post('/user_home/add-to-cart', services.cart1)
router.post('/changeQuantity', services.changeQty)

router.get('/user_home/delete-cart-product', services.deleteCartProduct)
router.get('/user_home/delete-wishlist-product', services.deleteWishlistProduct)

router.get('/user_home/wishlist', services.isLoggedIn, services.wishlistPage)
router.post('/user_home/wishlist', services.isLoggedIn, services.wishlist)

router.get('/user_home/shopping-cart/checkout', services.isLoggedIn, services.checkoutPage)
router.get('/user_home/shopping-cart/checkout/add-new-address', services.isLoggedIn, services.addNewAddressPage)
router.post('/user_home/shopping-cart/checkout/add-new-address', services.addNewAddress)
router.post('/user_home/shopping-cart/checkout/payment', services.payment)

router.get('/order-success', services.orderSuccess)

// router.get('/apply-coupon-code',services.coupon)


router.get('/payment/razorpay', services.razorpay)
router.get('/payment/paypal', services.paypal)

router.get('/user_home/profile', services.isLoggedIn, services.profile)
router.get('/user_home/profile-edit', services.isLoggedIn, services.profileEditPage)
router.post('/user_home/profile-edit', store.any(), services.profileEdit)

router.get('/user_home/your-orders', services.userOrders)
router.get('/user_home/your-orders/view-order-product', services.viewOrderedProducts)
router.post('/cancelOrderUserSide', services.cancelOrderUserSide)

router.post('/user_home/apply-coupon', services.isLoggedIn, services.applyCoupon)

router.get('/user-category',  services.categorySelectionHome)


module.exports = router
