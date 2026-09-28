#!/bin/bash

# ATLAS Phase 4.3 Analytics Dashboard - Deployment Script
# This script deploys the dashboard to your local atlas-phase42 repository
# and prepares it for Railway deployment

set -e  # Exit on error

echo "🚀 ATLAS Phase 4.3 Dashboard Deployment"
echo "========================================"
echo ""

# Configuration
REPO_PATH="${1:-.}"
DASHBOARD_FILE="atlas-phase43-dashboard.html"
TARGET_DIR="$REPO_PATH/public/dashboard"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if atlas-phase42 repository exists
if [ ! -d "$REPO_PATH" ]; then
    echo "❌ Repository directory not found: $REPO_PATH"
    echo ""
    echo "📝 Usage:"
    echo "   bash deploy-dashboard.sh /path/to/atlas-phase42"
    echo ""
    echo "Example:"
    echo "   bash deploy-dashboard.sh ~/atlas-phase42"
    exit 1
fi

# Check if this is the correct repository
if [ ! -f "$REPO_PATH/package.json" ]; then
    echo "❌ package.json not found in $REPO_PATH"
    echo "   Make sure this is the atlas-phase42 repository"
    exit 1
fi

echo -e "${BLUE}Step 1: Setting up directory structure${NC}"
mkdir -p "$TARGET_DIR"
echo "✅ Created $TARGET_DIR"
echo ""

# Check if dashboard file exists in current directory
if [ ! -f "$DASHBOARD_FILE" ]; then
    echo "❌ $DASHBOARD_FILE not found in current directory"
    echo ""
    echo "Please run this script from the directory containing $DASHBOARD_FILE"
    echo "Example: bash deploy-dashboard.sh ~/atlas-phase42"
    exit 1
fi

echo -e "${BLUE}Step 2: Copying dashboard to public directory${NC}"
cp "$DASHBOARD_FILE" "$TARGET_DIR/index.html"
echo "✅ Copied dashboard to $TARGET_DIR/index.html"
echo ""

echo -e "${BLUE}Step 3: Checking git status${NC}"
cd "$REPO_PATH"
git status
echo ""

echo -e "${BLUE}Step 4: Adding dashboard to git${NC}"
git add public/dashboard/
echo "✅ Staged dashboard for commit"
echo ""

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "⚠️  No changes to commit"
else
    echo -e "${BLUE}Step 5: Committing changes${NC}"
    git commit -m "feat: add Phase 4.3 Analytics Dashboard - agent orchestration metrics"
    echo "✅ Committed to git"
    echo ""

    echo -e "${YELLOW}Step 6: Ready to push to GitHub${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub:"
    echo "   git push origin main"
    echo ""
    echo "2. Railway will auto-deploy (wait 2-5 minutes)"
    echo ""
    echo "3. Test the dashboard:"
    echo "   Option A: https://fulfilling-charm-production-b137.up.railway.app/dashboard"
    echo "   Option B: https://atlas.bonusvarsel.no/dashboard"
    echo ""
    echo "Would you like to push now? (y/n)"
    read -r PUSH_NOW

    if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
        git push origin main
        echo "✅ Pushed to GitHub"
        echo ""
        echo -e "${GREEN}🎉 Dashboard deployed to GitHub!${NC}"
        echo "   Railway will auto-deploy in 2-5 minutes"
        echo ""
        echo "Monitor deployment at:"
        echo "   https://railway.app/dashboard → fulfilling-charm project"
    else
        echo "⏭️  Skipped push. Run 'git push origin main' when ready"
    fi
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Configuration checklist:"
echo "   ☐ Dashboard copied to public/dashboard/index.html"
echo "   ☐ Changes committed to git"
echo "   ☐ Changes pushed to GitHub"
echo "   ☐ Railway deployment in progress (wait 2-5 min)"
echo "   ☐ Test dashboard at /dashboard endpoint"
echo ""
echo "For full deployment guide, see: DEPLOYMENT-GUIDE-PHASE43.md"
