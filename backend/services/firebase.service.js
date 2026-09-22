class FirebaseService {
  constructor() { this.configured = !!process.env.FIREBASE_PROJECT_ID; }
  async syncObservations(observations) { if (!this.configured) return false; console.log('Firebase sync would happen here'); return true; }
}
module.exports = FirebaseService;
