// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  first: {
    type: String,
    required: true,
  },
  last: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    match: [/.+@.+\..+/, 'Please enter a valid email address'], // Simple regex validation
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is unique
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// --- Middleware to hash the password before saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Only hash if the password field is being modified
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- Method to compare a given password with the hashed password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the Mongoose model
const User = mongoose.model('User', userSchema);
module.exports = User;