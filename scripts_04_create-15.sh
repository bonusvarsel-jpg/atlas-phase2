#!/bin/bash
mkdir -p ~/atlas-phase2/scripts

cat > ~/atlas-phase2/scripts/15_phase42-temporal-patterns.js << 'EOF'
#!/usr/bin/env node

/**
 * ATLAS Phase 4.2 Part 2: Temporal Pattern Recognition
 * Discovers causality patterns across agent cycles
 */

class TemporalPatternRecognition {
  constructor() {
    this.patterns = [];
    this.correlationMatrix = {};
    this.predictions = [];
    this.confidenceThreshold = 0.60;
    this.minPatternOccurrences = 2;
  }

  recordEvent(event) {
    if (!this.correlationMatrix[event.agentId]) {
      this.correlationMatrix[event.agentId] = { events: [] };
    }
    this.correlationMatrix[event.agentId].events.push({
      cycleNumber: event.cycleNumber,
      eventType: event.eventType,
      severity: event.severity || 0.5
    });
  }

  discoverPattern(sourceAgentId, targetAgentId, maxLag = 5) {
    const source = this.correlationMatrix[sourceAgentId];
    const target = this.correlationMatrix[targetAgentId];
    if (!source || !target) return [];

    const patterns = [];
    const eventPairs = {};

    source.events.forEach(srcEvent => {
      target.events.forEach(tgtEvent => {
        const lag = tgtEvent.cycleNumber - srcEvent.cycleNumber;
        if (lag > 0 && lag <= maxLag) {
          const key = `${srcEvent.eventType}→${tgtEvent.eventType}@lag${lag}`;
          if (!eventPairs[key]) {
            eventPairs[key] = {
              source: srcEvent.eventType,
              target: tgtEvent.eventType,
              lag,
              occurrences: 0,
              avgSeverity: 0
            };
          }
          eventPairs[key].occurrences++;
          eventPairs[key].avgSeverity += srcEvent.severity;
        }
      });
    });

    Object.values(eventPairs).forEach(pair => {
      if (pair.occurrences >= this.minPatternOccurrences) {
        const confidence = Math.min(1.0, pair.occurrences / 3.0);
        if (confidence >= this.confidenceThreshold) {
          patterns.push({
            pattern: `${pair.source}→${pair.target}(lag=${pair.lag})`,
            sourceAgent: sourceAgentId,
            targetAgent: targetAgentId,
            confidence: Math.round(confidence * 100),
            occurrences: pair.occurrences,
            avgSeverity: (pair.avgSeverity / pair.occurrences).toFixed(2)
          });
        }
      }
    });

    return patterns;
  }

  analyzeAllPatterns() {
    const agents = Object.keys(this.correlationMatrix);
    const allPatterns = [];

    for (let i = 0; i < agents.length; i++) {
      for (let j = 0; j < agents.length; j++) {
        if (i !== j) {
          const patterns = this.discoverPattern(agents[i], agents[j]);
          allPatterns.push(...patterns);
        }
      }
    }

    this.patterns = allPatterns.sort((a, b) => b.confidence - a.confidence);
    return this.patterns;
  }

  predictNextCycleEvents(currentCycle, recentEvents) {
    const predictions = [];
    recentEvents.forEach(event => {
      this.patterns.forEach(pattern => {
        if (pattern.pattern.split('→')[0] === event.eventType) {
          const lagMatch = pattern.pattern.match(/lag=(\d+)/);
          if (lagMatch) {
            const lag = parseInt(lagMatch[1]);
            predictions.push({
              predictedCycle: currentCycle + lag,
              predictedEvent: pattern.pattern.split('→')[1].split('(')[0],
              confidence: pattern.confidence + '%',
              basis: pattern.pattern
            });
          }
        }
      });
    });
    this.predictions = predictions;
    return predictions;
  }

  generateReport() {
    return {
      timestamp: new Date(),
      totalPatterns: this.patterns.length,
      patterns: this.patterns.slice(0, 10),
      predictions: this.predictions.slice(0, 5)
    };
  }
}

// Demo
if (require.main === module) {
  console.log('\n🔮 Phase 4.2 Part 2: Temporal Pattern Recognition\n');

  const analyzer = new TemporalPatternRecognition();

  // Simulate events
  const events = [
    { cycle: 1, agent: 'trading-01', type: 'high_volatility_detected', sev: 0.82 },
    { cycle: 3, agent: 'thailand-property-01', type: 'tenant_cancellation_spike', sev: 0.78 },
    { cycle: 4, agent: 'trading-01', type: 'high_volatility_detected', sev: 0.75 },
    { cycle: 6, agent: 'thailand-property-01', type: 'tenant_cancellation_spike', sev: 0.72 },
    { cycle: 7, agent: 'marketing-01', type: 'campaign_launch', sev: 0.88 },
    { cycle: 9, agent: 'risk-01', type: 'traffic_spike_detected', sev: 0.81 }
  ];

  events.forEach(e => analyzer.recordEvent({
    cycleNumber: e.cycle,
    agentId: e.agent,
    eventType: e.type,
    severity: e.sev
  }));

  console.log('📊 Analyzing temporal patterns...');
  const patterns = analyzer.analyzeAllPatterns();
  console.log(`✅ Discovered ${patterns.length} patterns\n`);

  patterns.slice(0, 5).forEach((p, i) => {
    console.log(`${i + 1}. ${p.pattern}`);
    console.log(`   Confidence: ${p.confidence}% | Occurrences: ${p.occurrences}\n`);
  });
}

module.exports = { TemporalPatternRecognition };
EOF

echo "✅ Part 2 created: ~/atlas-phase2/scripts/15_phase42-temporal-patterns.js"
