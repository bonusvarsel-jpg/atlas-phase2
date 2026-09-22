#!/bin/bash
# ATLAS Phase 2 - Setup Backend Files on Mac
# Usage: bash setup-backend.sh

cd ~/atlas-phase2
mkdir -p backend/services backend/webhooks
echo "✅ Directories created"

# Create each file
echo "📝 Creating backend/server.js..."
cat > backend/server.js << 'SERVER_EOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const RiskAgent = require('./services/risk-agent');
const SignalAgent = require('./services/signal-agent');
const GmailService = require('./services/gmail.service');
const StripeService = require('./services/stripe.service');
const FirebaseService = require('./services/firebase.service');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

const riskAgent = new RiskAgent();
const signalAgent = new SignalAgent();
const gmailService = new GmailService();
const stripeService = new StripeService();
const firebaseService = process.env.FIREBASE_PROJECT_ID ? new FirebaseService() : null;

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), port: PORT });
});

app.get('/api/observations', async (req, res) => {
  try {
    const gmail = await gmailService.getUnreadCount();
    const stripe = await stripeService.getRecentCharges();
    res.json({ gmail_unread: gmail, stripe_recent: stripe, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/webhooks', (req, res) => {
  res.json({ endpoints: ['POST /webhooks/bonusvarsel/announce', 'POST /webhooks/bonusvarsel/metrics', 'POST /webhooks/bonusvarsel/alert', 'POST /webhooks/bonusshop/transaction', 'POST /webhooks/bonusshop/affiliate', 'POST /webhooks/bonusshop/campaign'] });
});

const bonusvarselWebhook = require('./webhooks/bonusvarsel.webhook');
const bonusshopWebhook = require('./webhooks/bonusshop.webhook');

app.post('/webhooks/bonusvarsel/announce', bonusvarselWebhook.announce);
app.post('/webhooks/bonusvarsel/metrics', bonusvarselWebhook.metrics);
app.post('/webhooks/bonusvarsel/alert', bonusvarselWebhook.alert);
app.post('/webhooks/bonusshop/transaction', bonusshopWebhook.transaction);
app.post('/webhooks/bonusshop/affiliate', bonusshopWebhook.affiliate);
app.post('/webhooks/bonusshop/campaign', bonusshopWebhook.campaign);

app.listen(PORT, () => { console.log(`🌐 ATLAS API running on http://localhost:${PORT}`); });
SERVER_EOF
echo "✅ backend/server.js"

echo "📝 Creating backend/services/risk-agent.js..."
cat > backend/services/risk-agent.js << 'RISK_EOF'
const { Anthropic } = require('@anthropic-ai/sdk');
class RiskAgent {
  constructor() { this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
  async classifyEmailRisk(email) {
    try {
      const prompt = `Analyze this email for financial risk. Email: From: ${email.from_addr}, Subject: ${email.subject}, Body: ${email.body_snippet}. Respond with JSON: {classification: "safe"|"suspicious"|"high_risk", risk_score: 0.0-1.0, reasoning: "..."}`;
      const message = await this.client.messages.create({ model: 'claude-3-5-haiku-20241022', max_tokens: 500, messages: [{ role: 'user', content: prompt }] });
      const content = message.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { return JSON.parse(jsonMatch[0]); }
      return { classification: 'safe', risk_score: 0.0, reasoning: 'Unable to parse response' };
    } catch (error) {
      console.error('Risk classification error:', error.message);
      return { classification: 'safe', risk_score: 0.0, reasoning: error.message };
    }
  }
  async classifyChargeRisk(charge) {
    try {
      const prompt = `Analyze this charge for financial risk. Amount: $${charge.amount}, Merchant: ${charge.merchant}, Description: ${charge.description}. Respond with JSON: {classification: "safe"|"suspicious"|"high_risk", risk_score: 0.0-1.0, reasoning: "..."}`;
      const message = await this.client.messages.create({ model: 'claude-3-5-haiku-20241022', max_tokens: 500, messages: [{ role: 'user', content: prompt }] });
      const content = message.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { return JSON.parse(jsonMatch[0]); }
      return { classification: 'safe', risk_score: 0.0, reasoning: 'Unable to parse response' };
    } catch (error) {
      console.error('Charge classification error:', error.message);
      return { classification: 'safe', risk_score: 0.0, reasoning: error.message };
    }
  }
}
module.exports = RiskAgent;
RISK_EOF
echo "✅ backend/services/risk-agent.js"

echo "📝 Creating backend/services/signal-agent.js..."
cat > backend/services/signal-agent.js << 'SIGNAL_EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
class SignalAgent {
  constructor() {
    const dbPath = process.env.LEDGER_DB || path.join(__dirname, '../../data/ledger/atlas.db');
    this.db = new sqlite3.Database(dbPath);
  }
  async fetchGmailSignals() { return new Promise((resolve) => { this.db.all('SELECT * FROM gmail_events LIMIT 10', (err, rows) => { resolve(rows || []); }); }); }
  async fetchStripeSignals() { return new Promise((resolve) => { this.db.all('SELECT * FROM stripe_events LIMIT 10', (err, rows) => { resolve(rows || []); }); }); }
  async storeEmailEvidence(email, classification) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256').update(email.from_addr + email.subject + new Date().toISOString()).digest('hex');
      const sql = `INSERT INTO evidence (source, email_id, from_addr, subject, body_snippet, classification, risk_score, claude_analysis, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      this.db.run(sql, ['gmail', email.email_id || '', email.from_addr, email.subject, email.body_snippet, classification.classification, classification.risk_score, JSON.stringify(classification), hash], function(err) { if (err) reject(err); else resolve(this.lastID); });
    });
  }
  async storeChargeEvidence(charge, classification) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256').update(charge.merchant + charge.amount + new Date().toISOString()).digest('hex');
      const sql = `INSERT INTO evidence (source, from_addr, subject, classification, risk_score, claude_analysis, hash) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      this.db.run(sql, ['stripe', charge.merchant, charge.description, classification.classification, classification.risk_score, JSON.stringify(classification), hash], function(err) { if (err) reject(err); else resolve(this.lastID); });
    });
  }
  close() { this.db.close(); }
}
module.exports = SignalAgent;
SIGNAL_EOF
echo "✅ backend/services/signal-agent.js"

echo "📝 Creating backend/services/gmail.service.js..."
cat > backend/services/gmail.service.js << 'GMAIL_EOF'
class GmailService {
  constructor() { this.configured = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN); }
  async getUnreadCount() { if (!this.configured) return 0; return 0; }
  async getUrgentEmails() { if (!this.configured) return []; return []; }
}
module.exports = GmailService;
GMAIL_EOF
echo "✅ backend/services/gmail.service.js"

