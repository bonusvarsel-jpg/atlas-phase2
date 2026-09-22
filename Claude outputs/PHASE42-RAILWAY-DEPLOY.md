# ATLAS Phase 4.2 - Railway Deployment Guide

## ✅ Prerequisites

1. **Mac local installation working** (tested with: `npm start`, visited dashboard)
2. **Railway.app account** → https://railway.app (GitHub/Google login)
3. **Railway CLI installed** → `npm install -g @railway/cli`
4. **Git initialized** in project → `git init && git add . && git commit -m "Initial"`

---

## 🚀 Deployment Steps

### Step 1: Navigate to project directory
```bash
cd ~/atlas-phase42
git status  # Verify git initialized
```

### Step 2: Link to Railway
```bash
railway link
```

Select:
- Create new project: YES
- Project name: `atlas-phase42` (or your choice)
- Region: closest to you

### Step 3: Deploy
```bash
railway up
```

This will:
- Build Docker image (Node.js 18.x)
- Deploy to Railway.app cloud
- Provision PostgreSQL (optional, not needed for Phase 4.2)
- Return live URL

### Step 4: View Dashboard
```bash
railway open
```

Browser will open your live dashboard at: `https://atlas-phase42.railway.app`

---

## 📊 Verify Deployment

### Check status
```bash
railway status
```

### View logs
```bash
railway logs -f
```

Should see:
```
✅ ATLAS Phase 4.2 running on http://localhost:3000
  Dashboard: http://localhost:3000
  API: http://localhost:3000/api/status
  Health: http://localhost:3000/health
```

### Test live API
```bash
# Replace DOMAIN with your Railway URL
DOMAIN="https://atlas-phase42.railway.app"

# Health check
curl $DOMAIN/health

# Status
curl $DOMAIN/api/status

# Create a cycle
curl -X POST $DOMAIN/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"agents": ["risk-01", "execution-01"], "events": []}'
```

---

## 🔄 Post-Deployment

### Update code (after local testing)
```bash
cd ~/atlas-phase42
# Make changes to *.js files
git add .
git commit -m "Phase 4.2 improvements"
railway deploy  # Auto-redeploy
```

### Monitor live
```bash
railway logs -f
```

### View metrics
```bash
railway status
```

---

## 🐛 Troubleshooting

### Build failed?
```bash
railway logs
# Look for error in "Build Logs" section
# Common: missing dependencies (check package.json)
```

### Deploy fails?
```bash
# Verify Node.js version
node --version  # Should be >= 18.0

# Verify dependencies
npm install

# Test locally first
npm start
# Visit http://localhost:3000
```

### Can't connect to live URL?
- Wait 2-3 minutes for deployment to complete
- Check: `railway status`
- Verify: `railway logs` for startup errors

---

## 📈 Next: Phase 4.3 (Optional)

Once Phase 4.2 is stable on Railway:

1. **Anomaly Detection** - Statistical outlier detection
2. **Self-Explaining Capabilities** - Claude API integration for decision explanations
3. **Multi-Agent Coordination** - Cross-agent pattern discovery

Ready to build? Let me know! 🚀

---

## ✅ Success Checklist

- [ ] Local testing passed (npm start works)
- [ ] Git initialized with commit
- [ ] Railway project created
- [ ] Deployment completed (`railway up`)
- [ ] Live dashboard accessible
- [ ] API endpoints responding
- [ ] Logs show no errors

**When all checked: Phase 4.2 is production-ready!** 🎉
