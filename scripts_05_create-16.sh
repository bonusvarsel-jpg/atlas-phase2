#!/bin/bash
mkdir -p ~/atlas-phase2/scripts

cat > ~/atlas-phase2/scripts/16_railway-backend-phase42.js << 'EOF'
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

echo "✅ Part 3 created: ~/atlas-phase2/scripts/16_railway-backend-phase42.js"
