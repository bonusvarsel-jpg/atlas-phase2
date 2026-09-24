class GmailService {
  constructor() { this.configured = !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN); }
  async getUnreadCount() { if (!this.configured) return 0; return 0; }
  async getUrgentEmails() { if (!this.configured) return []; return []; }
}
module.exports = GmailService;
