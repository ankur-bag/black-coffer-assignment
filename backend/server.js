const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db');
const insightsRouter = require('./routes/insights');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();

// Allowed origins for cross-origin browser requests from local dev and production Vercel frontend.
// Supports localhost:3000, production Vercel URL, and any preview deployment (*.vercel.app).
const allowedOrigins = [
  'http://localhost:3000',
  'https://black-coffer-ankur.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server, health pings)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Mount API routes
app.use('/api/insights', insightsRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Blackcoffer Insights API is running.' });
});

// Port configuration (fallback 5000)
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start Express server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
