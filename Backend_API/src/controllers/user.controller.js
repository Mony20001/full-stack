const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const tokenFor = (user) => jwt.sign(
    { sub: user._id.toString(), email: user.userEmail, name: user.userName },
    process.env.JWT_SECRET || process.env.SESSION_SECRET || process.env.SESSION_SECRE,
    { expiresIn: '7d' }
);
const publicUser = (user) => ({ id: user._id, name: user.userName, email: user.userEmail, avatar: user.avatar });
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
};
const validPassword = (password, savedHash) => {
    if (!savedHash) return false;
    const [salt, hash] = savedHash.split(':');
    const next = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash.length === next.length && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(next));
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        const existing = await User.findOne({ userEmail: email.toLowerCase().trim() });
        if (existing) return res.status(409).json({ message: 'An account with that email already exists.' });
        const user = await User.create({ userID: `local-${crypto.randomUUID()}`, userName: name.trim(), userEmail: email, passwordHash: hashPassword(password) });
        res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ userEmail: email?.toLowerCase().trim() }).select('+passwordHash');
        if (!user || !password || !validPassword(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password.' });
        res.json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
};

exports.googleCallback = (req, res) => res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);

exports.googleLogin = async (req, res, next) => {
    try {
        if (!req.body.credential || !process.env.GOOGLE_CLIENT_ID) return res.status(400).json({ message: 'Google sign-in is not configured.' });
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const profile = ticket.getPayload();
        if (!profile?.sub || !profile.email) return res.status(400).json({ message: 'Google did not provide a usable profile.' });
        const user = await User.findOneAndUpdate(
            { userID: profile.sub },
            { $set: { userName: profile.name || profile.email, userEmail: profile.email, avatar: profile.picture || '' } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ token: tokenFor(user), user: publicUser(user) });
    } catch (error) { next(error); }
};
exports.logout = (req, res, next) =>{
    req.logout((err) =>{
        if(err) return next(err);
        res.send('Leaving from system success...!!!');
    });
};
