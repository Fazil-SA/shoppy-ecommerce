const express = require('express')
const router = express.Router()

const services = require('../../controller/render')
const store = require('../../middleware/multer')


router.get('/admin_panel',services.adminLoggedIn,services.adminpanelRouter)

router.get('/admin_panel/product_management',services.adminLoggedIn,services.products)
router.get('/admin_panel/product_management/add-product',services.adminLoggedIn,services.addProductRouter)
router.post('/admin_panel/product_management/add-product',store.any(),services.addProduct)

router.get('/admin_panel/editProduct',services.editProduct)
router.post('/admin_panel/product_management/update-product',store.any(),services.updateProduct)
router.get('/admin_panel/deleteProduct',services.deleteProduct)


router.get('/admin_panel/order_management',services.adminLoggedIn,services.orders)
router.get('/admin_panel/order_management/view-order-product',services.adminLoggedIn,services.viewOrderProducts)

router.post('/orderAcceptButton',services.orderAcceptButton)
router.post('/shipOrderButton',services.shipOrderButton)
router.post('/completeOrderButton',services.completeOrderButton)
router.get('/cancelProductOrder',services.cancelProductOrder)

router.get('/admin_panel/user_management',services.adminLoggedIn,services.userManagement)

router.get('/admin_panel/category-management',services.adminLoggedIn,services.categoryManagementPage)
router.post('/admin_panel/category-management',services.adminLoggedIn,services.categoryManagement)
router.get('/admin_panel/category-management/delete-category',services.deleteCategory)

router.get('/admin_panel/coupon-management',services.adminLoggedIn,services.couponManagementPage)
router.post('/admin_panel/coupon-management',services.couponManagement)
router.get('/admin_panel/coupon-management/delete-coupon',services.deleteCoupon)

router.get('/admin/exportExcel',services.exportExcel)

router.post('/user/block',services.userBlock)

router.post('/user/unblock',services.userUnblock)

router.post('/chart',services.chart)

module.exports = router