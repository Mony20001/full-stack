const mongoose = require('mongoose');

module.exports = mongoose.model('Product', new mongoose.Schema({
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { timestamps: true }));
