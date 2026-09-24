const Stripe = require('stripe');

class StripeService {
  constructor(apiKey) {
    if (!apiKey || apiKey.length < 20) {
      console.warn('⚠️ Stripe API key invalid or missing - service disabled');
      this.enabled = false;
      return;
    }
    try {
      this.client = new Stripe(apiKey, { maxNetworkRetries: 2 });
      this.enabled = true;
      console.log('✅ Stripe service initialized');
    } catch (err) {
      console.warn('⚠️ Stripe initialization failed:', err.message);
      this.enabled = false;
    }
  }

  async getRecentCharges(limit = 10) {
    if (!this.enabled) return [];
    try {
      const charges = await this.client.charges.list({ limit });
      return charges.data || [];
    } catch (err) {
      console.warn('⚠️ Stripe fetch error (continuing):', err.message);
      return [];
    }
  }
}

module.exports = StripeService;
