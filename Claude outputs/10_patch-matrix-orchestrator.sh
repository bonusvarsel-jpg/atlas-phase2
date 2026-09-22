#!/bin/bash

# Patch 08_atlas-matrix-orchestrator.js with agent integration
# IMPORTANT: Back up the original first!
# Usage: bash 10_patch-matrix-orchestrator.sh

FILE="/Users/sunnerehelse/atlas-phase2/scripts/08_atlas-matrix-orchestrator.js"

if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# Backup original
cp "$FILE" "${FILE}.backup.$(date +%s)"
echo "✅ Backup created: ${FILE}.backup.*"

echo "📝 Patching $FILE with Phase 7 & 8 integration..."

# Create a temporary patch file with proper node.js handling
cat > /tmp/matrix-patch.js << 'PATCHJS_EOF'
const fs = require('fs');

const filePath = '/Users/sunnerehelse/atlas-phase2/scripts/08_atlas-matrix-orchestrator.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports after existing requires
const importInsertion = `const { ThailandPropertyAgent } = require('../backend/services/thailand-property-agent.js');
const { BonusShopMarketingAgent } = require('../backend/services/bonusshop-marketing-agent.js');
const { TradingInvestmentAgent } = require('../backend/services/trading-investment-agent.js');`;

if (!content.includes('ThailandPropertyAgent')) {
  const lastRequire = content.lastIndexOf("const {");
  const nextLine = content.indexOf('\n', lastRequire);
  content = content.slice(0, nextLine + 1) + '\n' + importInsertion + '\n' + content.slice(nextLine + 1);
  console.log('✅ Added imports');
}

// 2. Add agent instantiation in constructor
const agentInstantiation = `'thailand-property-01': new ThailandPropertyAgent(),
      'marketing-01': new BonusShopMarketingAgent(),
      'trading-01': new TradingInvestmentAgent()`;

if (!content.includes('thailand-property-01')) {
  const metaIdx = content.indexOf("'meta-01': this.metaOrchestratorAgent");
  if (metaIdx > -1) {
    const nextComma = content.indexOf(',', metaIdx);
    content = content.slice(0, nextComma + 1) + '\n      \n      // NEW SPECIALIZED AGENTS\n      ' + agentInstantiation + content.slice(nextComma + 1);
    console.log('✅ Added agent instantiation');
  }
}

// 3. Add Phase 7 & 8 calls in orchestrate method
const phase7Phase8 = `
    // PHASE 7: SPECIALIZED AGENTS ANALYSIS
    cycle.phases.specializedAgents = await this.runSpecializedAgentPhase();

    // PHASE 8: CROSS-AGENT CORRELATION
    cycle.phases.crossAgentCorrelation = await this.correlateSpecializedAgents(cycle);`;

if (!content.includes('runSpecializedAgentPhase')) {
  const phase6Idx = content.indexOf('// PHASE 6:');
  if (phase6Idx > -1) {
    const endPhase6 = content.indexOf('cycle.phases.decision =', phase6Idx);
    const afterPhase6 = content.indexOf(';', endPhase6) + 1;
    const afterPhase6Line = content.indexOf('\n', afterPhase6);
    content = content.slice(0, afterPhase6Line) + phase7Phase8 + content.slice(afterPhase6Line);
    console.log('✅ Added Phase 7 & 8 calls');
  }
}

// 4. Add method implementations at end of class (before closing brace)
const methods = `

  // PHASE 7: SPECIALIZED AGENTS ANALYSIS
  async runSpecializedAgentPhase() {
    const results = {
      timestamp: new Date(),
      agents: {}
    };

    if (this.agents['thailand-property-01']) {
      const propertySignals = this.signals.filter(s => s.source === 'property-broker');
      if (propertySignals.length > 0) {
        results.agents.thailand_property = {
          status: 'active',
          roiAnalyses: await Promise.all(
            propertySignals.map(signal =>
              this.agents['thailand-property-01'].calculateRentalROI(signal.data, { total: 1500000 })
            )
          )
        };
      } else {
        results.agents.thailand_property = { status: 'idle' };
      }
    }

    if (this.agents['marketing-01']) {
      const marketingSignals = this.signals.filter(s => s.source === 'make.com');
      if (marketingSignals.length > 0) {
        results.agents.bonusshop_marketing = {
          status: 'active',
          performanceReport: await this.agents['marketing-01'].generatePerformanceReport(30)
        };
      } else {
        results.agents.bonusshop_marketing = { status: 'idle' };
      }
    }

    if (this.agents['trading-01']) {
      const tradingSignals = this.signals.filter(s => s.source === 'market-data');
      if (tradingSignals.length > 0) {
        results.agents.trading_investment = {
          status: 'active',
          portfolioAnalysis: await this.agents['trading-01'].analyzePortfolio()
        };
      } else {
        results.agents.trading_investment = { status: 'idle' };
      }
    }

    return results;
  }

  // PHASE 8: CROSS-AGENT CORRELATION
  async correlateSpecializedAgents(cycle) {
    const correlation = {
      timestamp: new Date(),
      insights: [],
      triggers: []
    };

    // Property deals → Investment financing
    if (cycle.phases.specializedAgents?.agents?.thailand_property?.status === 'active') {
      const roiAnalyses = cycle.phases.specializedAgents.agents.thailand_property.roiAnalyses || [];
      const strongDeals = roiAnalyses.filter(roi => roi.roi5Year > 150);
      if (strongDeals.length > 0) {
        correlation.insights.push({
          type: 'PROPERTY_INVESTMENT_OPPORTUNITY',
          deals: strongDeals.length,
          recommendation: 'High-ROI properties available - financing opportunity'
        });
      }
    }

    // Marketing ROI → Reinvestment
    if (cycle.phases.specializedAgents?.agents?.bonusshop_marketing?.status === 'active') {
      const perfReport = cycle.phases.specializedAgents.agents.bonusshop_marketing.performanceReport;
      if (perfReport?.campaignSummary?.roas >= 3) {
        correlation.insights.push({
          type: 'REVENUE_REINVESTMENT',
          recommendation: 'High marketing ROI - reinvest surplus into dividend stocks'
        });
      }
    }

    return correlation;
  }`;

if (!content.includes('runSpecializedAgentPhase()')) {
  const lastBrace = content.lastIndexOf('}');
  content = content.slice(0, lastBrace) + methods + '\n}\n';
  console.log('✅ Added Phase 7 & 8 methods');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File patched successfully');
console.log('');
console.log('Next steps:');
console.log('1. Verify changes:');
console.log('   grep -n "ThailandPropertyAgent" ' + filePath);
console.log('2. Test the integration:');
console.log('   node ' + filePath);
console.log('3. Start the daemon:');
console.log('   bash scripts/09_start-matrix-daemon.sh');

PATCHJS_EOF

# Run the patch
node /tmp/matrix-patch.js

# Cleanup
rm /tmp/matrix-patch.js

echo ""
echo "✅ Patching complete!"

