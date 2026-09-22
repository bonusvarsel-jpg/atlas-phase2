#!/bin/bash

# ATLAS Phase 4.2 - Complete Mac Installation Guide
# All three components as copy-paste cat-scripts ready for local testing

cat << 'GUIDE'

╔════════════════════════════════════════════════════════════════════════╗
║                   ATLAS PHASE 4.2 - MAC INSTALLATION                  ║
║                      3 Components + Railway Deploy                      ║
╚════════════════════════════════════════════════════════════════════════╝

📋 COMPONENTS:
  1. Self-Optimizing Thresholds (Confusion matrix + auto-adjustment)
  2. Temporal Pattern Recognition (Lag analysis + causality detection)
  3. Express REST Backend (API orchestration + Dashboard UI)

🎯 INSTALLATION STEPS:

═══════════════════════════════════════════════════════════════════════════

STEP 1: Create project directory
────────────────────────────────

mkdir -p ~/atlas-phase42
cd ~/atlas-phase42

═══════════════════════════════════════════════════════════════════════════

STEP 2: Install component 1 - Self-Optimizing Thresholds
──────────────────────────────────────────────────────────

COPY-PASTE INTO TERMINAL (all at once):

cat > 14_phase42-self-optimizing-thresholds.js << 'EOF'
/**
 * ATLAS Phase 4.2 - Self-Optimizing Thresholds
 * Auto-adjusts decision thresholds based on performance metrics
 */

class SelfOptimizingThresholds {
  constructor() {
    this.agents = {};
    this.cycleNumber = 0;
  }

  recordOutcome(agentId, predictedScore, threshold, decision, actualOutcome) {
    if (!this.agents[agentId]) {
      this.agents[agentId] = {
        threshold: threshold || 0.5,
        metrics: { tp: 0, fp: 0, tn: 0, fn: 0 },
        history: []
      };
    }

    const agent = this.agents[agentId];
    const metrics = agent.metrics;

    if (decision && actualOutcome) metrics.tp++;
    if (decision && !actualOutcome) metrics.fp++;
    if (!decision && !actualOutcome) metrics.tn++;
    if (!decision && actualOutcome) metrics.fn++;

    agent.history.push({
      cycle: this.cycleNumber,
      predictedScore,
      decision,
      actualOutcome,
      timestamp: new Date().toISOString()
    });
  }

  calculateMetrics(agentId) {
    if (!this.agents[agentId]) return null;
    const m = this.agents[agentId].metrics;
    const total = m.tp + m.fp + m.tn + m.fn;
    if (total === 0) return { accuracy: 0, precision: 0, recall: 0, falsePositiveRate: 0 };

    return {
      accuracy: (m.tp + m.tn) / total,
      precision: m.tp / (m.tp + m.fp) || 0,
      recall: m.tp / (m.tp + m.fn) || 0,
      falsePositiveRate: m.fp / (m.fp + m.tn) || 0
    };
  }

  optimizeThreshold(agentId, mode = 'balanced') {
    if (!this.agents[agentId]) return null;

    const agent = this.agents[agentId];
    const metrics = this.calculateMetrics(agentId);
    let adjustment = 0;
    const oldThreshold = agent.threshold;

    if (mode === 'conservative') {
      if (metrics.falsePositiveRate > 0.3) adjustment = +0.05;
      if (metrics.precision < 0.7) adjustment = +0.03;
    } else if (mode === 'balanced') {
      if (metrics.precision < 0.6) adjustment = +0.03;
      if (metrics.recall < 0.6) adjustment = -0.03;
      if (metrics.falsePositiveRate > 0.2) adjustment = +0.02;
    } else if (mode === 'aggressive') {
      if (metrics.recall < 0.7) adjustment = -0.05;
      if (metrics.precision > 0.9) adjustment = -0.03;
    }

    agent.threshold = Math.max(0.1, Math.min(0.9, agent.threshold + adjustment));
    return { agentId, oldThreshold, newThreshold: agent.threshold, adjustment };
  }

  optimizeAllAgents(mode = 'balanced') {
    const results = [];
    for (const agentId in this.agents) {
      results.push(this.optimizeThreshold(agentId, mode));
    }
    return results;
  }

