const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/product';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected is successfully...!!!');
    } catch (error) {
        console.log('MongoDB connection is error...!!!', error.message);
    }
};
module.exports= connectDB;