const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'משתמש',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  picture: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isPro: {
    type: Boolean,
    default: false,
  },
  preferences: {
    focusSessionLength: { type: Number, default: 25 }, // minutes
    shortBreakLength: { type: Number, default: 5 },
    longBreakLength: { type: Number, default: 15 },
    notificationsEnabled: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
