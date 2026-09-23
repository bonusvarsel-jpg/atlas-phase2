#!/bin/bash

# Add orchestration test endpoint to server.js
SERVER_FILE="$HOME/mnt/atlas-phase2/backend/server.js"

# Create backup
cp "$SERVER_FILE" "${SERVER_FILE}.backup"

# Insert orchestration endpoint before the app.listen line
cat > /tmp/orchestration-endpoint.js << 'EOF'

// Orchestration Test Endpoint
app.post('/api/orchestrate/risk-analysis', async (req, res) => {
  try {
    const { email, subject, amount } = req.body;
    
    if (!email || !subject) {
      return res.status(400).json({ error: 'Missing required fields: email, subject' });
    }
    
    // Call RiskAgent to analyze the data
    const analysis = await riskAgent.analyzeRisk({
      email,
      subject,
      amount: amount || 0,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Orchestration Status Endpoint
app.get('/api/orchestrate/status', (req, res) => {
  res.json({
    status: 'orchestration_ready',
    agents: {
      risk: 'initialized',
      signal: 'initialized',
      gmail: 'initialized',
      stripe: 'initialized'
    },
    timestamp: new Date().toISOString()
  });
});
EOF

# Get line number of app.listen
LISTEN_LINE=$(grep -n "app.listen" "$SERVER_FILE" | cut -d: -f1)

# Extract everything before app.listen
head -n $((LISTEN_LINE - 1)) "$SERVER_FILE" > /tmp/server-new.js

# Append orchestration endpoints
cat /tmp/orchestration-endpoint.js >> /tmp/server-new.js

# Append the remaining part (app.listen)
tail -n +$LISTEN_LINE "$SERVER_FILE" >> /tmp/server-new.js

# Replace original file
mv /tmp/server-new.js "$SERVER_FILE"

echo "✅ Orchestration endpoints added to backend/server.js"
echo ""
echo "New endpoints:"
echo "  POST /api/orchestrate/risk-analysis - Test risk analysis with email/subject/amount"
echo "  GET /api/orchestrate/status - Check orchestration status"
echo ""
echo "Example request:"
echo "  curl -X POST https://atlas-phase2-production.up.railway.app/api/orchestrate/risk-analysis \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\": \"test@example.com\", \"subject\": \"Payment received\", \"amount\": 1000}'"
