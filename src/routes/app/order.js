const router = require("express").Router();
const orderController = require("../../controllers/app/orderController");

router.get('/order_history',orderController.getOrderHistory);

module.exports = router;