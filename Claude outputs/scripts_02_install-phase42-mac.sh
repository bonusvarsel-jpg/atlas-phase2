#!/bin/bash

# ATLAS Phase 4.2 Installation for Mac
# Creates Phase 4.2 files in ~/atlas-phase2/scripts/
# Usage: bash scripts_02_install-phase42-mac.sh

set -e

DEST_DIR="$HOME/atlas-phase2/scripts"
mkdir -p "$DEST_DIR"

echo "📦 Installing Phase 4.2 to $DEST_DIR..."
echo ""

# ============================================================
# 14_phase42-self-optimizing-thresholds.js
# ============================================================
cat > "$DEST_DIR/14_phase42-self-optimizing-thresholds.js" << 'EOF'
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
EOF

echo "✅ 14_phase42-self-optimizing-thresholds.js"

# ============================================================
# 15_phase42-temporal-patterns.js
# ============================================================
cat > "$DEST_DIR/15_phase42-temporal-patterns.js" << 'EOF'
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

echo "✅ 15_phase42-temporal-patterns.js"

# ============================================================
# 16_railway-backend-phase42.js
# ============================================================
cat > "$DEST_DIR/16_railway-backend-phase42.js" << 'EOF'
#!/usr/bin/env node

const express = require('express');
const crypto = require('crypto');

const { SelfOptimizingThresholds } = require('./14_phase42-self-optimizing-thresholds');
const { TemporalPatternRecognition } = require('./15_phase42-temporal-patterns');

const app = express();
app.use(express.json());

let cycles = [];
const thresholds = new SelfOptimizingThresholds();
const patterns = new TemporalPatternRecognition();

app.post('/api/orchestrate', (req, res) => {
  try {
    const cycleId = `cycle-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const optimization = thresholds.optimizeAllAgents('balanced');
    const discoveredPatterns = patterns.analyzeAllPatterns();

    const cycle = {
      id: cycleId,
      cycleNumber: cycles.length,
      timestamp: new Date(),
      phases: {
        phase8: { patterns: discoveredPatterns.slice(0, 5), count: discoveredPatterns.length },
        phase9: { optimization }
      }
    };

    cycles.push(cycle);
    res.json({ success: true, cycle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/cycles', (req, res) => {
  res.json({ total: cycles.length, cycles: cycles.slice(-10).reverse() });
});

app.get('/api/patterns', (req, res) => {
  res.json({ total: patterns.patterns.length, patterns: patterns.patterns.slice(0, 10) });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '4.2',
    cycles: cycles.length,
    patterns: patterns.patterns.length,
    agents: Object.keys(thresholds.agents).length
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head><title>ATLAS 4.2</title>
<style>body{font-family:sans-serif;margin:40px;background:#0a0e27;color:#fff}
.card{background:#1a1f3a;padding:20px;margin:10px 0;border-radius:8px}
h1{color:#00ff00}button{background:#00ff00;color:#000;border:none;padding:10px 20px;cursor:pointer}</style>
</head>
<body>
<h1>🤖 ATLAS Phase 4.2</h1>
<div class="card">
<h2>Status: <span id="status">Loading...</span></h2>
<button onclick="runCycle()">Run Cycle</button>
<button onclick="refresh()">Refresh</button>
</div>
<div class="card" id="info"></div>
<script>
async function refresh() {
  const r = await fetch('/api/status').then(x=>x.json());
  document.getElementById('status').textContent = r.status;
  document.getElementById('info').innerHTML = 'Cycles: '+r.cycles+'<br>Patterns: '+r.patterns+'<br>Agents: '+r.agents;
}
async function runCycle() { await fetch('/api/orchestrate',{method:'POST'}); refresh(); }
refresh();
</script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ATLAS Phase 4.2 running on :${PORT}`);
});

module.exports = app;
EOF

echo "✅ 16_railway-backend-phase42.js"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Phase 4.2 Installed"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📍 Location: $DEST_DIR"
echo ""
echo "🧪 Test locally:"
echo "   cd $DEST_DIR"
echo "   node 14_phase42-self-optimizing-thresholds.js"
echo "   node 15_phase42-temporal-patterns.js"
echo ""
echo "🚀 Backend (requires Express):"
echo "   npm install express --break-system-packages"
echo "   node 16_railway-backend-phase42.js"
echo ""
echo "✨ Ready for Railway deployment"
echo ""
