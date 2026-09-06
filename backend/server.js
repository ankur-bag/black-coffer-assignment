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

// Middleware
app.use(cors());
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
