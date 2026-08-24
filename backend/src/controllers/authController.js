const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    title: user.title,
    location: user.location,
    targetRole: user.targetRole,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, targetRole = '' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });

    const user = await User.createWithPassword({ name, email: email.toLowerCase().trim(), password, targetRole });
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await user.verifyPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
