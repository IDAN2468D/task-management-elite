const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Using standard cross-origin requests
app.use(cors());
app.use(express.json());

// GLOBAL REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`>>> [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log(`    Auth: ${req.headers.authorization.substring(0, 20)}...`);
  } else {
    console.log('    Auth: NONE');
  }
  next();
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://idankzm:idankzm2468@cluster0.purdk.mongodb.net/task-management';

// Connect to MongoDB
console.log('--- Startup Config Audit ---');
console.log(`Port: ${PORT}`);
console.log(`Web Client ID: ...${process.env.EXPO_PUBLIC_WEB_CLIENT_ID?.substring(13, 25)}...`);
console.log(`Android Client ID: ...${process.env.GOOGLE_CLIENT_ID?.substring(13, 25)}...`);
console.log(`API URL: ${process.env.EXPO_PUBLIC_API_URL}`);
console.log('---------------------------');

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Register Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

// Healthcheck endpoint
app.get('/health', (req, res) => res.send('Server is healthy!'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Task Management Backend running on http://0.0.0.0:${PORT}`);
});
