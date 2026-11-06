const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userID : {type: String, required: true, unique: true},
    userName: {type: String, required: true},
    userEmail: {type: String, required: true, unique: true, lowercase: true, trim: true},
    passwordHash: { type: String, select: false },
    avatar: {type: String},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);
