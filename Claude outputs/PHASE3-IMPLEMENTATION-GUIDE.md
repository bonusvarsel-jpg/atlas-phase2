# ATLAS Phase 3 Implementation Guide
## Custom Time Ranges & CSV Export

**Status:** Ready for deployment  
**Files:** 3 (server updates, test script, dashboard)  
**Deployment target:** Railway (fulfilling-charm environment)  

---

## 🎯 What Phase 3 Adds

### Feature 1: Custom Time Ranges
- Users can select: 60min, 24h, 1 week, 1 month
- Or set custom date/time range with inputs
- Dashboard updates dynamically to show selected range
- Metrics update based on selected time window

### Feature 2: CSV Export
- **Export CSV** button in dashboard header
- Downloads metrics data for the selected time range
- File format: `atlas-metrics-YYYY-MM-DD.csv` with timestamp and request count

### Feature 3: Metrics Summary
- New endpoint: `GET /api/metrics/summary`
- Returns: total requests, average, peak, minimum for selected range
- Displayed in dashboard summary cards

### Feature 4: Enhanced Dashboard UI
- Date range picker with preset buttons
- Custom date/time inputs
- Real-time theme toggle fix (with new JavaScript)
- Responsive design improvements

---

## 📝 Implementation Steps

### Step 1: Update Your Server (backend/server.js)

1. **Open** `/atlas-backend/server.js` on your Mac
2. **Find** the existing `app.get('/api/metrics/requests', ...)` endpoint
3. **Replace** that entire endpoint with the updated version from `atlas-phase3-server-updates.js`
4. **Add** the new helper function `generateMetricsForRange()` at the top of the server section
5. **Add** two new endpoints:
   - `GET /api/metrics/summary` 
   - `GET /api/metrics/export`

**File:** `atlas-phase3-server-updates.js` contains all the code you need.

### Step 2: Test Locally Before Deploying

1. **Start** your local development server:
   ```bash
   cd /path/to/atlas-backend
   npm start
   # Should show: listening on port 3000
   ```

2. **Run** the test script:
   ```bash
   bash test-phase3-endpoints.sh
   ```
   
   This will test:
   - Default 60-minute range (backward compatibility)
   - Custom 24-hour range
   - Custom 7-day range
   - Metrics summary endpoint
   - CSV export download
   - Error handling (invalid dates, reversed dates)

3. **Expected output:**
   ```
   ✅ All tests completed!
   
   Summary of new endpoints:
     • GET /api/metrics/requests?start=ISO8601&end=ISO8601  → Metrics timeline
     • GET /api/metrics/summary?start=ISO8601&end=ISO8601   → Aggregated stats
     • GET /api/metrics/export?start=ISO8601&end=ISO8601    → CSV download
   ```

### Step 3: Update Dashboard

1. **Replace** your current dashboard file at `/public/dashboard/index.html` with `atlas-phase3-dashboard.html`

2. **Key features in new dashboard:**
   - Date range buttons: 60 min | 24h | 1 week | 1 month
   - Custom range inputs (date + time)
   - Export CSV button
   - Fixed theme toggle (now properly switches dark/light mode)
   - Enhanced metrics summary cards
   - Better responsive design for mobile

### Step 4: Git Commit & Deploy

```bash
# From your atlas-phase42 directory
git add -A
git commit -m "feat(phase3): Add custom time ranges and CSV export

- Updated /api/metrics/requests with date range parameters
- Added /api/metrics/summary for aggregated statistics
- Added /api/metrics/export for CSV downloads
- Enhanced dashboard with date range picker
- Fixed theme toggle functionality
- Improved responsive design

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01UgfQ8q59pVPAgAgKXiSAas"

git push origin master
```

Railway will auto-deploy from master branch. Check deployment status at:
https://fulfilling-charm-production-b137.up.railway.app/dashboard

---

## 🔧 Backend Endpoint Details

### GET /api/metrics/requests (Updated)

**With default parameters (backward compatible):**
```bash
curl http://localhost:3000/api/metrics/requests
```

**With custom time range:**
```bash
curl "http://localhost:3000/api/metrics/requests?start=2026-09-28T10:00:00Z&end=2026-09-28T12:00:00Z"
```

