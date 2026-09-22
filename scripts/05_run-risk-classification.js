#!/usr/bin/env node
const { Anthropic } = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const testEmails = [
  {
    id: "test-fraud",
    from: "verify.account@service-amazon-update.com",
    subject: "Urgent: Confirm your Amazon account immediately",
    body: "Your account has been compromised. Click here within 24 hours or lose access."
  },
  {
    id: "test-legit",
    from: "orders@amazon.com",
    subject: "Your Amazon order has shipped",
    body: "Tracking: TRCK123456. Estimated delivery: September 20, 2026."
  }
];

const testCharges = [
  { id: "charge-suspicious", merchant: "PREMIUM_HOSTING_RU", amount: 3999, desc: "Server rental" },
  { id: "charge-legit", merchant: "Spotify", amount: 299, desc: "Monthly subscription" }
];

async function classifyEmail(email) {
  const msg = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Fraud risk JSON only: {"risk_level": "low|medium|high", "risk_score": 0-10, "recommendation": "allow|review|block"}\n\nFrom: ${email.from}\nSubject: ${email.subject}\nBody: ${email.body}`
    }]
  });
  const m = msg.content[0].text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : { text: msg.content[0].text };
}

async function classifyCharge(c) {
  const msg = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Fraud risk JSON only: {"risk_level": "low|medium|high", "risk_score": 0-10, "recommendation": "allow|review|block"}\n\nMerchant: ${c.merchant}\nAmount: ${c.amount} NOK\nDescription: ${c.desc}`
    }]
  });
  const m = msg.content[0].text.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : { text: msg.content[0].text };
}

async function run() {
  console.log('🧠 ATLAS Risk Classification\n');
  console.log('📧 EMAIL ANALYSIS\n');
  for (const e of testEmails) {
    console.log(`${e.id}:`);
    const r = await classifyEmail(e);
    console.log(JSON.stringify(r, null, 2));
    console.log('');
  }
  console.log('\n💳 CHARGE ANALYSIS\n');
  for (const c of testCharges) {
    console.log(`${c.id}:`);
    const r = await classifyCharge(c);
    console.log(JSON.stringify(r, null, 2));
    console.log('');
  }
}

run().catch(e => console.error('Error:', e.message));
