// lib/matching/matching-config.js

export const MATCHING_CONFIG = {
  // Maximum distance for matching (in miles)
  MAX_DISTANCE: 50,

  // Scoring weights (must add up to 100)
  WEIGHTS: {
    DISTANCE: 40,        // 40% weight on distance
    ACCESSIBILITY: 60,   // 60% weight on accessibility match
  },

  // Distance scoring bands (miles)
  DISTANCE_BANDS: {
    EXCELLENT: 5,   // 0-5 miles = 100 points
    GOOD: 15,       // 5-15 miles = 75 points
    FAIR: 30,       // 15-30 miles = 50 points
    POOR: 50,       // 30-50 miles = 25 points
    // Beyond 50 miles = 0 points (excluded)
  },

  // Accessibility feature weights (for calculating match percentage)
  ACCESSIBILITY_WEIGHTS: {
    wheelchair: 1.0,
    hoist: 1.0,
    rampAccess: 0.8,
    wideDoors: 0.6,
    securingPoints: 0.8,
    companion: 0.5,
    mobilityAid: 0.7,
    assistance: 0.6,
  },

  // Cache settings
  CACHE_DURATION_MINUTES: 60,
};

// Accessibility features list
export const ACCESSIBILITY_FEATURES = [
  'wheelchair',
  'hoist',
  'rampAccess',
  'wideDoors',
  'securingPoints',
  'companion',
  'mobilityAid',
  'assistance',
];