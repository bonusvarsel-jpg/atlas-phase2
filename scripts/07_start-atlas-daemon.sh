#!/bin/bash
# Start ATLAS Autonomous Agent as background daemon

set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# Load env
export $(grep -v '^#' .env | xargs)

echo "🚀 Starting ATLAS Autonomous Daemon"
echo "Repository: $REPO_DIR"
echo "Mode: Continuous monitoring (every 5 min)"

# Create logs directory
mkdir -p logs

# Kill any existing instance
pkill -f "06_atlas-autonomous-agent" 2>/dev/null || true
sleep 1

# Start as daemon
ATLAS_MODE=daemon nohup node scripts/06_atlas-autonomous-agent.js > logs/atlas-daemon.log 2>&1 &
AGENT_PID=$!

echo "✅ ATLAS started (PID: $AGENT_PID)"
echo "📋 Log file: logs/atlas-daemon.log"
echo ""
echo "Monitor with: tail -f logs/atlas-daemon.log"
echo "Stop with:   pkill -f '06_atlas-autonomous-agent'"

# Save PID
echo $AGENT_PID > .atlas-daemon.pid
