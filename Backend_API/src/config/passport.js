const passport = require('passport');
const googleUser = require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');

const googleOAuthConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (googleOAuthConfigured) {
    passport.use(new googleUser({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ userID: profile.id });
                if (user) return done(null, user);
                user = new User({
                    userID: profile.id,
                    userName: profile.displayName || profile.emails?.[0]?.value,
                    userEmail: profile.emails?.[0]?.value,
                    avatar: profile.photos?.[0]?.value
                });
                await user.save();
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    ));
} else {
    console.warn('Google OAuth is disabled: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null)
    }
})

module.exports = { googleOAuthConfigured };
