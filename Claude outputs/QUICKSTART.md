# ATLAS Phase 4.3 - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### Step 1: Deploy CORS Fix (1 min)
```bash
cd ~/atlas-phase42
git push origin master
# Wait for Vercel to redeploy (1-2 minutes)
```

### Step 2: Verify Backend (30 sec)
```bash
curl -i https://atlas.bonusvarsel.no/api/status | head -15
```
✅ **Success:** You should see `Access-Control-Allow-Origin: *` in headers

### Step 3: Open Dashboard (30 sec)
Open `phase43_dashboard_v4_complete.html` in your browser, or upload to Artifact

### Step 4: Test Live Data (2 min)
- Click **Refresh** button
- Should show: System Status, metrics, live charts
- Click **Auto Refresh** to enable 5-sec polling
- Click each tab to explore Predictions, Alerts, Patterns

---

## Dashboard Features at a Glance

| Tab | What It Shows | Updates |
|-----|---------------|---------|
| **Overview** | System metrics + 3 charts | Live every 5s |
| **Predictions** | Next pattern forecasts (ML) | Live every 5s |
| **Alerts** | Anomaly notifications | Live every 5s |
| **Patterns** | Discovered patterns + events | Live every 5s |

---

## Troubleshooting

### "Failed to fetch" Error
**Problem:** CORS headers missing  
**Solution:** Push fix: `git push origin master`

### Dashboard shows old data
**Problem:** Auto-refresh disabled  
**Solution:** Click "⏱️ Auto Refresh" button

### No patterns showing
**Problem:** Backend pattern discovery not ran  
**Solution:** Check backend status: `curl https://atlas.bonusvarsel.no/api/status`

### Charts not rendering
**Problem:** Chart.js CDN timeout  
**Solution:** Refresh page, check internet connection

---

## Using Predictions & Alerts Programmatically

### Add to Express Backend
```javascript
const PatternPredictionEngine = require('./pattern_prediction_engine.js');
const LiveAlertsSystem = require('./live_alerts_system.js');

const predictor = new PatternPredictionEngine();
const alerts = new LiveAlertsSystem();

// When patterns arrive:
predictor.addPatterns(patterns);
const predictions = predictor.predictNextPatterns(5);

const recentAlerts = alerts.processPatterns(patterns, thresholds);
```

### Create API Endpoints
```javascript
app.get('/api/predictions', (req, res) => {
  const predictions = predictor.getFormattedPredictions();
  res.json({ predictions });
});

app.get('/api/alerts', (req, res) => {
  const alerts_list = alerts.getRecentAlerts(10);
  res.json({ alerts: alerts_list });
});
```

---

## Key Insights from Dashboard

### What the Charts Tell You

**Cycle-Progression (Green Line)**
- Going up = Model improving ✅
- Should go from 78% → 88%
- Flat = Model plateaued (investigate)

**Threshold Sensitivity (Blue Line)**
- Going up = Better calibration ✅
- Shows learning curve
- Should reach 85-95% by cycle 3

**Optimization Modes (Doughnut)**
- Balanced mode ~45% = Good distribution
- Too much Aggressive = Risky
- Too much Conservative = Safe but slow

**Predictions Tab**
- Green items = High certainty forecasts
- Check "Reason" to understand prediction basis
- Certainty score is your confidence level

**Alerts Tab**
- Red = Critical (act now)
- Yellow = Warning (monitor)
- Blue = Info (FYI)
- No alerts = All systems normal ✅

---

## Common Questions

**Q: Can I customize alert thresholds?**  
A: Yes! Edit values in `live_alerts_system.js`:
```javascript
new LiveAlertsSystem({
  confidenceThreshold: 0.70,  // Change to 0.80 for stricter
  volatilityThreshold: 0.20,   // Change to 0.15 for more sensitive
});
```

**Q: How often should I refresh?**  
A: Enable Auto Refresh (every 5 sec). Manual refresh when needed.

**Q: Can predictions be wrong?**  
A: Yes! Certainty score (0-100%) shows how confident we are. < 60% = treat as speculation.

**Q: Why are some patterns not predicted?**  
A: Prediction engine needs >= 2 historical observations. New patterns won't predict until proven.

**Q: Can I export the data?**  
A: Coming in Phase 4.3.1. Currently click "💾 Export CSV" for placeholder.

---

## Performance Tips

- **Dashboard runs at 5 sec refresh:** Configurable in HTML (search `setInterval(loadData, 5000)`)
- **Stores last 50 alerts:** Adjust with `new LiveAlertsSystem({ maxAlerts: 100 })`
- **Predictions generated on-demand:** No caching to ensure freshness
- **Charts auto-destroy & recreate:** Prevents memory leaks

---

## Architecture Decisions

**Why 3 prediction strategies?**
- Historical: Most reliable for repeat patterns
- Transition: Catches state machine-like behavior
- Trend: Handles continuous improvement phases

**Why event-driven alerts?**
- Subscribers can send notifications (email, Slack, webhooks)
- No polling overhead
- Real-time updates as patterns change

**Why tabbed interface?**
- Separates concerns (overview vs deep-dive)
- Reduces cognitive load
- Mobile-friendly navigation

---

## What's Next?

**Phase 4.3.1 (Future Enhancements)**
- Export to CSV/JSON
- Email notifications for critical alerts
- Webhook integration (Slack, Discord)
- Persistent alert history (database)
- Pattern comparison (before/after optimization)

**Phase 4.4 (Long-term)**
- Advanced ML models (LSTM for time series)
- Multi-agent coordination
- Automated threshold optimization
- Performance benchmarking

---

## Files You Need

| File | Purpose | Required? |
|------|---------|-----------|
| phase43_dashboard_v4_complete.html | Main dashboard | ✅ Yes |
| pattern_prediction_engine.js | ML predictions | Optional |
| live_alerts_system.js | Alert system | Optional |
| 05_push_cors_fix.sh | Deploy CORS | ✅ Yes (once) |
| PHASE43_README.md | Full docs | Reference |

---

## Quick Links

- **Backend:** https://atlas.bonusvarsel.no
- **Status Endpoint:** https://atlas.bonusvarsel.no/api/status
- **Patterns Endpoint:** https://atlas.bonusvarsel.no/api/patterns
- **Source Repo:** https://github.com/Sunnere/atlas-phase42

---

**Status:** ✅ Ready to use. Just push the CORS fix and you're live!
