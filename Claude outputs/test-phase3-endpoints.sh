#!/bin/bash

# ============================================================================
# Test script for ATLAS Phase 3 endpoints
# Tests custom time ranges before deploying to Railway
#
# Usage: bash test-phase3-endpoints.sh
# ============================================================================

echo "🧪 Testing ATLAS Phase 3 Endpoints"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Default 60-minute range (backward compatibility)
echo -e "${BLUE}Test 1: Default 60-minute range (no parameters)${NC}"
curl -s "${BASE_URL}/api/metrics/requests" | jq '.range, (.data | length)'
echo ""

# Test 2: Custom range - last 24 hours
echo -e "${BLUE}Test 2: Custom range - last 24 hours${NC}"
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)
echo "Start: ${START_TIME}"
echo "End: ${END_TIME}"
curl -s "${BASE_URL}/api/metrics/requests?start=${START_TIME}&end=${END_TIME}" | jq '.range, (.data | length)'
echo ""

# Test 3: Custom range - specific dates
echo -e "${BLUE}Test 3: Custom range - week ago to now${NC}"
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)
curl -s "${BASE_URL}/api/metrics/requests?start=${START_TIME}&end=${END_TIME}" | jq '.range, (.data | length)'
echo ""

# Test 4: Metrics summary for 24 hours
echo -e "${BLUE}Test 4: Metrics summary - last 24 hours${NC}"
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)
curl -s "${BASE_URL}/api/metrics/summary?start=${START_TIME}&end=${END_TIME}" | jq '.'
echo ""

# Test 5: Export metrics as CSV (last 7 days)
echo -e "${BLUE}Test 5: Export metrics - last 7 days (CSV)${NC}"
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
START_TIME=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)
echo "Export URL:"
echo "${BASE_URL}/api/metrics/export?start=${START_TIME}&end=${END_TIME}"
echo ""
echo "First 5 lines of CSV export:"
curl -s "${BASE_URL}/api/metrics/export?start=${START_TIME}&end=${END_TIME}" | head -6
echo ""

# Test 6: Error handling - invalid dates
echo -e "${BLUE}Test 6: Error handling - invalid start/end dates${NC}"
curl -s "${BASE_URL}/api/metrics/requests?start=invalid&end=also-invalid" | jq '.'
echo ""

# Test 7: Error handling - start date after end date
echo -e "${BLUE}Test 7: Error handling - start date after end date${NC}"
curl -s "${BASE_URL}/api/metrics/requests?start=2026-09-28T20:00:00Z&end=2026-09-28T10:00:00Z" | jq '.'
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Summary of new endpoints:"
echo "  • GET /api/metrics/requests?start=ISO8601&end=ISO8601  → Metrics timeline"
echo "  • GET /api/metrics/summary?start=ISO8601&end=ISO8601   → Aggregated stats"
echo "  • GET /api/metrics/export?start=ISO8601&end=ISO8601    → CSV download"
