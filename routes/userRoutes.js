// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// --- JWT Secret (store this in a .env file!) ---
const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key'; 

// Helper function to generate a JWT
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: '1h' }); 
};

// --- POST /api/users/register ---
router.post('/register', async (req, res) => {
  const { first, last, email, username, password, mobile, gender } = req.body;

  // Simple validation for required fields
  if (!first || !last || !email || !username || !password || !mobile || !gender) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const user = await User.create({
      first,
      last,
      email,
      username,
      password,
      mobile,
      gender,
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful! Please log in.',
        user: {
          _id: user._id,
          username: user.username,
        },
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    // ✨ FIX: Better error handling for duplicate fields and validation errors
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({ message: `${field} already exists.` });
    }
    
    if (error.name === 'ValidationError') {
      const validationMessage = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      return res.status(400).json({ message: validationMessage });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- POST /api/users/login ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res.status(200).json({
        message: 'Login successful.',
        token, 
        user: {
          _id: user._id,
          username: user.username,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;