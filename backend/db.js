const dns = require('dns');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Ensure reliable DNS resolution for MongoDB Atlas SRV connection strings on Windows/local networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Fall back to default DNS if custom server setting is restricted
}

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
