#!/bin/bash
set -e

echo "🚀 Installing ATLAS Agent Integration on Mac..."

# Create scripts directory
mkdir -p ~/atlas-phase2/scripts

# Agent Library
cat > ~/atlas-phase2/scripts/17_atlas-agents-library.js << 'EOF'
class ThailandPropertyAgent {
  constructor() { this.name = 'ThailandPropertyAgent'; this.capabilities = ['assessment', 'renovation', 'roi', 'compliance', 'legal']; }
  async assess(property) { return { condition: { structural: 8.5, electrical: 7.8, plumbing: 8.2, interior: 8.0, exterior: 7.5 }, score: 8.0, recommendations: ['Electrical rewiring', 'Bathroom upgrade'] }; }
  async calculateROI(property) { return { nightly_rate: 2500, occupancy_rate: 0.70, annual_revenue: 637500, breakeven_months: 24, roi_5year: 156, roi_10year: 312 }; }
  health() { return { status: 'active', last_assessment: new Date().toISOString() }; }
}

class BonusShopMarketingAgent {
  constructor() { this.name = 'BonusShopMarketingAgent'; this.capabilities = ['campaign', 'ab_test', 'conversion', 'roi', 'automation']; }
  async planCampaign(objective) { return { objective, channels: ['email', 'sms', 'push', 'social', 'affiliate', 'search'], budget_allocation: { 'email': 0.25, 'social': 0.35, 'search': 0.25, 'affiliate': 0.10, 'other': 0.05 }, duration_days: 30 }; }
  async generateReport(campaign_id) { return { campaign_id, total_reach: 125000, engagement_rate: 0.042, conversion_rate: 0.031, total_revenue: 12500, total_spend: 4200, roas: 2.98, roi_percent: 197.6 }; }
  health() { return { status: 'active', campaigns_active: 3, last_update: new Date().toISOString() }; }
}

class TradingInvestmentAgent {
  constructor() { this.name = 'TradingInvestmentAgent'; this.capabilities = ['monitoring', 'analysis', 'portfolio', 'rebalance', 'alerts']; }
  async monitorStocks(tickers) { return { positions: tickers.map(t => ({ ticker: t, price: Math.random() * 300 + 50, change_percent: (Math.random() - 0.5) * 10, volume: Math.floor(Math.random() * 5000000) })), timestamp: new Date().toISOString() }; }
  async analyzePortfolio(holdings) { return { total_value: 50000, concentration: 0.35, diversification_hhi: 1850, risk_score: 6.2, sharpe_ratio: 1.8, max_drawdown: 0.12, status: 'needs_rebalancing' }; }
  health() { return { status: 'active', portfolio_value: 50000, last_rebalance: new Date().toISOString() }; }
}

class ATLASMatrixOrchestrator {
  constructor() { this.agents = { thailand_property: new ThailandPropertyAgent(), bonusshop_marketing: new BonusShopMarketingAgent(), trading_investment: new TradingInvestmentAgent() }; this.orchestration_cycle = 0; this.orchestration_log = []; }
  async orchestrate() { this.orchestration_cycle++; const cycle_id = 'cycle_' + this.orchestration_cycle; const start_time = Date.now(); const health_checks = {}; for (const [name, agent] of Object.entries(this.agents)) { health_checks[name] = agent.health(); } const thailand_assessment = await this.agents.thailand_property.assess({}); const marketing_plan = await this.agents.bonusshop_marketing.planCampaign('conversions'); const portfolio_analysis = await this.agents.trading_investment.analyzePortfolio([]); const insights = { property_roi_ready: thailand_assessment.score > 7.5, marketing_converging: marketing_plan.budget_allocation.social > 0.30, portfolio_balanced: portfolio_analysis.concentration < 0.40 }; const cycle_summary = { cycle_id, timestamp: new Date().toISOString(), duration_ms: Date.now() - start_time, health_checks, insights, agents_active: Object.keys(this.agents).length }; this.orchestration_log.push(cycle_summary); return cycle_summary; }
  getStatus() { return { orchestrator: 'ATLAS Matrix', agents: Object.keys(this.agents), orchestration_cycles: this.orchestration_cycle, last_cycle: this.orchestration_log[this.orchestration_log.length - 1] || null }; }
}

module.exports = { ATLASMatrixOrchestrator, ThailandPropertyAgent, BonusShopMarketingAgent, TradingInvestmentAgent };
EOF

echo "✅ Installed: 17_atlas-agents-library.js"

# Deploy Server
cat > ~/atlas-phase2/scripts/19_deploy-agents-to-railway.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { ATLASMatrixOrchestrator } = require('./17_atlas-agents-library.js');

const app = express();
app.use(cors());
app.use(express.json());

const orchestrator = new ATLASMatrixOrchestrator();

app.get('/', (req, res) => { res.json({ service: 'ATLAS Matrix Orchestrator v4.2', agents: ['thailand_property', 'bonusshop_marketing', 'trading_investment'], status: orchestrator.getStatus() }); });
app.get('/health', (req, res) => { res.json({ status: 'ok', service: 'ATLAS-Matrix', timestamp: new Date().toISOString() }); });
app.get('/api/orchestrator/status', (req, res) => { res.json(orchestrator.getStatus()); });
app.post('/api/orchestrator/cycle', async (req, res) => { const result = await orchestrator.orchestrate(); res.json(result); });
app.post('/api/agent/thailand-property/assess', async (req, res) => { const result = await orchestrator.agents.thailand_property.assess(req.body); res.json(result); });
app.post('/api/agent/thailand-property/roi', async (req, res) => { const result = await orchestrator.agents.thailand_property.calculateROI(req.body); res.json(result); });
app.post('/api/agent/marketing/campaign', async (req, res) => { const result = await orchestrator.agents.bonusshop_marketing.planCampaign(req.body.objective || 'conversions'); res.json(result); });
app.post('/api/agent/marketing/report', async (req, res) => { const result = await orchestrator.agents.bonusshop_marketing.generateReport(req.body.campaign_id); res.json(result); });
app.post('/api/agent/trading/monitor', async (req, res) => { const result = await orchestrator.agents.trading_investment.monitorStocks(req.body.tickers || ['AAPL', 'GOOGL']); res.json(result); });
app.post('/api/agent/trading/portfolio', async (req, res) => { const result = await orchestrator.agents.trading_investment.analyzePortfolio(req.body.holdings || []); res.json(result); });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log('✅ ATLAS Matrix Orchestrator v4.2 Online on port ' + PORT); });

module.exports = app;
EOF

echo "✅ Installed: 19_deploy-agents-to-railway.js"
echo ""
echo "✅ Installation complete!"
echo ""
echo "📍 Test agents:"
echo "   cd ~/atlas-phase2/scripts"
echo "   node -e \"const { ATLASMatrixOrchestrator } = require('./17_atlas-agents-library.js'); new ATLASMatrixOrchestrator().orchestrate().then(r => console.log('✅ Cycle:', r.cycle_id, '| Agents:', r.agents_active));\""
echo ""
echo "🚀 Start Express server:"
echo "   cd ~/atlas-phase2/scripts"
echo "   node 19_deploy-agents-to-railway.js"
echo ""

