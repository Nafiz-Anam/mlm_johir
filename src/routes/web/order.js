const router = require("express").Router();
const orderController = require("../../controllers/web/orderController");

router.get('/order_history',orderController.getOrderHistory);

module.exports = router;