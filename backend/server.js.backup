// Polyfill fetch for Node 16 compatibility (Anthropic SDK requires globalThis.fetch)
if (!globalThis.fetch) {
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

const express = require('express');
const cors = require('cors');
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
let signalAgent; try { signalAgent = new SignalAgent(); } catch(e) { console.log("⚠️ SignalAgent init skipped"); }
const gmailService = new GmailService();
const stripeService = new StripeService();
const firebaseService = process.env.FIREBASE_PROJECT_ID ? new FirebaseService() : null;

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), port: PORT });
});

app.get('/api/observations', async (req, res) => {
  try {
    const gmail = await gmailService.getUnreadCount();
    
    // Stripe with timeout
    let stripe = [];
    try {
      stripe = await Promise.race([
        stripeService.getRecentCharges(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
    } catch (e) {
      // Skip silently
    }
    
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

// OAuth callback
app.get('/oauth/callback', (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: 'No authorization code' });
  console.log('OAuth code received:', code.substring(0, 20) + '...');
  res.json({ status: 'code_received', code: code.substring(0, 50) });
});

app.listen(PORT, () => {
  console.log(`🌐 ATLAS API running on http://localhost:${PORT}`);
});
