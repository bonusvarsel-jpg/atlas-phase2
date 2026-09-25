const { Anthropic } = require('@anthropic-ai/sdk');

class RiskAgent {
  constructor() { 
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); 
  }
  
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
        model: 'claude-opus-5-5',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = message.content?.find(c => c.type === 'text')?.text;
      if (!content) {
        return { classification: 'error', risk_score: 0, reasoning: 'No text response' };
      }
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { 
        return JSON.parse(jsonMatch[0]); 
      }
      return { classification: 'safe', risk_score: 0.5, reasoning: content };
    } catch (error) {
      return { classification: 'error', risk_score: 0, reasoning: error.message };
    }
  }
}
module.exports = RiskAgent;