  getOptimizationReport() {
    const report = {};
    for (const agentId in this.agents) {
      report[agentId] = {
        currentThreshold: this.agents[agentId].threshold,
        metrics: this.calculateMetrics(agentId),
        outcomesRecorded: this.agents[agentId].history.length
      };
    }
    return report;
  }

  nextCycle() {
    this.cycleNumber++;
  }
}

module.exports = SelfOptimizingThresholds;
EOF

echo "✅ Component 1 installed"
node -e "const SelfOptimizingThresholds = require('./14_phase42-self-optimizing-thresholds.js'); const s = new SelfOptimizingThresholds(); console.log('  Loaded:', s.constructor.name)"

═══════════════════════════════════════════════════════════════════════════

STEP 3: Install component 2 - Temporal Pattern Recognition
───────────────────────────────────────────────────────────

COPY-PASTE INTO TERMINAL (all at once):

cat > 15_phase42-temporal-patterns.js << 'EOF'
/**
 * ATLAS Phase 4.2 - Temporal Pattern Recognition
 * Discovers lag-based event patterns and causality between agents
 */

class TemporalPatternRecognition {
  constructor() {
    this.events = [];
    this.patterns = [];
    this.cycleNumber = 0;
    this.MIN_OCCURRENCES = 2;
    this.MIN_CONFIDENCE = 0.6;
    this.MAX_LAG = 5;
  }

  recordEvent(agentId, eventType, severity) {
    this.events.push({
      cycle: this.cycleNumber,
      agentId,
      eventType,
      severity,
      timestamp: new Date().toISOString()
    });
  }

  discoverPattern(sourceEvent, targetEvent, lag) {
    const occurrences = [];

    for (let i = 0; i < this.events.length; i++) {
      const evt = this.events[i];
      if (evt.eventType === sourceEvent) {
        const future = this.events.find(
          e => e.eventType === targetEvent && e.cycle === evt.cycle + lag
        );
        if (future) occurrences.push({ source: evt, target: future });
      }
    }

    if (occurrences.length < this.MIN_OCCURRENCES) return null;

    const sourceCount = this.events.filter(e => e.eventType === sourceEvent).length;
    const confidence = occurrences.length / sourceCount;

    if (confidence < this.MIN_CONFIDENCE) return null;

    return {
      sourceEvent,
      targetEvent,
      lag,
      occurrences: occurrences.length,
      confidence: Math.round(confidence * 100),
      avgSeverity: Math.round(
        occurrences.reduce((sum, o) => sum + o.source.severity, 0) / occurrences.length * 100
      ) / 100
    };
  }

  analyzeAllPatterns() {
    const discovered = [];
    const eventTypes = [...new Set(this.events.map(e => e.eventType))];

    for (const source of eventTypes) {
      for (const target of eventTypes) {
        if (source === target) continue;
        for (let lag = 1; lag <= this.MAX_LAG; lag++) {
          const pattern = this.discoverPattern(source, target, lag);
          if (pattern) discovered.push(pattern);
        }
      }
    }

    this.patterns = discovered.sort((a, b) => b.confidence - a.confidence);
    return this.patterns;
  }

  predictNextCycleEvents() {
    const predictions = [];
    const lastCycleEvents = this.events.filter(e => e.cycle === this.cycleNumber);

    for (const pattern of this.patterns) {
      for (const evt of lastCycleEvents) {
        if (evt.eventType === pattern.sourceEvent) {
          const predictedCycle = evt.cycle + pattern.lag;
          predictions.push({
            predictedCycle,
            expectedEvent: pattern.targetEvent,
            confidence: pattern.confidence,
            fromEvent: evt.eventType
          });
        }
      }
    }

    return predictions;
  }

  generateReport() {
    return {
      totalEvents: this.events.length,
      totalCycles: this.cycleNumber + 1,
      patternCount: this.patterns.length,
      topPatterns: this.patterns.slice(0, 10),
      predictions: this.predictNextCycleEvents()
    };
  }

  nextCycle() {
    this.cycleNumber++;
  }
}

module.exports = TemporalPatternRecognition;
EOF

echo "✅ Component 2 installed"
node -e "const TemporalPatternRecognition = require('./15_phase42-temporal-patterns.js'); const t = new TemporalPatternRecognition(); console.log('  Loaded:', t.constructor.name)"

═══════════════════════════════════════════════════════════════════════════

