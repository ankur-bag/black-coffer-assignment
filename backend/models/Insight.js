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
      index: true,
    },
    topic: {
      type: String,
      default: '',
      index: true,
    },
    insight: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    region: {
      type: String,
      default: '',
      index: true,
    },
    start_year: {
      type: String,
      default: '',
    },
    impact: {
      type: String,
      default: '',
    },
    added: {
      type: String,
      default: '',
    },
    published: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
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
      index: true,
    },
    source: {
      type: String,
      default: '',
      index: true,
    },
    title: {
      type: String,
      default: '',
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
    },
    // Forward-compatibility: swot is not populated in the initial ~1000 dataset,
    // but included in schema for prospective strategic analysis categorization.
    swot: {
      type: String,
      default: '',
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
