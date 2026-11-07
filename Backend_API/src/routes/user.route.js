const expree = require('express');
const passport = require('passport');
const userController = require('../controllers/user.controller');
const { googleOAuthConfigured } = require('../config/passport');
const router = expree.Router();
const requireGoogleOAuth = (req, res, next) => {
    if (!googleOAuthConfigured) return res.status(503).json({ message: 'Google sign-in is not configured.' });
    next();
};

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/google', userController.googleLogin);
router.get('/google/redirect', requireGoogleOAuth, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    requireGoogleOAuth,
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login` }),
    userController.googleCallback
);

router.get('/logout', userController.logout);
module.exports = router;
