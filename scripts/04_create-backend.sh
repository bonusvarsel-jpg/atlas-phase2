#!/bin/bash
# Create backend directory structure and files

cd "$(dirname "$0")/.."
mkdir -p backend/services backend/webhooks

# Create server.js
cat > backend/server.js << 'SERVER_EOF'
#!/usr/bin/env node
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ATLAS online', timestamp: new Date().toISOString() });
});

app.get('/api/brief', async (req, res) => {
  res.json({
    status: 'Morning brief generation not yet implemented',
    phase: 'Phase 2: Core Infrastructure',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ATLAS API running on http://localhost:${PORT}`);
  console.log(`📋 Check health: http://localhost:${PORT}/api/health`);
});

const GmailService = require('./services/gmail.service');
const StripeService = require('./services/stripe.service');
const FirebaseService = require('./services/firebase.service');

const gmailService = process.env.GMAIL_CLIENT_ID ? new GmailService() : null;
const stripeService = process.env.STRIPE_API_KEY ? new StripeService() : null;
const firebaseService = process.env.FIREBASE_PROJECT_ID ? new FirebaseService() : null;

app.get('/api/observations', async (req, res) => {
  const observations = {
    timestamp: new Date().toISOString(),
    gmail: gmailService ? await gmailService.getInboxSnapshot() : { status: 'not_configured' },
    stripe: stripeService ? await stripeService.getSnapshot() : { status: 'not_configured' },
    firebase: firebaseService ? await firebaseService.getSnapshot() : { status: 'not_configured' },
  };

  res.json(observations);
});

const bonusvarselWebhook = require('./webhooks/bonusvarsel.webhook');
const bonusshopWebhook = require('./webhooks/bonusshop.webhook');

app.use('/webhooks/bonusvarsel', bonusvarselWebhook);
app.use('/webhooks/bonusshop', bonusshopWebhook);

app.get('/api/webhooks', (req, res) => {
  res.json({
    webhooks: [
      {
        id: 'bonusvarsel/announce',
        url: 'http://localhost:3000/webhooks/bonusvarsel/announce',
        method: 'POST',
        description: 'Campaign announcements from Make',
      },
      {
        id: 'bonusvarsel/metrics',
        url: 'http://localhost:3000/webhooks/bonusvarsel/metrics',
        method: 'POST',
        description: 'Daily metrics from BonusVarsel',
      },
      {
        id: 'bonusvarsel/alert',
        url: 'http://localhost:3000/webhooks/bonusvarsel/alert',
        method: 'POST',
        description: 'Critical alerts',
      },
      {
        id: 'bonusshop/transaction',
        url: 'http://localhost:3000/webhooks/bonusshop/transaction',
        method: 'POST',
        description: 'Transaction notifications',
      },
      {
        id: 'bonusshop/affiliate',
        url: 'http://localhost:3000/webhooks/bonusshop/affiliate',
        method: 'POST',
        description: 'Affiliate metrics',
      },
      {
        id: 'bonusshop/campaign',
        url: 'http://localhost:3000/webhooks/bonusshop/campaign',
        method: 'POST',
        description: 'Campaign performance',
      },
    ],
  });
});
SERVER_EOF

echo "✅ backend/server.js created"
