# ATLAS MATRIX ORCHESTRATOR - Implementation Guide

## What You've Built

A hierarchical multi-agent system that orchestrates 7 specialized agents to provide real-time financial risk detection:

```
┌─────────────────────────────────────────────────────────┐
│            ATLAS MATRIX (Central Orchestrator)           │
│  Manages contracts, decision-making, human governance   │
└─────────────────────────────────────────────────────────┘
         ↓ Orchestration Loop (9 phases) ↓
┌──────────────────────────────────────────────────────────┐
│ Signal Agent │ Risk Agent │ Quality Agent │ Research Agent│
│ Execution   │ Regime Agent (Policy)  │ Meta-Orchestrator│
└──────────────────────────────────────────────────────────┘
         ↓ Immutable Evidence Ledger ↓
┌──────────────────────────────────────────────────────────┐
│ data/ledger/matrix-cycles.jsonl (SHA256 hashes)         │
└──────────────────────────────────────────────────────────┘
```

## Current Status (Sep 17 2026)

### ✅ Completed
- [x] ATLAS Matrix Orchestrator fully implemented (26KB, 1000+ lines)
- [x] 7 specialized agents with agent contracts
- [x] 9-phase orchestration cycle tested and working
- [x] Immutable ledger with cryptographic integrity
- [x] Escalation queue for human-in-the-loop decisions
- [x] Quality validation layer
- [x] Policy compliance (Regime Agent)
- [x] Pattern investigation (Research Agent)
- [x] Ecosystem health monitoring (Meta-Orchestrator)
- [x] Test cycle passes: 3 signals → 3 decisions → 3 executed

### 📁 Files
```
/root/atlas-system/
├── scripts/
│   ├── 08_atlas-matrix-orchestrator.js   (Main orchestrator)
│   ├── 04_deploy-atlas-matrix.sh          (Deploy to Mac)
│   ├── 09_start-matrix-daemon.sh          (Auto-generated)
│   ├── 03_start-system.sh                 (Start API)
│   └── ... (other setup scripts)
├── backend/
│   ├── server.js                          (Express API on :3000)
│   └── services/
│       ├── signal-agent.js                (Gmail/Stripe signals)
│       ├── risk-agent.js                  (Claude risk analysis)
│       └── ... (other services)
├── data/
│   └── ledger/
│       ├── atlas.db                       (SQLite ledger)
│       └── matrix-cycles.jsonl            (Matrix evidence)
├── frontend/
│   └── dashboard.html                     (Real-time monitoring)
└── logs/
    ├── atlas-daemon.log                   (Autonomous agent)
    └── matrix-daemon.log                  (Matrix daemon - new)
```

## Next Phase: Integration & Deployment

### Phase 1: Deploy to Mac (Today)
```bash
# On Mac:
cd /Users/sunnerehelse/atlas-phase2
bash scripts/04_deploy-atlas-matrix.sh

# Start daemon:
bash scripts/09_start-matrix-daemon.sh

# Monitor:
tail -f logs/matrix-daemon.log
```

### Phase 2: Real Data Integration (Day 2)
1. **Gmail Real Signals**
   - Signal Agent currently returns mock data
   - Connect real Gmail OAuth tokens (GMAIL_REFRESH_TOKEN already in .env)
   - Track actual unread count with risk classification

2. **Stripe Real Charges**
   - Connect real Stripe API key (currently error-tolerant with invalid key)
   - Monitor actual payment events
   - Correlate with Gmail alerts for fraud detection

3. **Calendar Events**
   - Google Calendar integration ready
   - Correlate payment timing with expected events

4. **Make.com Webhooks**
   - 6 webhook endpoints active and listening
   - Matrix will trigger automation scenarios based on decisions

### Phase 3: Claude AI Integration (Day 3)
Currently: Risk classification uses simple heuristics
Next: Use Claude API for intelligent threat analysis

```javascript
// In RiskAgent.analyzeSignals():
const classification = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 200,
  messages: [{
    role: "user",
    content: `Analyze this financial signal for risk:
    Source: ${signal.source}
    Data: ${JSON.stringify(signal.data)}
    Historical context: ${historicalContext}
    
    Return JSON: { risk_score: 0-1, classification: "low|medium|high|critical" }`
  }]
});
```

### Phase 4: Human-in-Loop Governance (Day 4)
1. Dashboard showing escalation queue
2. Approval workflow for critical decisions (risk_score >= 0.8)
3. Audit trail in ledger
4. Admin dashboard to view/approve decisions

### Phase 5: Continuous Learning (Day 5)
1. Track decision accuracy vs actual outcomes
2. Adjust risk thresholds based on false positive rates
3. Generate weekly learning reports
4. Feedback loop to improve classifications

## Decision Tree Logic

```
Risk Classification → Recommended Action

CRITICAL (>= 0.9):
  ├─ risk >= 0.9 → block_charge (ESCALATE - requires approval)
  └─ risk < 0.9 → investigate (ESCALATE - requires approval)

HIGH (0.6-0.9):
  ├─ risk >= 0.8 → alert_user (ESCALATE)
  └─ risk < 0.8 → alert_user (AUTO-EXECUTE)

MEDIUM (0.3-0.6):
  └─ monitor (AUTO-EXECUTE)

LOW (< 0.3):
  └─ monitor (AUTO-EXECUTE)
```

