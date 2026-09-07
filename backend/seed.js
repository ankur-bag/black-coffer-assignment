const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./db');
const Insight = require('./models/Insight');

const seedData = async () => {
  try {
    await connectDB();

    const dataPath = path.resolve(__dirname, 'data', 'jsondata.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Data file not found at: ${dataPath}`);
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const records = JSON.parse(rawData);
    console.log(`Read ${records.length} records from ${dataPath}`);

    // Trim whitespace and normalize casing inconsistencies in source data (e.g. "world" -> "World").
    const cleanedRecords = records.map((record) => {
      const cleaned = {};
      for (const [key, value] of Object.entries(record)) {
        cleaned[key] = typeof value === 'string' ? value.trim() : value;
      }
      if (cleaned.region && cleaned.region.toLowerCase() === 'world') {
        cleaned.region = 'World';
      }
      return cleaned;
    });

    const deleteResult = await Insight.deleteMany({});
    console.log(`Cleared existing records (deleted: ${deleteResult.deletedCount || 0}).`);

    const inserted = await Insight.insertMany(cleanedRecords);
    console.log(`Successfully inserted ${inserted.length} records into the database.`);

    await mongoose.connection.close();
    console.log('Database connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    try {
      await mongoose.connection.close();
    } catch (closeErr) {
      // ignore secondary error on connection close
    }
    process.exit(1);
  }
};

seedData();
