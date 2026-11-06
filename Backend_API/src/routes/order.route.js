const express = require('express');
const orders = require('../controllers/order.controller');

const router = express.Router();
router.route('/').get(orders.list).post(orders.create);
router.route('/:id').get(orders.get).patch(orders.updateStatus).delete(orders.remove);
router.patch('/:id/status', orders.updateStatus);
router.route('/:orderId/items').get(orders.listItems).post(orders.addItem);
router.route('/:orderId/items/:itemId').get(orders.getItem).patch(orders.updateItem).delete(orders.removeItem);
module.exports = router;
