const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
}, { _id: true });

module.exports = mongoose.model('Order', new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order_date: { type: Date, default: Date.now },
    total: { type: Number, required: true, min: 0 },
    items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true }));
