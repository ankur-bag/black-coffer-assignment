const mongoose = require('mongoose');

// Data quality note: ~4% (38/1000) of records in jsondata.json have missing or empty strings
// for intensity, likelihood, or relevance. We coerce missing or non-numeric values to the default 0
// to prevent CastErrors on ingestion while preserving all records.
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
    // Forward-compatibility: city is not populated in the initial ~1000 dataset,
    // but included in schema for prospective geolocation and regional data expansion.
    city: {
      type: String,
      default: '',
      trim: true,
    },
    // Forward-compatibility: swot is not populated in the initial ~1000 dataset,
    // but included in schema for prospective strategic analysis categorization.
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

// Explicit verification of single-field indexes requested:
// sector, region, country, topic, pestle, source, end_year
// (These are indexed individually via `index: true` in field definitions above)

const Insight = mongoose.model('Insight', insightSchema);

module.exports = Insight;