echo "📝 Creating backend/services/stripe.service.js..."
cat > backend/services/stripe.service.js << 'STRIPE_EOF'
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
class StripeService {
  constructor() { this.configured = !!process.env.STRIPE_API_KEY; }
  async getRecentCharges() { if (!this.configured) return []; try { const charges = await stripe.charges.list({ limit: 10 }); return charges.data || []; } catch (error) { console.error('Stripe API error:', error.message); return []; } }
  async getDisputes() { if (!this.configured) return []; try { const disputes = await stripe.disputes.list({ limit: 10 }); return disputes.data || []; } catch (error) { console.error('Stripe API error:', error.message); return []; } }
}
module.exports = StripeService;
STRIPE_EOF
echo "✅ backend/services/stripe.service.js"

echo "📝 Creating backend/services/firebase.service.js..."
cat > backend/services/firebase.service.js << 'FIREBASE_EOF'
class FirebaseService {
  constructor() { this.configured = !!process.env.FIREBASE_PROJECT_ID; }
  async syncObservations(observations) { if (!this.configured) return false; console.log('Firebase sync would happen here'); return true; }
}
module.exports = FirebaseService;
FIREBASE_EOF
echo "✅ backend/services/firebase.service.js"

echo "📝 Creating backend/webhooks/bonusvarsel.webhook.js..."
cat > backend/webhooks/bonusvarsel.webhook.js << 'BONUS_EOF'
module.exports = {
  announce: (req, res) => { console.log('BonusVarsel announce:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  metrics: (req, res) => { console.log('BonusVarsel metrics:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  alert: (req, res) => { console.log('BonusVarsel alert:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); }
};
BONUS_EOF
echo "✅ backend/webhooks/bonusvarsel.webhook.js"

echo "📝 Creating backend/webhooks/bonusshop.webhook.js..."
cat > backend/webhooks/bonusshop.webhook.js << 'SHOP_EOF'
module.exports = {
  transaction: (req, res) => { console.log('BonusShop transaction:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  affiliate: (req, res) => { console.log('BonusShop affiliate:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); },
  campaign: (req, res) => { console.log('BonusShop campaign:', req.body); res.json({ status: 'received', timestamp: new Date().toISOString() }); }
};
SHOP_EOF
echo "✅ backend/webhooks/bonusshop.webhook.js"

echo ""
echo "✅✅✅ All backend files created!"
echo ""
echo "📋 Next:"
echo "  npm install --legacy-peer-deps"
echo "  bash scripts/03_start-system.sh"
