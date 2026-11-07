const express = require('express')
const morgan = require('morgan')
const connectDB = require("./src/config/db.js");
const passport = require('passport')
const session = require('express-session')
require('dotenv').config();
require('./src/config/passport.js')

const PORT = process.env.PORT || 5000
// SESSION_SECRE is retained only to avoid breaking existing local .env files.
const sessionSecret = process.env.SESSION_SECRET || process.env.SESSION_SECRE;
if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required. Set it in your hosting provider or Backend_API/.env.');
}
const server = express();
connectDB();
server.use(morgan('dev'));
server.use(express.json());
server.use((req, res, next) => {
    // `localhost` and `127.0.0.1` are separate browser origins. Support both
    // local Vite apps so Google sign-in can post its credential to this API.
    const allowedOrigins = [
        ...(process.env.CLIENT_URLS || process.env.CLIENT_URL || '').split(','),
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ].map(origin => origin.trim()).filter(Boolean);
    if (req.headers.origin && allowedOrigins.includes(req.headers.origin)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

//===========Route==============
const userRoute = require('./src/routes/user.route.js')
const categoryRoute = require('./src/routes/category.route.js');
const productRoute = require('./src/routes/product.route.js');
const inventoryRoute = require('./src/routes/inventory.route.js');
const orderRoute = require('./src/routes/order.route.js');
const deliveryRoute = require('./src/routes/delivery.route.js');
server.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));


server.use(passport.initialize());
server.use(passport.session());

server.use('/api/auth', userRoute);
server.use('/api/categories', categoryRoute);
server.use('/api/products', productRoute);
server.use('/api/inventory', inventoryRoute);
server.use('/api/orders', orderRoute);
server.use('/api/deliveries', deliveryRoute);

server.get('/', (req, res) => {
    res.json({
        message: "Welcome to API...!!!",
        docs: `http://localhost:${PORT}/API!`,
        version: "1.0.0",
        status: 'healthy'
    })
})

server.use((req, res) => res.status(404).json({ message: 'Route not found' }));
server.use((err, req, res, next) => {
    console.error(err);
    const invalidInput = err.name === 'ValidationError' || err.name === 'CastError' || err.code === 11000;
    res.status(invalidInput ? 400 : (err.status || 500)).json({ message: err.message || 'Internal server error' });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} `);
});
