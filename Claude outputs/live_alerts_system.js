/**
 * ATLAS Phase 4.3 - Live Alerts System
 *
 * Real-time notifications for:
 * 1. Confidence drops below threshold (< 70%)
 * 2. New critical patterns discovered (confidence >= 80%)
 * 3. Pattern volatility (confidence swings > 20%)
 * 4. Threshold adjustments (agent optimization mode changes)
 * 5. Anomalies in pattern lag distribution
 */

class LiveAlertsSystem {
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.70;
    this.criticalThreshold = options.criticalThreshold || 0.80;
    this.volatilityThreshold = options.volatilityThreshold || 0.20; // 20% swing
    this.alerts = [];
    this.subscribers = [];
    this.previousPatterns = {};
    this.maxAlerts = options.maxAlerts || 50;
  }

  /**
   * Subscribe to alert events
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(c => c !== callback);
    };
  }

  /**
   * Process new patterns and emit alerts
   */
  processPatterns(patterns, thresholds = {}) {
    const patternArray = Array.isArray(patterns) ? patterns : Object.values(patterns);

    for (const pattern of patternArray) {
      this._checkPatternConfidence(pattern);
      this._checkPatternVolatility(pattern);
      this._checkNewCriticalPattern(pattern);
      this._checkAnomalousLag(pattern, patternArray);
    }

    if (thresholds && Object.keys(thresholds).length > 0) {
      this._checkThresholdChanges(thresholds);
    }

    return this.getRecentAlerts(10);
  }

  /**
   * Alert: Confidence drop below threshold
   */
  _checkPatternConfidence(pattern) {
    const key = `${pattern.sourceEvent}→${pattern.targetEvent}`;
    const confidence = pattern.confidence || 0;

    if (confidence < this.confidenceThreshold * 100) {
      this._addAlert({
        type: 'confidence_drop',
        severity: 'warning',
        title: 'Pattern Confidence Below Threshold',
        message: `${key} confidence dropped to ${confidence.toFixed(0)}% (threshold: ${Math.round(this.confidenceThreshold * 100)}%)`,
        pattern: pattern,
        timestamp: Date.now(),
        recommendation: 'Monitor this pattern closely for instability'
      });
    }
  }

  /**
   * Alert: Pattern volatility (large confidence swings)
   */
  _checkPatternVolatility(pattern) {
    const key = `${pattern.sourceEvent}→${pattern.targetEvent}`;
    const previousConfidence = this.previousPatterns[key]?.confidence || pattern.confidence;
    const confidenceChange = Math.abs(pattern.confidence - previousConfidence);
    const confidenceSwing = confidenceChange / (previousConfidence || 1);

    if (confidenceSwing > this.volatilityThreshold && previousConfidence !== pattern.confidence) {
      const direction = pattern.confidence > previousConfidence ? 'increased' : 'decreased';
      this._addAlert({
        type: 'volatility',
        severity: confidenceSwing > 0.4 ? 'critical' : 'warning',
        title: 'High Pattern Volatility',
        message: `${key} confidence ${direction} by ${(confidenceSwing * 100).toFixed(0)}% (${previousConfidence.toFixed(0)}% → ${pattern.confidence.toFixed(0)}%)`,
        pattern: pattern,
        timestamp: Date.now(),
        volatilityRatio: confidenceSwing,
        recommendation: 'Pattern is unstable - consider recalibration'
      });
    }

    // Update previous confidence for next comparison
    this.previousPatterns[key] = { ...pattern };
  }

  /**
   * Alert: New critical pattern discovered
   */
  _checkNewCriticalPattern(pattern) {
    const key = `${pattern.sourceEvent}→${pattern.targetEvent}`;
    const isNew = !this.previousPatterns[key];
    const isCritical = pattern.confidence >= this.criticalThreshold * 100;

    if (isNew && isCritical) {
      this._addAlert({
        type: 'new_critical_pattern',
        severity: 'info',
        title: '🎯 New Critical Pattern Discovered!',
        message: `${key} with ${pattern.confidence.toFixed(0)}% confidence and lag ${pattern.lag} cycle(s)`,
        pattern: pattern,
        timestamp: Date.now(),
        occurrences: pattern.occurrences || 1,
        recommendation: 'Verify this pattern and consider adding to decision rules'
      });
    }
  }

  /**
   * Alert: Anomalous lag distribution
   */
  _checkAnomalousLag(pattern, allPatterns) {
    const avgLag = allPatterns.reduce((sum, p) => sum + (p.lag || 1), 0) / Math.max(1, allPatterns.length);
    const lagDeviation = Math.abs((pattern.lag || 1) - avgLag);

    if (lagDeviation > 2 && pattern.confidence > this.confidenceThreshold * 100) {
      this._addAlert({
        type: 'anomalous_lag',
        severity: 'info',
        title: 'Anomalous Pattern Lag Detected',
        message: `${pattern.sourceEvent}→${pattern.targetEvent} has lag of ${pattern.lag} cycles (average: ${avgLag.toFixed(1)})`,
        pattern: pattern,
        timestamp: Date.now(),
        lagDeviation: lagDeviation,
        recommendation: 'Lag deviation may indicate system state change'
      });
    }
  }

  /**
   * Alert: Threshold adjustments
   */
  _checkThresholdChanges(thresholds) {
    for (const [agentId, threshold] of Object.entries(thresholds)) {
      const key = `threshold_${agentId}`;
      const previous = this.previousPatterns[key];

      if (previous && previous.mode !== threshold.mode) {
        this._addAlert({
          type: 'threshold_adjustment',
          severity: 'notice',
          title: 'Agent Optimization Mode Changed',
          message: `${agentId}: ${previous.mode} → ${threshold.mode} (threshold: ${threshold.current?.toFixed(2)})`,
          timestamp: Date.now(),
          agentId: agentId,
          previousMode: previous.mode,
          newMode: threshold.mode,
          recommendation: `Agent entered ${threshold.mode} mode for threshold optimization`
        });
      }

      this.previousPatterns[key] = { mode: threshold.mode };
    }
  }

  /**
   * Internal: Add alert to queue
   */
  _addAlert(alert) {
    // Don't add duplicate alerts within 10 seconds
    const isDuplicate = this.alerts.some(a =>
      a.type === alert.type &&
      a.message === alert.message &&
      (Date.now() - a.timestamp) < 10000
    );

    if (!isDuplicate) {
      alert.id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.alerts.unshift(alert);

      // Keep only recent alerts
      if (this.alerts.length > this.maxAlerts) {
        this.alerts = this.alerts.slice(0, this.maxAlerts);
      }

      // Notify subscribers
      this._notifySubscribers(alert);
    }
  }

  /**
   * Notify all subscribers of new alert
   */
  _notifySubscribers(alert) {
    this.subscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (err) {
        console.error('Alert subscriber error:', err);
      }
    });
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10) {
    return this.alerts.slice(0, limit);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity) {
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type) {
    return this.alerts.filter(a => a.type === type);
  }

  /**
   * Clear old alerts (before specified timestamp)
   */
  clearOldAlerts(beforeTimestamp) {
    this.alerts = this.alerts.filter(a => a.timestamp > beforeTimestamp);
  }

  /**
   * Get alert statistics
   */
  getStatistics() {
    const severityCounts = { critical: 0, warning: 0, notice: 0, info: 0 };
    const typeCounts = {};

    for (const alert of this.alerts) {
      severityCounts[alert.severity] = (severityCounts[alert.severity] || 0) + 1;
      typeCounts[alert.type] = (typeCounts[alert.type] || 0) + 1;
    }

    return {
      totalAlerts: this.alerts.length,
      severityCounts,
      typeCounts,
      oldestAlert: this.alerts[this.alerts.length - 1]?.timestamp,
      newestAlert: this.alerts[0]?.timestamp
    };
  }

  /**
   * Format alert for display
   */
  formatAlert(alert) {
    const severityEmoji = {
      critical: '🚨',
      warning: '⚠️',
      notice: '📋',
      info: 'ℹ️'
    };

    return {
      id: alert.id,
      emoji: severityEmoji[alert.severity] || '📢',
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      timeAgo: this._formatTimeAgo(alert.timestamp),
      recommendation: alert.recommendation
    };
  }

  /**
   * Format timestamp as "time ago"
   */
  _formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveAlertsSystem;
}
