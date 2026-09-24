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
