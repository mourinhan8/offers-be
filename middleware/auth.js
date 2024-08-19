const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const jwt_secret = process.env.JWT_SECRET;
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, jwt_secret);
    const user = await User.findById(decoded.userId);
    if (!user) { 
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
