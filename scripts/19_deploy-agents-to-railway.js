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