STEP 4: Install component 3 - Express Backend
──────────────────────────────────────────────

COPY-PASTE INTO TERMINAL (all at once):

cat > 16_railway-backend-phase42.js << 'EOF'
const express = require('express');
const SelfOptimizingThresholds = require('./14_phase42-self-optimizing-thresholds.js');
const TemporalPatternRecognition = require('./15_phase42-temporal-patterns.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const thresholds = new SelfOptimizingThresholds();
const patterns = new TemporalPatternRecognition();
const cycles = [];
let cycleCounter = 0;

app.post('/api/orchestrate', (req, res) => {
  const { agents, events } = req.body || {};
  const cycle = { id: cycleCounter++, timestamp: new Date().toISOString(), agents: agents || ['risk-01', 'execution-01', 'regime-01'], events: events || [], status: 'completed' };
  cycles.push(cycle);
  thresholds.nextCycle();
  patterns.nextCycle();
  res.json({ success: true, cycle: cycle.id, message: 'Orchestration cycle started', timestamp: cycle.timestamp });
});

app.get('/api/cycles', (req, res) => {
  res.json({ totalCycles: cycles.length, cycles: cycles.map(c => ({ id: c.id, timestamp: c.timestamp, agents: c.agents, eventCount: c.events.length })) });
});

app.get('/api/patterns', (req, res) => {
  res.json({ totalPatterns: patterns.patterns.length, patterns: patterns.patterns });
});

app.post('/api/patterns/event', (req, res) => {
  const { cycleNumber, agentId, eventType, severity } = req.body;
  if (!agentId || !eventType) return res.status(400).json({ error: 'Missing agentId or eventType' });
  patterns.cycleNumber = cycleNumber || patterns.cycleNumber;
  patterns.recordEvent(agentId, eventType, severity || 0.5);
  res.json({ success: true, message: 'Event recorded', eventType, agentId, cycleNumber: patterns.cycleNumber });
});

app.post('/api/patterns/analyze', (req, res) => {
  const discovered = patterns.analyzeAllPatterns();
  res.json({ success: true, message: 'Pattern analysis complete', patternsDiscovered: discovered.length, topPatterns: discovered.slice(0, 10) });
});

app.get('/api/thresholds', (req, res) => {
  const report = thresholds.getOptimizationReport();
  res.json({ totalAgents: Object.keys(report).length, agents: report });
});

app.post('/api/thresholds/:agentId/record', (req, res) => {
  const { agentId } = req.params;
  const { predictedScore, threshold, decision, actualOutcome } = req.body;
  if (predictedScore === undefined || decision === undefined || actualOutcome === undefined) return res.status(400).json({ error: 'Missing required fields' });
  thresholds.recordOutcome(agentId, predictedScore, threshold, decision, actualOutcome);
  res.json({ success: true, message: 'Outcome recorded', agentId, decision, actualOutcome });
});

app.get('/api/status', (req, res) => {
  res.json({ system: 'ATLAS Phase 4.2', status: 'operational', components: { thresholds: { agents: Object.keys(thresholds.agents).length, currentCycle: thresholds.cycleNumber }, patterns: { eventsRecorded: patterns.events.length, patternsDiscovered: patterns.patterns.length, currentCycle: patterns.cycleNumber } }, cycles: { total: cycles.length, lastCycleId: cycleCounter - 1 }, uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ATLAS Phase 4.2' });
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ATLAS Phase 4.2</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f1e;color:#e0e0ff;padding:20px}.container{max-width:1200px;margin:0 auto}h1{color:#00ff88;margin-bottom:30px;text-shadow:0 0 10px rgba(0,255,136,0.3)}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}.card{background:#1a1a2e;border:1px solid #00ff88;border-radius:8px;padding:20px}.card h2{color:#00ff88;font-size:14px;text-transform:uppercase;margin-bottom:10px}.metric{font-size:32px;font-weight:bold;color:#00ff88}.subtext{color:#888;font-size:12px;margin-top:5px}.section{margin-bottom:40px}table{width:100%;border-collapse:collapse;background:#1a1a2e;border:1px solid #00ff88;border-radius:4px;overflow:hidden}th,td{padding:12px;text-align:left;border-bottom:1px solid #333}th{background:#0d0d1a;color:#00ff88;font-weight:600}tr:hover{background:#252542}button{background:#00ff88;color:#0f0f1e;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:600;margin-top:10px}button:hover{background:#00dd6f}.refresh{font-size:12px;color:#888;margin-top:10px}</style></head><body><div class="container"><h1>🚀 ATLAS Phase 4.2 Dashboard</h1><div class="grid"><div class="card"><h2>Total Cycles</h2><div class="metric" id="cycleCount">0</div><div class="subtext">Orchestration cycles</div></div><div class="card"><h2>Agents Tracking</h2><div class="metric" id="agentCount">0</div><div class="subtext">Self-optimizing</div></div><div class="card"><h2>Patterns</h2><div class="metric" id="patternCount">0</div><div class="subtext">Discovered</div></div><div class="card"><h2>Events</h2><div class="metric" id="eventCount">0</div><div class="subtext">Recorded</div></div></div><button onclick="refresh()">🔄 Refresh</button><div class="refresh" id="lastUpdate"></div></div><script>async function refresh(){const[cycles,thresholds,patterns,status]=await Promise.all([fetch('/api/cycles').then(r=>r.json()),fetch('/api/thresholds').then(r=>r.json()),fetch('/api/patterns').then(r=>r.json()),fetch('/api/status').then(r=>r.json())]);document.getElementById('cycleCount').textContent=cycles.totalCycles;document.getElementById('agentCount').textContent=thresholds.totalAgents;document.getElementById('patternCount').textContent=patterns.totalPatterns;document.getElementById('eventCount').textContent=status.components.patterns.eventsRecorded;document.getElementById('lastUpdate').textContent='Updated: '+new Date().toLocaleTimeString()}refresh();setInterval(refresh,10000)</script></body></html>`);
});

app.listen(PORT, () => {
  console.log(`✅ ATLAS Phase 4.2 running on http://localhost:${PORT}`);
  console.log('  Dashboard: http://localhost:' + PORT);
  console.log('  API: http://localhost:' + PORT + '/api/status');
  console.log('  Health: http://localhost:' + PORT + '/health');
});

module.exports = app;
EOF

echo "✅ Component 3 installed"

═══════════════════════════════════════════════════════════════════════════

STEP 5: Create package.json
───────────────────────────

cat > package.json << 'EOF'
{
  "name": "atlas-phase42",
  "version": "4.2.0",
  "description": "ATLAS Phase 4.2: Self-Optimizing Thresholds & Temporal Pattern Recognition",
  "main": "16_railway-backend-phase42.js",
  "scripts": {
    "start": "node 16_railway-backend-phase42.js",
    "dev": "node 16_railway-backend-phase42.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "✅ package.json created"

═══════════════════════════════════════════════════════════════════════════

STEP 6: Install dependencies
────────────────────────────

npm install

═══════════════════════════════════════════════════════════════════════════

STEP 7: Start local server
─────────────────────────

npm start

Then visit: http://localhost:3000

═══════════════════════════════════════════════════════════════════════════

TEST API ENDPOINTS (in new terminal):

# Check health
curl http://localhost:3000/health

# Get status
curl http://localhost:3000/api/status

# Record a decision outcome
curl -X POST http://localhost:3000/api/thresholds/risk-01/record \
  -H "Content-Type: application/json" \
  -d '{
    "predictedScore": 0.92,
    "threshold": 0.5,
    "decision": true,
    "actualOutcome": true
  }'

# Record an event for pattern discovery
curl -X POST http://localhost:3000/api/patterns/event \
  -H "Content-Type: application/json" \
  -d '{
    "cycleNumber": 0,
    "agentId": "risk-01",
    "eventType": "high_volatility_detected",
    "severity": 0.8
  }'

# Analyze patterns
curl -X POST http://localhost:3000/api/patterns/analyze

# Orchestrate a cycle
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"agents": ["risk-01", "execution-01"], "events": []}'

═══════════════════════════════════════════════════════════════════════════

STEP 8: Deploy to Railway
────────────────────────

After local testing works:

npm install -g @railway/cli

railway link              # Select or create Railway project
railway up                # Deploy

View live dashboard: railway open

═══════════════════════════════════════════════════════════════════════════

✅ ALL COMPONENTS READY FOR DEPLOYMENT!

Questions? Check the API endpoints above for more details.

GUIDE
