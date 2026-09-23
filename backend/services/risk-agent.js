const { Anthropic } = require('@anthropic-ai/sdk');
class RiskAgent {
  constructor() { this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); }
  
  async analyzeRisk(data) {
    try {
      const { email, subject, amount, timestamp } = data;
      const prompt = `Analyze this potential financial risk event:
Email: ${email}
Subject: ${subject}
Amount: $${amount || 0}
Timestamp: ${timestamp}

Provide JSON response: {classification: "safe"|"suspicious"|"high_risk", risk_score: 0.0-1.0, reasoning: "..."}`;
      
      const message = await this.client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = message.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { return JSON.parse(jsonMatch[0]); }
      return { classification: 'safe', risk_score: 0.0, reasoning: 'Unable to parse response' };
    } catch (error) {
      console.error('Risk analysis error:', error.message);
      return { classification: 'error', risk_score: 0.0, reasoning: error.message };
    }
  }
  
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
