#!/bin/bash
# Test Claude-powered risk classification on sample emails and charges

echo "🧠 Testing ATLAS Risk Detection (Claude Classification)"
echo "=========================================="

# Check if API is running
if ! curl -s http://localhost:3000/api/health | jq -e '.status' > /dev/null 2>&1; then
  echo "❌ API not running on port 3000. Start with: node ~/mnt/atlas-phase2/backend/server.js"
  exit 1
fi

echo "✅ API health check passed"

# Test 1: Sample fraud email classification
echo -e "\n📨 Test 1: Fraud Detection Email"
TEST1=$(cat <<'JSON'
{
  "email_id": "test-001",
  "from_addr": "verify.account@service-amazon-update.com",
  "subject": "Urgent: Confirm your Amazon account immediately",
  "body_snippet": "Your account has been compromised. Click here to verify your identity within 24 hours or lose access."
}
JSON
)
echo "$TEST1" | jq .

# Test 2: Legitimate email
echo -e "\n📨 Test 2: Legitimate Email"
TEST2=$(cat <<'JSON'
{
  "email_id": "test-002",
  "from_addr": "orders@amazon.com",
  "subject": "Your Amazon order #123-456-789 has shipped",
  "body_snippet": "Tracking number: TRCK123456. Estimated delivery: September 20, 2026."
}
JSON
)
echo "$TEST2" | jq .

# Test 3: Suspicious charge pattern
echo -e "\n💳 Test 3: Suspicious Charge Pattern"
TEST3=$(cat <<'JSON'
{
  "charge_id": "ch_test_003",
  "amount": 3999,
  "currency": "NOK",
  "merchant": "PREMIUM_HOSTING_RU",
  "description": "Server rental - 1 year",
  "timestamp": "2026-09-17T08:00:00Z"
}
JSON
)
echo "$TEST3" | jq .

# Test 4: Legitimate charge
echo -e "\n💳 Test 4: Legitimate Charge"
TEST4=$(cat <<'JSON'
{
  "charge_id": "ch_test_004",
  "amount": 299,
  "currency": "NOK",
  "merchant": "Spotify",
  "description": "Monthly subscription",
  "timestamp": "2026-09-17T08:05:00Z"
}
JSON
)
echo "$TEST4" | jq .

echo -e "\n✅ Test samples prepared. Ready for risk-agent processing."
echo "📌 Webhook endpoint test: curl -X POST http://localhost:3000/webhooks/bonusvarsel/alert -H 'Content-Type: application/json' -d '{\"risk\":\"fraud\",\"score\":9}'"
