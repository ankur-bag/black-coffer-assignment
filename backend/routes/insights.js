const express = require('express');
const router = express.Router();
const Insight = require('../models/Insight');

const FILTERABLE_FIELDS = [
  'end_year',
  'topic',
  'sector',
  'region',
  'pestle',
  'source',
  'country',
  'city',
  'swot',
];

/**
 * Builds a dynamic MongoDB filter from query parameters.
 * Supports multiple occurrences of the same parameter (OR within field),
 * and combines different parameters with AND.
 */
const buildMongoFilter = (query) => {
  const filter = {};

  for (const field of FILTERABLE_FIELDS) {
    if (query[field] !== undefined && query[field] !== '') {
      let values = query[field];

      if (Array.isArray(values)) {
        values = values.filter((v) => v !== undefined && v !== null && v !== '');
      } else if (typeof values === 'string') {
        values = values.includes(',')
          ? values.split(',').map((s) => s.trim()).filter(Boolean)
          : [values.trim()].filter(Boolean);
      } else {
        values = [values];
      }

      // Map synthetic 'Unspecified' filter to match blank or null fields.
      // If a dataset later contains a literal "Unspecified" category, this would treat it as blank.
      const hasUnspecified = values.includes('Unspecified');
      const regularValues = values.filter((v) => v !== 'Unspecified');

      if (hasUnspecified) {
        const matchValues = [...regularValues, '', null];
        filter[field] = { $in: matchValues };
      } else if (regularValues.length === 1) {
        filter[field] = regularValues[0];
      } else if (regularValues.length > 1) {
        filter[field] = { $in: regularValues };
      }
    }
  }

  return filter;
};

// a) GET /api/insights - Paginated list with dynamic filtering
router.get('/', async (req, res) => {
  try {
    const filter = buildMongoFilter(req.query);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit < 1) {
      limit = 50;
    } else if (limit > 500) {
      limit = 500; // clamp maximum to 500
    }

    const skip = (page - 1) * limit;

    const [total, results] = await Promise.all([
      Insight.countDocuments(filter),
      Insight.find(filter).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      total,
      page,
      limit,
      results,
    });
  } catch (error) {
    console.error('Error in GET /api/insights:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// b) GET /api/insights/filters - Distinct values for each filter field
router.get('/filters', async (req, res) => {
  try {
    const filterResults = {};

    await Promise.all(
      FILTERABLE_FIELDS.map(async (field) => {
        const distinctValues = await Insight.distinct(field);
        // Exclude empty string / null values so only populated options are provided
        const cleaned = distinctValues
          .filter((val) => val !== '' && val !== null && val !== undefined)
          .sort((a, b) =>
            String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
          );
        filterResults[field] = cleaned;
      })
    );

    res.json(filterResults);
  } catch (error) {
    console.error('Error in GET /api/insights/filters:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// c) GET /api/insights/stats - Aggregated metrics across insights
router.get('/stats', async (req, res) => {
  try {
    const filter = buildMongoFilter(req.query);

    const [result] = await Insight.aggregate([
      { $match: filter },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                matchedCount: { $sum: 1 },
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
              },
            },
          ],
          // Group blank categories into 'Unspecified' to maintain total record accounting across charts.
          intensityBySector: [
            {
              $addFields: {
                sectorName: {
                  $cond: [
                    { $or: [{ $eq: ['$sector', ''] }, { $eq: ['$sector', null] }] },
                    'Unspecified',
                    '$sector',
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$sectorName',
                avgIntensity: { $avg: '$intensity' },
                count: { $sum: 1 },
              },
            },
            { $sort: { avgIntensity: -1 } },
            {
              $project: {
                _id: 0,
                sector: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                count: 1,
              },
            },
          ],
          countByRegion: [
            {
              $addFields: {
                regionName: {
                  $cond: [
                    { $or: [{ $eq: ['$region', ''] }, { $eq: ['$region', null] }] },
                    'Unspecified',
                    '$region',
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$regionName',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            {
              $project: {
                _id: 0,
                region: '$_id',
                count: 1,
              },
            },
          ],
          metricsByYear: [
            {
              $addFields: {
                year: {
                  $cond: [
                    { $and: [{ $ne: ['$end_year', ''] }, { $ne: ['$end_year', null] }] },
                    '$end_year',
                    {
                      $cond: [
                        { $and: [{ $ne: ['$start_year', ''] }, { $ne: ['$start_year', null] }] },
                        '$start_year',
                        'Unspecified',
                      ],
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$year',
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                year: '$_id',
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
                sortOrder: {
                  $cond: [{ $eq: ['$_id', 'Unspecified'] }, 1, 0],
                },
              },
            },
            { $sort: { sortOrder: 1, year: 1 } },
            { $project: { sortOrder: 0 } },
          ],
          topTopics: [
            {
              $addFields: {
                topicName: {
                  $cond: [
                    { $or: [{ $eq: ['$topic', ''] }, { $eq: ['$topic', null] }] },
                    'Unspecified',
                    '$topic',
                  ],
                },
              },
            },
            {
              $group: {
                _id: '$topicName',
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $project: {
                _id: 0,
                topic: '$_id',
                count: 1,
              },
            },
          ],
          // Exclude records with missing scores (coerced to 0) to avoid plotting false minimums at the origin.
          bubblePoints: [
            {
              $match: {
                intensity: { $gt: 0 },
                likelihood: { $gt: 0 },
                relevance: { $gt: 0 },
              },
            },
            { $sample: { size: 500 } },
            {
              $project: {
                _id: 0,
                intensity: 1,
                likelihood: 1,
                relevance: 1,
                sector: {
                  $cond: [
                    { $or: [{ $eq: ['$sector', ''] }, { $eq: ['$sector', null] }] },
                    'Unspecified',
                    '$sector',
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    const overview = (result && result.overview && result.overview[0]) || {
      matchedCount: 0,
      avgIntensity: 0,
      avgLikelihood: 0,
      avgRelevance: 0,
    };

    const response = {
      matchedCount: overview.matchedCount || 0,
      avgIntensity: overview.avgIntensity ? Math.round(overview.avgIntensity * 100) / 100 : 0,
      avgLikelihood: overview.avgLikelihood ? Math.round(overview.avgLikelihood * 100) / 100 : 0,
      avgRelevance: overview.avgRelevance ? Math.round(overview.avgRelevance * 100) / 100 : 0,
      intensityBySector: (result && result.intensityBySector) || [],
      countByRegion: (result && result.countByRegion) || [],
      metricsByYear: (result && result.metricsByYear) || [],
      topTopics: (result && result.topTopics) || [],
      bubblePoints: (result && result.bubblePoints) || [],
    };

    res.json(response);
  } catch (error) {
    console.error('Error in GET /api/insights/stats:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
