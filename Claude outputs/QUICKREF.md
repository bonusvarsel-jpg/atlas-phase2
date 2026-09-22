# ATLAS Phase 4.2 - Quick Reference

## 📁 Files You Need

1. **PHASE42-MAC-INSTALL.sh** ← Start here (step-by-step installation)
2. **PHASE42-RAILWAY-DEPLOY.md** ← For cloud deployment
3. **PHASE42-TEST-RESULTS.md** ← Verify everything works
4. **PHASE42-SUMMARY.txt** ← Overview & checklist

---

## ⚡ 30-Second Setup (Mac)

```bash
# 1. Create project
mkdir -p ~/atlas-phase42 && cd ~/atlas-phase42

# 2. Get the installation script
# (Download PHASE42-MAC-INSTALL.sh or copy-paste components)

# 3. Install components (follow PHASE42-MAC-INSTALL.sh steps 2-7)
# → Creates 3 .js files + package.json

# 4. Install & test locally
npm install
npm start

# 5. Visit http://localhost:3000 in browser
# (Should see dashboard with green metrics)
```

---

## 🚀 Deploy to Railway (5 min)

```bash
cd ~/atlas-phase42

# 1. Create Railway account (if needed)
# → https://railway.app (GitHub/Google login)

# 2. Install Railway CLI
npm install -g @railway/cli

# 3. Link to Railway
railway link
# → Select: Create new project → Name: atlas-phase42

# 4. Deploy
railway up
# → Takes 2-3 minutes

# 5. View live dashboard
railway open
# → Browser opens your live URL: https://atlas-phase42.railway.app
```

---

## 📊 What You Get

### Self-Optimizing Thresholds
- Auto-adjusts agent decision thresholds
- Tracks: Accuracy, Precision, Recall, False-Positive Rate
- Modes: conservative/balanced/aggressive

### Temporal Pattern Recognition
- Discovers lag-based event patterns (1-5 cycles)
- Calculates confidence scores
- Example: "high_volatility → decision_override (lag=1, 100% confidence)"

### Express REST API
- 9 endpoints for orchestration
- Dashboard at `/` with auto-refresh
- Real-time metrics display

---

## 🧪 Test It Works

### Locally (Mac):
```bash
# Terminal 1
npm start
# → Server runs on http://localhost:3000

# Terminal 2
curl http://localhost:3000/health
# → {"status":"healthy","service":"ATLAS Phase 4.2"}
```

### After Railway Deploy:
```bash
DOMAIN="https://atlas-phase42.railway.app"

curl $DOMAIN/health
# → {"status":"healthy",...}

curl $DOMAIN/api/status
# → Full system status JSON
```

---

## 🎯 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Dashboard UI |
| GET | `/health` | Health check |
| POST | `/api/orchestrate` | Start cycle |
| GET | `/api/cycles` | List cycles |
| GET | `/api/thresholds` | Get all thresholds |
| POST | `/api/thresholds/:id/record` | Record outcome |
| GET | `/api/patterns` | Get patterns |
| POST | `/api/patterns/event` | Record event |
| POST | `/api/patterns/analyze` | Run analysis |
| GET | `/api/status` | System status |

---

## 📋 Component Files

All three included in delivery:

```
14_phase42-self-optimizing-thresholds.js  (5.5 KB)
15_phase42-temporal-patterns.js           (5.3 KB)
16_railway-backend-phase42.js             (12 KB)
package.json                              (462 B)
railway.json                              (219 B)
```

---

## ❌ Troubleshooting

### npm install fails
```bash
# Check Node version
node --version  # Should be >= 18.0

# Clear npm cache
npm cache clean --force
npm install
```

### Server won't start
```bash
# Port already in use?
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it

# Then retry
npm start
```

### Railway deploy fails
```bash
# Check logs
railway logs

# Common issue: Missing dependencies
# → Verify package.json has "express": "^4.18.2"

# Retry
railway deploy
```

### Dashboard shows no data
```bash
# Try manual refresh
curl http://localhost:3000/api/status

# Dashboard should auto-update every 10s
# Manual refresh button also available
```

---

## 🔄 Common Commands

```bash
# Local development
npm start                   # Run server
npm test                    # Run tests
Ctrl+C                      # Stop server

# Railway management
railway link                # Connect project
railway up                  # Deploy
railway logs -f             # Live logs
railway status              # Check status
railway open                # Open in browser
railway restart             # Restart service
```

---

## 📈 Next: Phase 4.3 (Optional)

Once Phase 4.2 is live on Railway:

1. **Anomaly Detection** - Statistical outlier detection
2. **Self-Explaining** - Claude API for decision explanations
3. **Cross-Agent Patterns** - Multi-agent correlation

Ready when you are! 🚀

---

## ✅ Success Checklist

- [ ] Phase 4.2 files downloaded
- [ ] PHASE42-MAC-INSTALL.sh read
- [ ] Components installed locally
- [ ] npm start works
- [ ] Dashboard loads (http://localhost:3000)
- [ ] Metrics visible
- [ ] Railway account created
- [ ] Railway CLI installed
- [ ] Deployed with `railway up`
- [ ] Live dashboard accessible
- [ ] All endpoints working

**When all checked: You're done! 🎉**

---

## 📞 Support

If issues occur:

1. Check logs:
   - Local: Terminal output
   - Railway: `railway logs -f`

2. Verify requirements:
   - Node.js 18.x
   - npm installed
   - Internet connection

3. Reference files:
   - PHASE42-MAC-INSTALL.sh (detailed steps)
   - PHASE42-RAILWAY-DEPLOY.md (deployment help)
   - PHASE42-TEST-RESULTS.md (working examples)

---

**Status: Ready to Deploy** ✅

All components tested. All documentation provided.

You got this! 🚀
