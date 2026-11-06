const expree = require('express');
const passport = require('passport');
const userController = require('../controllers/user.controller');
const router = expree.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google', userController.googleLogin);
router.get('/google/redirect', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    userController.googleCallback
);

router.get('/logout', userController.logout);
module.exports = router;
