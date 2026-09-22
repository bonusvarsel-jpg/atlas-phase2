let stripe = null;
let initialized = false;

if (process.env.STRIPE_API_KEY && process.env.STRIPE_API_KEY.length > 20) {
  try {
    stripe = require('stripe')(process.env.STRIPE_API_KEY, { maxNetworkRetries: 0 });
    initialized = true;
    console.log('✅ Stripe SDK loaded');
  } catch (err) {
    console.log('ℹ️ Stripe SDK issue (continuing without it)');
  }
} else {
  console.log('ℹ️ Stripe key not configured - service disabled');
}

class StripeService {
  constructor() { 
    this.configured = initialized;
  }
  
  async getRecentCharges() { 
    if (!this.configured) return []; 
    try { 
      const charges = await Promise.race([
        stripe.charges.list({ limit: 10 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      return charges.data || []; 
    } catch (error) { 
      // Silently skip Stripe errors
      return []; 
    } 
  }
  
  async getDisputes() { 
    if (!this.configured) return []; 
    try { 
      const disputes = await Promise.race([
        stripe.disputes.list({ limit: 10 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
      ]);
      return disputes.data || []; 
    } catch (error) { 
      return []; 
    } 
  }
}

module.exports = StripeService;
