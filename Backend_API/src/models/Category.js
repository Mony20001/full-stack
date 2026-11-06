const mongoose = require('mongoose');

module.exports = mongoose.model('Category', new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: '' }
}, { timestamps: true }));
