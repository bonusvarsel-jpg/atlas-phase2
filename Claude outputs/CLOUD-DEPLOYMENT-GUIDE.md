# 🌍 ATLAS Cloud Deployment Guide

**Status:** ✅ Ready for deployment  
**Platform:** Railway.app (Node.js + PostgreSQL)  
**Cost:** ~$10/month  
**Access:** Any device with login  
**Storage:** ~10MB on local device  

---

## 🎯 What You Get

| Feature | Local | Cloud |
|---------|-------|-------|
| **Orchestrator** | Single Mac | Running 24/7 |
| **Agents** | One instance | All 10 agents |
| **Data** | SQLite (Mac disk) | PostgreSQL (cloud) |
| **Access** | Local only | Multi-device |
| **Auth** | None | OAuth + MFA |
| **Disk usage** | ~500MB | ~10MB per client |
| **Uptime** | Depends on Mac | 99.9% SLA |

---

## 📋 Prerequisites

✅ **You have:**
- ATLAS orchestrator + 3 agents (ready)
- GitHub account (optional, for syncing)

⏳ **You need to get:**
1. Railway.app account (free to start)
2. Google OAuth credentials
3. Anthropic API key
4. Stripe API key (optional)

---

## 🚀 Deployment Steps (15 min)

### Step 1: Create Railway.app Account
```bash
# Visit: https://railway.app
# Sign up with GitHub or email
# Create new project
```

### Step 2: Setup Google OAuth
```bash
# Go to: https://console.cloud.google.com
# Create new project: "ATLAS"
# Enable: Google+ API
# Create OAuth 2.0 credentials (Web app):
#   Authorized redirect URIs:
#   - https://your-atlas-domain.railway.app/api/auth/google/callback
#   - http://localhost:3000/api/auth/google/callback (dev)
# Copy: CLIENT_ID and CLIENT_SECRET
```

### Step 3: Build Cloud Infrastructure
```bash
# In your repo, run:
bash scripts/13_atlas-cloud-setup.sh

# This creates:
# - backend/server.js (Express + auth)
# - frontend/index.html (dashboard)
# - .env.template (configuration)
# - railway.toml (Railway config)
```

### Step 4: Configure Environment
```bash
# Copy template to .env
cp .env.template .env

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=$JWT_SECRET" >> .env

# Edit .env and fill in:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - ANTHROPIC_API_KEY
# - DATABASE_URL (Railway will auto-set)
```

### Step 5: Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Set environment variables
railway env

# Push your code
git push

# Deploy
railway up

# Get your URL
railway status
# Your app: https://atlas-prod-xyz.railway.app
```

### Step 6: Test Cloud Orchestrator
```bash
# Visit dashboard
https://atlas-prod-xyz.railway.app

# Login with Google
# Setup 2FA (scan QR code with authenticator)
# Verify orchestration is running
```

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore` (never commit)
- [ ] JWT secret is 32+ chars (random)
- [ ] Google OAuth secrets configured
- [ ] HTTPS enforced (Railway auto-enables)
- [ ] TOTP (2FA) enabled for your account
- [ ] Database password strong & unique
- [ ] API keys rotated regularly

---

## 📱 Client Setup (Any Device)

### Option 1: Web Dashboard
- Simply visit: `https://your-atlas-domain.railway.app`
- Login with Google + authenticator
- No installation needed

### Option 2: Desktop App (Electron)
```bash
# Optional: Build Electron app
# Distributed ~50MB per device
# Same auth, works offline with sync
```

### Option 3: Mobile (React Native)
```bash
# Optional: iOS/Android app
# ~100MB download
# Push notifications for alerts
```

---

## 🔄 Orchestration on Cloud

