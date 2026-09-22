#!/bin/bash

##############################################################################
# ATLAS Phase 2 - Start System
# Initialize database and start API server
# Usage: bash scripts/03_start-system.sh
##############################################################################

cd "$(dirname "$0")/.."

echo "🚀 ATLAS Phase 2 Startup"
echo "========================"
echo ""

# Check .env
if [ ! -f ".env" ]; then
  echo "❌ .env not found"
  echo "Run: bash scripts/01_configure-env.sh"
  exit 1
fi

# Load env
set -a
source .env
set +a

# Validate credentials
if [[ "$ANTHROPIC_API_KEY" == "sk-ant-api03-xxxxx" || -z "$ANTHROPIC_API_KEY" ]]; then
  echo "❌ ANTHROPIC_API_KEY not configured"
  echo "Edit .env and update your credentials"
  exit 1
fi

echo "✅ Configuration loaded"
echo ""

# Check npm dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

echo "✅ Dependencies ready"
echo ""

# Initialize database
echo "📊 Initializing ledger database..."
mkdir -p data/ledger logs

# Create simple init script inline
node << 'INIT_SCRIPT'
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/ledger/atlas.db');

const schema = [
  `CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source TEXT NOT NULL,
    email_id TEXT,
    from_addr TEXT,
    subject TEXT,
    body_snippet TEXT,
    classification TEXT,
    risk_score REAL NOT NULL DEFAULT 0.0,
    claude_analysis TEXT,
    hash TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    evidence_id INTEGER NOT NULL,
    decision TEXT NOT NULL,
    action TEXT,
    confidence REAL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(evidence_id) REFERENCES evidence(id)
  )`,
  `CREATE TABLE IF NOT EXISTS stripe_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type TEXT NOT NULL,
    event_id TEXT UNIQUE,
    charge_id TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS gmail_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_id TEXT UNIQUE,
    from_addr TEXT,
    subject TEXT,
    has_attachment INTEGER DEFAULT 0,
    risk_score REAL DEFAULT 0.0,
    classification TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS make_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    scenario_id TEXT NOT NULL,
    execution_id TEXT UNIQUE,
    status TEXT,
    duration_ms INTEGER,
    data TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS idx_evidence_risk ON evidence(risk_score DESC)',
  'CREATE INDEX IF NOT EXISTS idx_evidence_source ON evidence(source)',
  'CREATE INDEX IF NOT EXISTS idx_evidence_timestamp ON evidence(timestamp DESC)',
  'CREATE INDEX IF NOT EXISTS idx_decisions_action ON decisions(action)',
  'CREATE INDEX IF NOT EXISTS idx_stripe_event_type ON stripe_events(event_type)',
  'CREATE INDEX IF NOT EXISTS idx_gmail_from ON gmail_events(from_addr)',
  'CREATE INDEX IF NOT EXISTS idx_make_scenario ON make_executions(scenario_id)',
];

let completed = 0;
db.serialize(() => {
  schema.forEach((sql) => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Schema error:', err.message);
        process.exit(1);
      }
      completed++;
      if (completed === schema.length) {
        console.log('✅ Database initialized');
        db.close();
      }
    });
  });
});
INIT_SCRIPT

if [ ! -f "data/ledger/atlas.db" ]; then
  echo "❌ Database initialization failed"
  exit 1
fi

echo "✅ Database ready"
echo ""

# Start server
echo "🌐 Starting API server on port $PORT..."
echo ""
node backend/server.js
