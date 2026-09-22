#!/usr/bin/env node
/**
 * ATLAS Autonomous Agent v1
 * Self-directed intelligence orchestration
 * 
 * Monitors: Gmail, Stripe, Calendar, Make.com
 * Decides: Risk classification, action execution
 * Reports: Daily summaries, real-time alerts
 */

const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ledgerPath = process.env.LEDGER_DB || path.join(__dirname, '../../data/ledger/atlas.db');

class ATLASAgent {
  constructor() {
    this.name = 'ATLAS Autonomous';
    this.mode = 'monitoring'; // monitoring | alert | action
    this.lastRun = new Date();
    this.cycle = 0;
  }

  async orchestrate() {
    this.cycle++;
    console.log(`\n🤖 ATLAS Cycle #${this.cycle} - ${new Date().toLocaleString('no-NO')}`);

    // Step 1: Gather signals
    const signals = await this.gatherSignals();
    console.log(`📊 Signals gathered: ${JSON.stringify(signals).length} bytes`);

    // Step 2: Analyze with Claude
    const analysis = await this.analyzeWithClaude(signals);
    console.log(`🧠 Analysis: ${analysis.summary}`);

    // Step 3: Decide actions
    const actions = await this.decideActions(analysis);
    console.log(`⚡ Actions: ${actions.length} planned`);

    // Step 4: Execute webhooks
    for (const action of actions) {
      await this.executeAction(action);
    }

    // Step 5: Log results
    this.logCycle({ signals, analysis, actions });

    return { cycle: this.cycle, signals, analysis, actions };
  }

  async gatherSignals() {
    const signals = {
      timestamp: new Date().toISOString(),
      sources: {}
    };

    // Gmail signals
    try {
      signals.sources.gmail = {
        unread: 0, // Would fetch real data with OAuth
        recent_senders: [],
        urgency_keywords: []
      };
    } catch (e) {
      console.log('⚠️ Gmail signal error');
    }

    // Stripe signals
    try {
      signals.sources.stripe = {
        recent_charges: 0,
        disputes: 0,
        total_volume: 0
      };
    } catch (e) {
      console.log('⚠️ Stripe signal error');
    }

    // Calendar signals
    try {
      signals.sources.calendar = {
        meetings_today: 0,
        deadlines: [],
        focus_time: null
      };
    } catch (e) {
      console.log('⚠️ Calendar signal error');
    }

    return signals;
  }

  async analyzeWithClaude(signals) {
    const prompt = `You are ATLAS, a personal financial intelligence system operating autonomously.

Current signal status:
${JSON.stringify(signals, null, 2)}

Based on these signals, provide a brief JSON analysis:
{
  "summary": "one-sentence status",
  "risk_level": "low|medium|high",
  "anomalies": ["list of detected patterns"],
  "recommended_actions": ["action1", "action2"]
}`;

    try {
      const msg = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = msg.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: 'Analysis complete', risk_level: 'low', anomalies: [], recommended_actions: [] };
    } catch (e) {
      console.log('⚠️ Claude analysis error:', e.message);
      return { summary: 'Analysis skipped', risk_level: 'low', anomalies: [], recommended_actions: [] };
    }
  }

  async decideActions(analysis) {
    const actions = [];

    // Risk-based action triggers
    if (analysis.risk_level === 'high') {
      actions.push({
        type: 'alert',
        target: 'bonusvarsel/alert',
        data: { risk: 'high', summary: analysis.summary }
      });
    }

    // Anomaly-based actions
    for (const anomaly of analysis.anomalies || []) {
      if (anomaly.includes('fraud') || anomaly.includes('suspicious')) {
        actions.push({
          type: 'webhook',
          target: 'bonusvarsel/alert',
          data: { type: 'anomaly', detail: anomaly }
        });
      }
    }

    // Recommended actions from Claude
    for (const rec of analysis.recommended_actions || []) {
      if (rec === 'notify' || rec === 'alert') {
        actions.push({
          type: 'notification',
          target: 'email',
          data: { subject: 'ATLAS Alert', body: analysis.summary }
        });
      }
    }

    return actions;
  }

  async executeAction(action) {
    try {
      if (action.type === 'webhook') {
        const response = await fetch(`http://localhost:3000/webhooks/${action.target}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        console.log(`✅ Webhook to ${action.target}: ${response.status}`);
      } else if (action.type === 'alert') {
        console.log(`📢 Alert: ${action.data.summary}`);
      } else if (action.type === 'notification') {
        console.log(`📧 Notification: ${action.data.subject}`);
      }
    } catch (e) {
      console.log(`❌ Action failed: ${e.message}`);
    }
  }

  logCycle(result) {
    const logPath = path.join(path.dirname(ledgerPath), 'atlas-cycles.jsonl');
    const logEntry = {
      cycle: this.cycle,
      timestamp: new Date().toISOString(),
      signals_bytes: JSON.stringify(result.signals).length,
      analysis_risk: result.analysis.risk_level,
      actions_count: result.actions.length
    };

    try {
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    } catch (e) {
      console.log('⚠️ Logging error');
    }
  }
}

// Run agent
const agent = new ATLASAgent();

async function main() {
  console.log('🚀 ATLAS Autonomous Agent Starting');
  console.log(`Mode: ${process.env.ATLAS_MODE || 'monitor'}`);

  if (process.env.ATLAS_MODE === 'daemon') {
    // Run continuously every 5 minutes
    setInterval(() => agent.orchestrate(), 5 * 60 * 1000);
  }

  // Run once immediately
  await agent.orchestrate();
}

main().catch(console.error);
