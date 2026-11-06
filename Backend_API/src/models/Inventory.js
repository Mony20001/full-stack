const mongoose = require('mongoose');

module.exports = mongoose.model('Inventory', new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    reorder_level: { type: Number, required: true, min: 0, default: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 }
}, { timestamps: true }));
