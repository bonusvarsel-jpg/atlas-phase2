#!/bin/bash

# ATLAS Phase 4.3 - Risk Analysis API Test
# Test against Railway deployment

API_URL="https://atlas-phase42-production.up.railway.app"

echo "🔍 Testing ATLAS Phase 4.3 API"
echo "URL: $API_URL"
echo "---"

# Test 1: Health check
echo "1️⃣  Health Check"
curl -s "$API_URL/health" -w "\nHTTP: %{http_code}\n" | head -10
echo ""

# Test 2: Risk Analysis - High Risk
echo "2️⃣  Risk Analysis - High Risk Email"
curl -s -X POST "$API_URL/api/orchestrate/risk-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attacker@phishing.com",
    "subject": "Urgent: Verify your account NOW or lose access!",
    "amount": 5000
  }' -w "\nHTTP: %{http_code}\n" | jq . 2>/dev/null || cat

echo ""

# Test 3: Risk Analysis - Low Risk
echo "3️⃣  Risk Analysis - Normal Email"
curl -s -X POST "$API_URL/api/orchestrate/risk-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@company.com",
    "subject": "Your monthly statement is ready",
    "amount": 100
  }' -w "\nHTTP: %{http_code}\n" | jq . 2>/dev/null || cat

echo ""
echo "✅ Test complete"
