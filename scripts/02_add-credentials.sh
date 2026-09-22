#!/bin/bash

##############################################################################
# ATLAS Phase 2 - Add Your Credentials
# Replace placeholder values with your actual API keys
# Usage: bash scripts/02_add-credentials.sh
##############################################################################

cd "$(dirname "$0")/.."
ENV_FILE=".env"

# Your actual credentials - REPLACE THESE
ANTHROPIC_KEY="sk-ant-api03-xxxxx"
STRIPE_KEY="sk_live_xxxxx"
STRIPE_SECRET="whsec_xxxxx"

# Validate .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env not found. Run: bash scripts/01_configure-env.sh"
  exit 1
fi

# Update credentials (sed with | delimiter to handle = in values)
sed -i.bak "s|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$ANTHROPIC_KEY|" "$ENV_FILE"
sed -i.bak "s|STRIPE_API_KEY=.*|STRIPE_API_KEY=$STRIPE_KEY|" "$ENV_FILE"
sed -i.bak "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$STRIPE_SECRET|" "$ENV_FILE"

# Clean up backup
rm -f "$ENV_FILE.bak"

echo "✅ Credentials updated in $ENV_FILE"
echo ""
echo "📋 Configuration status:"
grep -E "^(ANTHROPIC_API_KEY|STRIPE_API_KEY|STRIPE_WEBHOOK_SECRET)=" "$ENV_FILE" | sed 's/=.*/=***REDACTED***/g'
echo ""
echo "🚀 Next: bash scripts/03_start-system.sh"
