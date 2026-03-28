const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.EXPO_PUBLIC_WEB_CLIENT_ID);


const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ 
      name: name || 'משתמש', 
      email, 
      password: hashedPassword 
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email, picture: user.picture } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, picture: user.picture } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID Token required' });

    const ticket = await client.verifyIdToken({
      idToken,
      // Supporting both Web and Android Client IDs as valid audiences
      audience: [
        process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        process.env.GOOGLE_CLIENT_ID,
        '980248010841-m8kj0mflpavgmg9qap2mm0uughngfibn.apps.googleusercontent.com', // Web
        '980248010841-7m9vgpim1c7fhnvldh5cmv49qnlfoige.apps.googleusercontent.com'  // Android
      ].filter(Boolean),
    });
    
    console.log('✅ Google Auth Success for:', ticket.getPayload().email);
    
    const { email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ 
        name: name || 'משתמש גוגל', 
        email, 
        picture,
        password: Math.random().toString(36).slice(-10) // Unused password
      });
      await user.save();
    } else if (picture && user.picture !== picture) {
      // Always update picture if Google provides a different one
      user.picture = picture;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email, picture } });
  } catch (err) {
    console.error('--- GOOGLE AUTH ERROR DETAILS ---');
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack:', err.stack);
    console.error('--------------------------------');
    res.status(401).json({ error: 'Invalid Google token', details: err.message });
  }
};
