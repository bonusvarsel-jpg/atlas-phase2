#!/usr/bin/env node

/**
 * ATLAS Phase 4.2 Part 1: Self-Optimizing Thresholds
 * Agents learn from their own decisions and adapt risk tolerance
 */

class SelfOptimizingThresholds {
  constructor() {
    this.agents = {};
  }

  recordOutcome(agentId, decisionScore, actualOutcome) {
    if (!this.agents[agentId]) {
      this.agents[agentId] = {
        currentThreshold: 0.5,
        decisions: [],
        confusion: { tp: 0, fp: 0, tn: 0, fn: 0 },
        adjustmentHistory: []
      };
    }

    const agent = this.agents[agentId];
    agent.decisions.push({ decisionScore, actualOutcome, timestamp: new Date() });

    const predicted = decisionScore >= agent.currentThreshold;
    if (predicted && actualOutcome) agent.confusion.tp++;
    if (predicted && !actualOutcome) agent.confusion.fp++;
    if (!predicted && !actualOutcome) agent.confusion.tn++;
    if (!predicted && actualOutcome) agent.confusion.fn++;
  }

  calculateMetrics(agentId) {
    const agent = this.agents[agentId];
    if (!agent) return null;

    const { tp, fp, tn, fn } = agent.confusion;
    const accuracy = (tp + tn) / (tp + fp + tn + fn) || 0;
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const falsePositiveRate = fp / (fp + tn) || 0;

    return { accuracy, precision, recall, falsePositiveRate };
  }

  optimizeThreshold(agentId, businessImpact = 'balanced') {
    const agent = this.agents[agentId];
    const metrics = this.calculateMetrics(agentId);
    if (!metrics) return null;

    const oldThreshold = agent.currentThreshold;

    if (businessImpact === 'conservative') {
      if (metrics.recall < 0.8) agent.currentThreshold *= 0.95;
    } else if (businessImpact === 'aggressive') {
      if (metrics.falsePositiveRate > 0.2) agent.currentThreshold *= 1.05;
    } else {
      const f1 = 2 * (metrics.precision * metrics.recall) / (metrics.precision + metrics.recall || 1);
      if (f1 < 0.7) agent.currentThreshold *= 0.98;
    }

    agent.adjustmentHistory.push({
      timestamp: new Date(),
      oldThreshold: oldThreshold.toFixed(3),
      newThreshold: agent.currentThreshold.toFixed(3),
      reason: businessImpact
    });

    return {
      agentId,
      oldThreshold: oldThreshold.toFixed(3),
      newThreshold: agent.currentThreshold.toFixed(3),
      metrics,
      adjusted: Math.abs(oldThreshold - agent.currentThreshold) > 0.001
    };
  }

  optimizeAllAgents(businessImpact = 'balanced') {
    const report = {};
    Object.keys(this.agents).forEach(agentId => {
      report[agentId] = this.optimizeThreshold(agentId, businessImpact);
    });
    return report;
  }

  getOptimizationReport() {
    const report = {
      timestamp: new Date(),
      agentCount: Object.keys(this.agents).length,
      agents: {}
    };

    Object.entries(this.agents).forEach(([agentId, agent]) => {
      const metrics = this.calculateMetrics(agentId);
      report.agents[agentId] = {
        currentThreshold: agent.currentThreshold.toFixed(3),
        decisionCount: agent.decisions.length,
        metrics,
        adjustmentCount: agent.adjustmentHistory.length
      };
    });

    return report;
  }
}

// Demo
if (require.main === module) {
  console.log('\n🧠 Phase 4.2 Part 1: Self-Optimizing Thresholds\n');

  const optimizer = new SelfOptimizingThresholds();

  // Simulate 10 decision cycles
  const agents = ['risk-01', 'execution-01', 'thailand-property'];
  for (let cycle = 0; cycle < 10; cycle++) {
    agents.forEach(agentId => {
      const score = Math.random();
      const outcome = Math.random() > 0.3;
      optimizer.recordOutcome(agentId, score, outcome);
    });
  }

  // Optimize thresholds
  console.log('📊 Running optimization pass...');
  const optimizations = optimizer.optimizeAllAgents('balanced');

  Object.entries(optimizations).forEach(([agentId, result]) => {
    if (result) {
      console.log(`\n${agentId}:`);
      console.log(`  Threshold: ${result.oldThreshold} → ${result.newThreshold}`);
      console.log(`  Accuracy: ${(result.metrics.accuracy * 100).toFixed(1)}%`);
      console.log(`  Adjusted: ${result.adjusted ? '✅' : '—'}`);
    }
  });

  console.log('\n📋 Full Report:\n', optimizer.getOptimizationReport());
}

module.exports = { SelfOptimizingThresholds };