### Every 5 minutes:
```
1. Signal Collection
   ├─ Gmail: unread emails, labels
   ├─ Stripe: charges, refunds
   ├─ Calendar: upcoming events
   └─ Make.com: recent executions

2. Risk Analysis
   ├─ Anomaly detection (Claude AI)
   ├─ Score calculation (0-1)
   └─ Threat classification

3. Specialized Agents (Phase 7)
   ├─ Thailand Property Agent
   ├─ BonusShop Marketing Agent
   └─ Trading & Investment Agent

4. Cross-Agent Correlation (Phase 8)
   ├─ Property → Finance insights
   ├─ Marketing → Trading patterns
   └─ Trading → Marketing feedback

5. Execution
   ├─ Make.com webhooks
   ├─ Slack notifications
   └─ Database logging

6. Evidence Ledger
   └─ Immutable JSONL (SHA256 hashed)
```

---

## 📊 Monitoring

### Live Logs
```bash
# View real-time activity
railway logs --tail

# Filter by agent
railway logs --search "Thailand Property"
```

### Orchestration Status
```bash
# Visit: https://your-atlas-domain.railway.app/api/status
# Shows: last cycle, agent health, signals processed
```

### Database
```bash
# PostgreSQL console (Railway UI)
# View ledger entries, agent registry, cycles
```

---

## 💾 Database Schema (Cloud)

### Tables

**users**
- Email, Google ID, TOTP secret, timestamps

**orchestration_cycles**
- Cycle ID, phase, agent status, signals, risk score, ledger hash

**agent_registry**
- Agent ID, name, role, capabilities, status, last heartbeat

**sessions**
- User token, expiration, creation time

---

## 🛠️ Troubleshooting

### Database won't connect
```bash
# Check Railway PostgreSQL add-on
railway status

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Migrate database
npm run migrate
```

### Google OAuth not working
```bash
# Verify credentials in .env:
echo "CLIENT_ID: $GOOGLE_CLIENT_ID"
echo "SECRET: $GOOGLE_CLIENT_SECRET"

# Check redirect URI matches exactly
# (Railway auto-assigns domain)
```

### Orchestration not running
```bash
# Check API health
curl https://your-atlas-domain.railway.app/api/health

# View logs
railway logs --tail

# Restart service
railway redeploy
```

---

## 📈 Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Railway (Node.js) | $5 | 1GB RAM, 2 CPU |
| PostgreSQL | Free | 100MB included |
| **Total** | **~$5/mo** | Covers up to 100 cycles/day |

Optional:
- Google OAuth: Free
- Anthropic API: Pay per use (~$0.50-5/day)
- Stripe webhooks: Free

---

## 🎓 Next Steps After Deployment

1. **Test End-to-End**
   - Trigger manual cycle
   - Verify orchestration runs
   - Check ledger entries

2. **Setup Alerts**
   - Slack integration
   - Email notifications
   - Make.com scenarios

3. **Scale Agents**
   - Add more specialized agents
   - Connect real data sources
   - Automate decision-making

4. **Monitor & Optimize**
   - Watch API response times
   - Analyze cycle performance
   - Adjust thresholds based on data

---

## 🌐 Once Live

**Your ATLAS is now:**
- ✅ Running 24/7 in the cloud
- ✅ Accessible from any device
- ✅ Securely authenticated
- ✅ Immutably logging all activity
- ✅ Orchestrating 10 specialized agents
- ✅ Processing 5-minute cycles automatically

**Access from:**
- 🍎 Mac: Visit URL in browser
- 📱 iPhone: Visit URL in Safari
- 💻 Windows: Visit URL in Chrome
- 🖥️ Linux: Visit URL in Firefox
- 📲 Android: Visit URL in any browser

All devices get same real-time data, no installation needed.

---

## 📞 Support

Stuck? Check:
- Railway docs: https://docs.railway.app
- Express guide: https://expressjs.com
- Anthropic API: https://docs.anthropic.com
- PostgreSQL: https://www.postgresql.org/docs

---

**Deploy time estimate: 15 minutes**  
**Expected uptime: 99.9%**  
**Multi-device access: ✅**  
**Local disk usage: 10MB per device**

🚀 Ready to deploy?