## Immutable Ledger Structure

Every orchestration cycle creates an evidence entry:

```json
{
  "id": "cycle-uuid",
  "timestamp": "2026-09-17T08:50:00.000Z",
  "cycleNumber": 1,
  "agentEcosystem": [
    {"agentId": "signal-01", "name": "Signal Monitor", "role": "signal"},
    {"agentId": "risk-01", "name": "Risk Analyzer", "role": "risk"},
    ...
  ],
  "signalsProcessed": 3,
  "analysesGenerated": 3,
  "decisionsGenerated": 3,
  "escalationsRequested": 0,
  "hash": "sha256(cycle_data)"  ← Integrity verification
}
```

Access: `tail -f data/ledger/matrix-cycles.jsonl`

## Policy Thresholds (Regime Agent)

Configured in RegimeAgent.loadPolicies():

| Setting | Value | Meaning |
|---------|-------|---------|
| maxChargeAmount | $15,000 | Single charge limit |
| dailyChargeLimit | $50,000 | Daily total limit |
| suspiciousPatternsThreshold | 5 | Pattern count to trigger alert |
| autoBlockThreshold | 0.9 | Risk score triggers auto-block |
| requireApprovalThreshold | 0.7 | Risk score requires human review |
| dataRetentionDays | 90 | Evidence ledger retention |

Adjust in `scripts/08_atlas-matrix-orchestrator.js`:
```javascript
// Line ~380 in RegimeAgent.loadPolicies()
this.policies = {
  maxChargeAmount: 15000,      // ← Change here
  dailyChargeLimit: 50000,     // ← Or here
  ...
};
```

## Running the System

### Local Testing (Cloud)
```bash
cd /root/atlas-system
node scripts/08_atlas-matrix-orchestrator.js
```

### Mac Deployment
```bash
# Step 1: Deploy
bash /Users/sunnerehelse/atlas-phase2/scripts/04_deploy-atlas-matrix.sh

# Step 2: Start daemon
bash /Users/sunnerehelse/atlas-phase2/scripts/09_start-matrix-daemon.sh

# Step 3: Monitor
tail -f /Users/sunnerehelse/atlas-phase2/logs/matrix-daemon.log

# Step 4: Check ledger
tail -f /Users/sunnerehelse/atlas-phase2/data/ledger/matrix-cycles.jsonl
```

### Stop Daemon
```bash
kill $(cat /Users/sunnerehelse/atlas-phase2/logs/matrix-daemon.pid)
```

## API Endpoints (Existing)

The Express server provides these endpoints:

```
GET  /api/health          → System health status
GET  /api/observations    → Gmail unread + Stripe recent charges
POST /webhooks/bonusvarsel/announce
POST /webhooks/bonusvarsel/metrics
POST /webhooks/bonusvarsel/alert
POST /webhooks/bonusshop/transaction
POST /webhooks/bonusshop/affiliate
POST /webhooks/bonusshop/campaign
```

## Agent Contracts

Each agent has a contract defining:
- **capabilities**: Actions it can perform
- **escalationThresholds**: Risk scores requiring human approval
- **status**: Current health status

Example (RiskAgent):
```javascript
this.contract = new AgentContract(
  "risk-01",
  "Risk Analyzer",
  "risk",
  capabilities: ["classify_risk", "analyze_pattern", "generate_alert"],
  escalationThresholds: { 
    "classify_risk": 0.7,      // Escalate if risk >= 0.7
    "generate_alert": 0.8      // Escalate if risk >= 0.8
  }
);
```

## Troubleshooting

### Daemon won't start
```bash
# Check if Node.js is installed
node --version

# Check logs
cat /Users/sunnerehelse/atlas-phase2/logs/matrix-daemon.log

# Kill zombie process
pkill -f "08_atlas-matrix-orchestrator"
```

### Ledger file not updating
```bash
# Check permissions
ls -l /Users/sunnerehelse/atlas-phase2/data/ledger/

# Check free space
df -h

# Manual cycle trigger (in Node REPL)
const { ATLASMatrix } = require('./scripts/08_atlas-matrix-orchestrator.js');
const atlas = new ATLASMatrix();
await atlas.orchestrate({ sources: [] });
```

### Escalations stuck in queue
```bash
# Check escalation count
grep -c 'pending_approval' data/ledger/matrix-cycles.jsonl

# Process one escalation
const escalations = atlas.getEscalationQueue();
await atlas.approveDecision(escalations[0].id, 'admin@example.com', true);
```

## What's Next

1. **Today**: Deploy to Mac and run first real cycle
2. **Tomorrow**: Connect real Gmail/Stripe data
3. **Day 3**: Integrate Claude AI for risk analysis
4. **Day 4**: Build governance dashboard for escalations
5. **Day 5**: Set up learning feedback loop

Ready to start? 🚀

```bash
bash /Users/sunnerehelse/atlas-phase2/scripts/04_deploy-atlas-matrix.sh
```
