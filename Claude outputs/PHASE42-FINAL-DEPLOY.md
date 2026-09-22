# ATLAS Phase 4.2 - Final Railway Deployment (Ready to Deploy)

**Status: ✅ All components tested locally. Ready for Railway deployment.**

---

## Pre-Deployment Checklist

On your Mac, verify:
- [ ] Node.js 18.x installed: `node --version` (should show 18.0+)
- [ ] npm installed: `npm --version`
- [ ] Railway account created at https://railway.app (GitHub/Google login)
- [ ] Railway CLI installed: `npm install -g @railway/cli@latest`

---

## Step-by-Step Railway Deployment

### Step 1: Navigate to your project directory
```bash
cd ~/atlas-phase42
```

### Step 2: Verify git is initialized
```bash
git status
```

You should see:
- All Phase 4.2 files present (14_*, 15_*, 16_*)
- package.json with Express dependency
- railway.json with deployment config

### Step 3: Link to Railway (creates new project)
```bash
railway link
```

When prompted:
- Select: **Create new project**
- Project name: `atlas-phase42` (or your choice)
- Select region closest to you

This creates `.railway/config.json` in your project directory.

### Step 4: Deploy to Railway
```bash
railway up
```

This will:
- Build Docker image (Node.js 18.x)
- Deploy to Railway cloud
- Print your live URL (e.g., `atlas-phase42.railway.app`)

Wait for it to complete (2-3 minutes).

### Step 5: View your live dashboard
```bash
railway open
```

Browser opens your live dashboard at: `https://atlas-phase42.railway.app`

**You should see the ATLAS Phase 4.2 dashboard with metrics!**

---

## Verify Deployment Success

### Check status
```bash
railway status
```

Should show: **Deployed** ✅

### View live logs
```bash
railway logs -f
```

Should show:
```
✅ ATLAS Phase 4.2 Backend running on http://localhost:3000
```

### Test API endpoints
```bash
# Replace DOMAIN with your Railway URL
DOMAIN="https://atlas-phase42.railway.app"

# Health check
curl $DOMAIN/health

# System status
curl $DOMAIN/api/status

# Create a cycle
curl -X POST $DOMAIN/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"agents": ["risk-01", "execution-01"], "events": []}'
```

All should respond with JSON (not HTML errors).

---

## Troubleshooting

### "railway command not found"
```bash
npm install -g @railway/cli@latest
railway --version  # Verify installation
```

### "Build failed" error
```bash
railway logs
# Look for error message
# Most common: missing dependencies
# Check: npm install locally first
npm install
npm start  # Verify works before retrying
railway deploy  # Retry
```

### "Can't connect to live URL"
- Wait 2-3 minutes for deployment to complete
- Check: `railway status`
- View logs: `railway logs -f`
- Verify URL format (should start with `https://`)

### "API endpoints return 404"
- Check URL format (include `/api/patterns` or `/api/status`)
- Verify Railway deployment completed
- Check logs: `railway logs -f`

---

## What's Deployed

### Components
1. **Self-Optimizing Thresholds** (14_phase42-self-optimizing-thresholds.js)
   - Confusion matrix tracking
   - Auto-threshold adjustment
   - Performance metrics (Accuracy, Precision, Recall, FPR)

2. **Temporal Pattern Recognition** (15_phase42-temporal-patterns.js)
   - Lag-based event analysis
   - Pattern discovery with confidence scoring
   - Predictive forecasting

3. **Express REST Backend** (16_railway-backend-phase42.js)
   - 10 API endpoints
   - Real-time dashboard UI
   - Health checks
   - In-memory state management

### API Endpoints (Live)
- `GET /` → Dashboard UI
- `GET /health` → Health check
- `GET /api/status` → System status
- `GET /api/cycles` → List cycles
- `GET /api/thresholds` → Get thresholds
- `GET /api/patterns` → Get patterns
- `POST /api/orchestrate` → Start cycle
- `POST /api/thresholds/:id/record` → Record outcome
- `POST /api/patterns/event` → Record event
- `POST /api/patterns/analyze` → Run analysis

---

## Post-Deployment

### Monitor live dashboard
```bash
railway open
# Browser shows real-time metrics
```

### View logs in real-time
```bash
railway logs -f
```

### Make updates (after local testing)
```bash
# Edit component files locally
nano 16_railway-backend-phase42.js

# Test locally
npm start
# Verify at http://localhost:3000

# Commit and redeploy
git add .
git commit -m "Phase 4.2 improvements"
railway deploy  # Auto-redeploys
```

### Get live URL anytime
```bash
railway link --list  # Show all Railway projects
railway env | grep RAILWAY_PUBLIC_DOMAIN  # Get live URL
```

---

## Success Indicators ✅

You'll know Phase 4.2 is live when:
- Dashboard loads with green metrics
- Metrics update every 10 seconds
- All API endpoints respond in <20ms
- Logs show no errors
- Live URL is accessible from any device

---

## Next Phase (Phase 4.3) 🚀

Once Phase 4.2 is stable on Railway:

1. **Anomaly Detection** - Statistical outlier detection
2. **Self-Explaining Capabilities** - Claude API for decision explanations
3. **Multi-Agent Coordination** - Cross-agent pattern discovery

Ready when you are!

---

## Quick Reference

```bash
# Deploy
cd ~/atlas-phase42
railway link       # First time only
railway up         # Deploy

# Monitor
railway status     # Check status
railway logs -f    # View logs
railway open       # Open dashboard

# Update
git add .
git commit -m "Your changes"
railway deploy     # Redeploy

# Test API
curl https://YOUR-PROJECT.railway.app/health
curl https://YOUR-PROJECT.railway.app/api/status
```

---

**Status: Phase 4.2 Ready for Railway Deployment** ✅

All components tested. All documentation provided. You have everything needed.

When ready on your Mac, run:
```bash
cd ~/atlas-phase42
railway link
railway up
```

Then visit your live dashboard! 🎉
