/**
 * ATLAS Phase 4.3 - Pattern Prediction Engine
 *
 * Forecasts the next temporal pattern based on:
 * 1. Historical lag-confidence relationships
 * 2. Event frequency distribution
 * 3. Confidence trend analysis
 *
 * Returns predicted patterns with:
 * - Source and target events
 * - Expected lag (1-5 cycles)
 * - Predicted confidence score
 * - Forecast certainty (0-100%)
 */

class PatternPredictionEngine {
  constructor() {
    this.patterns = [];
    this.predictions = [];
    this.confidenceThreshold = 0.70; // Only predict patterns above 70% confidence
  }

  /**
   * Add historical patterns for training
   */
  addPatterns(patterns) {
    this.patterns = Array.isArray(patterns) ? patterns : Object.values(patterns);
  }

  /**
   * Predict next patterns based on historical data
   * Returns top N predictions sorted by confidence
   */
  predictNextPatterns(topN = 5) {
    if (this.patterns.length < 2) {
      return [];
    }

    // Step 1: Analyze historical patterns
    const analysis = this._analyzeHistoricalPatterns();

    // Step 2: Identify high-confidence transitions
    const transitions = this._findConfidentTransitions();

    // Step 3: Predict based on lag-confidence trends
    const predictions = this._generatePredictions(analysis, transitions);

    // Step 4: Rank predictions by certainty
    const ranked = predictions.sort((a, b) => b.certainty - a.certainty).slice(0, topN);

    this.predictions = ranked;
    return ranked;
  }

  /**
   * Analyze historical pattern characteristics
   */
  _analyzeHistoricalPatterns() {
    const lagDistribution = {};
    const confidenceByLag = {};
    const eventPairs = {};

    for (const pattern of this.patterns) {
      const lag = pattern.lag || 1;
      const confidence = pattern.confidence || 0;
      const key = `${pattern.sourceEvent}→${pattern.targetEvent}`;

      // Track lag frequency
      lagDistribution[lag] = (lagDistribution[lag] || 0) + 1;

      // Track confidence by lag
      if (!confidenceByLag[lag]) {
        confidenceByLag[lag] = [];
      }
      confidenceByLag[lag].push(confidence);

      // Track event pair frequencies
      if (!eventPairs[key]) {
        eventPairs[key] = {
          count: 0,
          lags: [],
          confidences: [],
          avgConfidence: 0
        };
      }
      eventPairs[key].count += 1;
      eventPairs[key].lags.push(lag);
      eventPairs[key].confidences.push(confidence);
      eventPairs[key].avgConfidence = eventPairs[key].confidences.reduce((a, b) => a + b, 0) / eventPairs[key].confidences.length;
    }

    return {
      lagDistribution,
      confidenceByLag,
      eventPairs,
      avgConfidenceByLag: Object.entries(confidenceByLag).reduce((acc, [lag, confidences]) => {
        acc[lag] = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        return acc;
      }, {})
    };
  }

  /**
   * Find high-confidence transitions between patterns
   */
  _findConfidentTransitions() {
    const transitions = {};

    for (let i = 0; i < this.patterns.length - 1; i++) {
      const current = this.patterns[i];
      const next = this.patterns[i + 1];

      if (current.confidence > this.confidenceThreshold && next.confidence > this.confidenceThreshold) {
        const transitionKey = `${current.targetEvent}→${next.sourceEvent}`;
        if (!transitions[transitionKey]) {
          transitions[transitionKey] = {
            count: 0,
            lagGaps: [],
            confidenceChanges: []
          };
        }
        transitions[transitionKey].count += 1;
        transitions[transitionKey].lagGaps.push((next.lag || 1) - (current.lag || 1));
        transitions[transitionKey].confidenceChanges.push(next.confidence - current.confidence);
      }
    }

    return transitions;
  }

