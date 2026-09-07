const mongoose = require('mongoose');

// Coerce blank or non-numeric score fields to 0 to prevent cast errors while preserving records.
const sanitizeNumber = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(v)) {
    return 0;
  }
  return Number(v);
};

const insightSchema = new mongoose.Schema(
  {
    end_year: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    intensity: {
      type: Number,
      default: 0,
      set: sanitizeNumber,
    },
    sector: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    insight: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    region: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    start_year: {
      type: String,
      default: '',
      trim: true,
    },
    impact: {
      type: String,
      default: '',
      trim: true,
    },
    added: {
      type: String,
      default: '',
      trim: true,
    },
    published: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    relevance: {
      type: Number,
      default: 0,
      set: sanitizeNumber,
    },
    pestle: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    source: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    likelihood: {
      type: Number,
      default: 0,
      set: sanitizeNumber,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    swot: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: false,
  }
);

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;