**Response:**
```json
{
  "range": {
    "start": "2026-09-28T10:00:00Z",
    "end": "2026-09-28T12:00:00Z",
    "pointCount": 120
  },
  "data": [
    {"timestamp": "2026-09-28T10:00:00Z", "requests": 342},
    {"timestamp": "2026-09-28T10:01:00Z", "requests": 298},
    ...
  ],
  "timestamp": "2026-09-28T16:30:45Z"
}
```

### GET /api/metrics/summary (New)

```bash
curl "http://localhost:3000/api/metrics/summary?start=2026-09-28T10:00:00Z&end=2026-09-28T12:00:00Z"
```

**Response:**
```json
{
  "range": {
    "start": "2026-09-28T10:00:00Z",
    "end": "2026-09-28T12:00:00Z"
  },
  "statistics": {
    "totalRequests": 45623,
    "averagePerMinute": 380,
    "peakPerMinute": 498,
    "minimumPerMinute": 201,
    "dataPoints": 120
  },
  "timestamp": "2026-09-28T16:30:45Z"
}
```

### GET /api/metrics/export (New)

```bash
curl "http://localhost:3000/api/metrics/export?start=2026-09-27T00:00:00Z&end=2026-09-28T00:00:00Z" > metrics.csv
```

**CSV format:**
```
timestamp,requests
2026-09-27T00:00:00Z,342
2026-09-27T00:01:00Z,298
2026-09-27T00:02:00Z,405
...
```

---

## ✅ Verification Checklist

Before marking Phase 3 as complete:

- [ ] Backend server starts without errors
- [ ] Test script runs all 7 tests successfully
- [ ] Default 60-minute range still works (backward compatibility)
- [ ] Custom date ranges work (24h, 7-day test)
- [ ] Metrics summary returns correct aggregated stats
- [ ] CSV export downloads with correct filename
- [ ] Error handling works (invalid dates, reversed dates)
- [ ] Dashboard loads and displays date range picker
- [ ] Theme toggle (🌙 / ☀️) switches dark/light mode
- [ ] Export button downloads CSV file
- [ ] Metrics cards show summary statistics
- [ ] Agent list displays all 3 agents
- [ ] Risk breakdown shows HIGH/MEDIUM/LOW breakdown
- [ ] Request timeline chart renders correctly
- [ ] Dashboard responsive on mobile (test with browser DevTools)
- [ ] Git commit includes proper attribution
- [ ] Railway deployment completes successfully
- [ ] Live dashboard at /dashboard shows new features

---

## 🐛 Troubleshooting

**Q: Tests fail with "connection refused"**  
A: Make sure your backend server is running on port 3000. Start with `npm start`.

**Q: Date inputs don't work in custom range**  
A: Make sure all 4 fields (date, time, date, time) are filled before clicking Apply.

**Q: CSV export button does nothing**  
A: Check browser console for errors. Make sure /api/metrics/export endpoint is working with curl first.

**Q: Theme toggle doesn't change colors**  
A: Clear browser cache (Cmd+Shift+Delete) and reload the page. The new dashboard fixes this issue.

**Q: Dashboard shows "Connection error"**  
A: Check that all three API endpoints work locally with curl before deploying to Railway.

---

## 📊 What's Next (Phase 3 Continued)

After completing this implementation:

1. **Authentication Layer** (Phase 3.2)
   - Add JWT tokens or session-based auth
   - Protect dashboard with login page

2. **Alerting System** (Phase 3.3)
   - Threshold-based alerts
   - Alert history and configuration UI

3. **Enhanced Analytics** (Phase 3.4)
   - Trend analysis
   - Anomaly detection
   - Comparison views

---

## 💾 Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `atlas-phase3-server-updates.js` | Backend code for new/updated endpoints | Copy to server.js |
| `test-phase3-endpoints.sh` | Automated test script for all 3 endpoints | Run locally before deploying |
| `atlas-phase3-dashboard.html` | Updated frontend with date range picker | Copy to public/dashboard/index.html |

---

**Ready to deploy?** Follow the steps above and let me know when you've pushed to master! 🚀