  /**
   * Generate predictions based on analysis
   */
  _generatePredictions(analysis, transitions) {
    const predictions = [];
    const seenPairs = new Set();

    // Strategy 1: Predict high-confidence event pairs
    for (const [pair, data] of Object.entries(analysis.eventPairs)) {
      if (data.avgConfidence > this.confidenceThreshold && data.count >= 2) {
        const [source, target] = pair.split('→');
        const avgLag = Math.round(data.lags.reduce((a, b) => a + b, 0) / data.lags.length);

        predictions.push({
          sourceEvent: source,
          targetEvent: target,
          lag: Math.max(1, Math.min(5, avgLag)), // Clamp to 1-5 range
          predictedConfidence: Math.round(data.avgConfidence),
          certainty: Math.min(100, (data.count / this.patterns.length) * 100 + data.avgConfidence),
          reason: `Historical pair (observed ${data.count}x)`,
          type: 'historical'
        });
        seenPairs.add(pair);
      }
    }

    // Strategy 2: Predict based on state transitions
    for (const [transition, data] of Object.entries(transitions)) {
      if (data.count >= 2) {
        // Infer pattern from transition
        const parts = transition.split('→');
        if (parts.length === 2) {
          const avgLagGap = Math.round(data.lagGaps.reduce((a, b) => a + b, 0) / data.lagGaps.length);
          const avgConfChange = data.confidenceChanges.reduce((a, b) => a + b, 0) / data.confidenceChanges.length;

          predictions.push({
            sourceEvent: parts[0],
            targetEvent: parts[1],
            lag: Math.max(1, Math.min(5, Math.abs(avgLagGap) + 1)),
            predictedConfidence: Math.round(Math.max(70, 75 + avgConfChange * 10)),
            certainty: (data.count / this.patterns.length) * 100,
            reason: `Pattern transition (${data.count}x observed)`,
            type: 'transition'
          });
        }
      }
    }

    // Strategy 3: Trend-based prediction (confidence increasing patterns)
    const recentPatterns = this.patterns.slice(-Math.max(3, Math.floor(this.patterns.length / 3)));
    if (recentPatterns.length >= 2) {
      const trend = recentPatterns[recentPatterns.length - 1].confidence - recentPatterns[0].confidence > 0 ? 'increasing' : 'decreasing';

      if (trend === 'increasing' && recentPatterns.length > 0) {
        const lastPattern = recentPatterns[recentPatterns.length - 1];
        // Predict continuation of trend
        const nextConfidence = Math.min(100, lastPattern.confidence + 5);

        predictions.push({
          sourceEvent: lastPattern.sourceEvent,
          targetEvent: lastPattern.targetEvent,
          lag: Math.max(1, lastPattern.lag - 1),
          predictedConfidence: Math.round(nextConfidence),
          certainty: 45,
          reason: 'Trend continuation (confidence increasing)',
          type: 'trend'
        });
      }
    }

    // Remove duplicates and return unique predictions
    return Array.from(new Map(
      predictions.map(p => [`${p.sourceEvent}→${p.targetEvent}`, p])
    ).values());
  }

  /**
   * Get predictions formatted for dashboard display
   */
  getFormattedPredictions() {
    return this.predictions.map(p => ({
      source: p.sourceEvent || 'Unknown',
      target: p.targetEvent || 'Unknown',
      lag: p.lag || 1,
      confidence: p.predictedConfidence || 0,
      certainty: Math.round(p.certainty) || 0,
      reason: p.reason || 'ML prediction',
      type: p.type || 'model'
    }));
  }

  /**
   * Evaluate prediction accuracy (when actual outcome is known)
   */
  evaluatePrediction(actualPattern) {
    if (!this.predictions || this.predictions.length === 0) {
      return null;
    }

    const prediction = this.predictions[0]; // Check against top prediction
    const lagAccuracy = prediction.lag === actualPattern.lag ? 100 : Math.max(0, 100 - Math.abs(prediction.lag - actualPattern.lag) * 20);
    const confidenceAccuracy = Math.abs(prediction.predictedConfidence - actualPattern.confidence);

    return {
      lagAccuracy: Math.round(lagAccuracy),
      confidenceError: Math.round(confidenceAccuracy),
      overallAccuracy: Math.round((lagAccuracy + (100 - Math.min(100, confidenceAccuracy))) / 2),
      prediction: prediction,
      actual: actualPattern
    };
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatternPredictionEngine;
}
