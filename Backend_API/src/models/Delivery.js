const mongoose = require('mongoose');

module.exports = mongoose.model('Delivery', new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carrier: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    est_delivery: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'], default: 'pending' }
}, { timestamps: true }));
