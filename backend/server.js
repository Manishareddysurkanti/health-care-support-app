require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const requestsRouter = require('./routes/requests');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= BASIC ROUTES ================= */

// Home route (fix for "Cannot GET /")
app.get('/', (req, res) => {
  res.send('🚀 Healthcare Support API is running');
});

// Health check route (for testing API)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Healthcare Support API is running'
  });
});

/* ================= API ROUTES ================= */
app.use('/api/auth', authRouter);
app.use('/api/requests', requestsRouter);

/* ================= DATABASE + SERVER START ================= */
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Connected to MySQL and synchronized database');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  });