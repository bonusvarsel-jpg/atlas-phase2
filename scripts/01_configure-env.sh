#!/bin/bash

##############################################################################
# ATLAS Phase 2 - Configure Environment
# Add your API credentials and initialize .env
##############################################################################

cd "$(dirname "$0")/.."
ENV_FILE=".env"

cat > "$ENV_FILE" << 'EOF'
# ATLAS Phase 2 Configuration
# Real-time financial risk detection system

# Anthropic API (get from console.anthropic.com/account/keys)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Stripe API (get from dashboard.stripe.com)
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Gmail API (optional - for full email monitoring)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=

# Firebase (optional - Phase 2.2)
FIREBASE_PROJECT_ID=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=

# Make.com (optional - Phase 2.1)
MAKE_WEBHOOK_URL=

# Server Config
NODE_ENV=development
PORT=3000
HOSTNAME=localhost

# Paths
LEDGER_DB=/Users/sunnerehelse/atlas-phase2/data/ledger/atlas.db
LOG_DIR=/Users/sunnerehelse/atlas-phase2/logs

# Features
ENABLE_VOICE=true
ENABLE_SLACK_ALERTS=true
VOICE_LANGUAGE=no-NO
EOF

chmod 600 "$ENV_FILE"

echo "✅ .env created at $ENV_FILE"
echo ""
echo "📝 Update these lines with your actual keys:"
echo "   ANTHROPIC_API_KEY=sk-ant-api03-"
echo "   STRIPE_API_KEY=sk_live_"
echo "   STRIPE_WEBHOOK_SECRET=whsec_"
echo ""
echo "Then run: bash scripts/02_add-credentials.sh"
