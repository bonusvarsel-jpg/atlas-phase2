# ATLAS Phase 4.3 Analytics Dashboard - Deployment Guide

## 📊 Dashboard Features

The ATLAS Phase 4.3 Analytics Dashboard provides real-time monitoring of agent orchestration with:

- **Agent Health Status**: Real-time operational status for all 3 agents (Thailand Property, BonusShop Marketing, Trading & Investment)
- **Performance Metrics**: Total requests, average latency, success rate tracking
- **Request Timeline**: Last 60 minutes of request volume by agent
- **Risk Classification**: HIGH/MEDIUM/LOW risk breakdown with pie chart visualization
- **System Status**: Backend connectivity and service health
- **Light/Dark Mode**: User preference toggle with persistent storage
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Deployment Options

### Option A: Deploy to Railway (Recommended)

#### Step 1: Create or Update Railway Service

1. **Log in to Railway**: https://railway.app/dashboard
2. **Select the `fulfilling-charm` project** (your production environment)
3. **Add a new service** or use existing service for dashboard

#### Step 2: Add Dashboard Files to GitHub Repository

Push these files to `Sunnere/atlas-phase42` GitHub repository:

```bash
# In your local repo directory:
cd ~/atlas-phase42

# Create dashboard directory structure
mkdir -p public/dashboard

# Copy the dashboard HTML
cp atlas-phase43-dashboard.html public/dashboard/index.html

# Create a simple Express route to serve it (add to server.js or create a new route)
# Or: Configure nginx to serve static files

# Commit and push
git add public/dashboard/
git commit -m "feat: add Phase 4.3 Analytics Dashboard"
git push origin main
```

#### Step 3: Configure Railway Service

**Option A1: Using Existing Express Backend**

If using the existing Phase 4.2 backend (`16_railway-backend-phase42.js`), add a route:

```javascript
// In 16_railway-backend-phase42.js, add before app.listen():

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});

app.use('/dashboard', express.static(path.join(__dirname, 'public')));
```

Then push to GitHub and Railway will auto-deploy.

**Option A2: Deploy as Static Service**

1. In Railway dashboard, click "Add Service" → "GitHub"
2. Select `Sunnere/atlas-phase42` repository
3. Set **Builder**: Railway.app (Static)
4. Set **Build Command**: None
5. Set **Start Command**: `npx http-server public/dashboard -p $PORT`
6. Add environment variable: `PORT=3000`
7. Click Deploy

#### Step 4: Configure Domain Routing

If you want the dashboard at `atlas.bonusvarsel.no/dashboard`:

1. In Railway, go to Service Settings
2. Add **Public URL** or configure domain
3. Update your DNS CNAME if needed

Or add subdomain `analytics.atlas.bonusvarsel.no`:

1. Add DNS CNAME: `analytics.atlas.bonusvarsel.no → fulfilling-charm-production-b137.up.railway.app`
2. In Railway, add domain to service
3. Access at `https://analytics.atlas.bonusvarsel.no`

### Option B: Serve from Existing Backend

Modify your Phase 4.2 backend to serve the dashboard:

```bash
# Copy dashboard to public folder
mkdir -p ~/atlas-phase42/public/dashboard
cp atlas-phase43-dashboard.html ~/atlas-phase42/public/dashboard/index.html

# Update package.json to include static file serving
# Add to dependencies if not present:
# "express": "^4.18.2"

# Update server.js to serve static files:
```

**Modified server.js snippet:**

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'public/dashboard')));

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});

// ... rest of your routes
```

Then push and Railway auto-deploys:

```bash
git add public/dashboard/
git commit -m "feat: add Phase 4.3 analytics dashboard"
git push origin main
```

## 📡 Integration with Backend API

### Current Setup

The dashboard currently works with **mock data** for demonstration. To integrate with real backend data:

#### Step 1: Expose Agent Metrics Endpoint

Add to your Phase 4.2 backend (`16_railway-backend-phase42.js`):

```javascript
// GET /api/agents/health - Returns health status for all agents
app.get('/api/agents/health', (req, res) => {
  res.json({
    agents: [
      {
        id: 'thailand-property',
        name: 'Thailand Property Agent',
        status: 'operational',
        uptime: 99.8,
        lastResponse: 145,
        requestsLastHour: 342
      },
      {
        id: 'bonusshop-marketing',
        name: 'BonusShop Marketing Agent',
        status: 'operational',
        uptime: 99.5,
        lastResponse: 128,
        requestsLastHour: 298
      },
      {
        id: 'trading-investment',
        name: 'Trading & Investment Agent',
        status: 'operational',
        uptime: 99.9,
        lastResponse: 156,
        requestsLastHour: 267
      }
    ],
    timestamp: new Date().toISOString()
  });
});

// GET /api/metrics/requests?interval=1h - Returns request timeline
app.get('/api/metrics/requests', (req, res) => {
  const interval = req.query.interval || '1h'; // 1h, 24h, 7d
  res.json({
    timeline: [
      // Array of { timestamp, thailand, bonusshop, trading }
    ],
    interval: interval,
    timestamp: new Date().toISOString()
  });
});

// GET /api/metrics/risks - Returns risk classification breakdown
app.get('/api/metrics/risks', (req, res) => {
  res.json({
    HIGH: 180,    // 15% of requests
    MEDIUM: 420,  // 35% of requests
    LOW: 600,     // 50% of requests
    timestamp: new Date().toISOString()
  });
});
```

#### Step 2: Update Dashboard to Fetch Real Data

In the dashboard HTML, modify the data fetching (around line 530):

```javascript
// Replace mock data generation with real API calls
async function fetchAgentHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/agents/health`, { mode: 'cors' });
    if (response.ok) {
      const data = await response.json();
      // Update dashboardData.agents from response
      return data.agents;
    }
  } catch (error) {
    console.error('Failed to fetch agent health:', error);
  }
  return null;
}

async function fetchRequestMetrics() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/metrics/requests?interval=1h`, { mode: 'cors' });
    if (response.ok) {
      const data = await response.json();
      dashboardData.requestTimeline = data.timeline;
      return data.timeline;
    }
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
  }
  return [];
}

async function fetchRiskMetrics() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/metrics/risks`, { mode: 'cors' });
    if (response.ok) {
      const data = await response.json();
      dashboardData.riskBreakdown = { HIGH: data.HIGH, MEDIUM: data.MEDIUM, LOW: data.LOW };
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch risk metrics:', error);
  }
  return null;
}

// Update the init function to call real APIs:
async function init() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Fetch real data
  await fetchAgentHealth();
  await fetchRequestMetrics();
  await fetchRiskMetrics();
  
  updateDashboard();
  
  // Auto-refresh with fresh data
  setInterval(async () => {
    await fetchAgentHealth();
    await fetchRequestMetrics();
    await fetchRiskMetrics();
    updateDashboard();
  }, REFRESH_INTERVAL);
}
```

## 🔍 Testing Locally

### Before Deployment

1. **Open the dashboard locally**:
   ```bash
   # If you have Python:
   cd /path/to/dashboard
   python3 -m http.server 8000
   
   # Then open: http://localhost:8000/atlas-phase43-dashboard.html
   ```

2. **Test responsiveness**:
   - Open in Chrome/Firefox DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test on different screen sizes

3. **Test theme toggle**:
   - Click "🌙 Dark" button
   - Verify dark mode renders correctly
   - Refresh page - theme should persist

4. **Test data updates**:
   - Watch metrics update every 5 seconds
   - Monitor browser console for errors
   - Check that charts render without errors

## 📋 Verification Checklist

After deployment:

- [ ] Dashboard loads at configured URL
- [ ] No console errors (F12 → Console tab)
- [ ] All three agents display with correct names
- [ ] Charts render (timeline bar chart, risk pie chart)
- [ ] Theme toggle works and persists across refresh
- [ ] Metrics update every 5 seconds
- [ ] Backend status shows as "Connected" (green dot)
- [ ] Responsive on mobile/tablet
- [ ] Light and dark modes both readable

## 🛠 Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

1. Ensure the backend service has CORS headers enabled
2. Add to backend (if using Express):
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

### Dashboard Not Loading

- Check browser console (F12) for network errors
- Verify URL is correct in browser address bar
- Check Railway deployment logs for errors
- Ensure static files are being served

### Metrics Not Updating

- Check browser console for fetch errors
- Verify backend API endpoints are responding
- Check that BACKEND_URL in dashboard matches your service URL
- Monitor Network tab (F12 → Network) for API calls

## 📝 Production Considerations

1. **Add Authentication** (optional):
   - Use JWT tokens to protect dashboard
   - Add user-agent string validation

2. **Add API Rate Limiting**:
   - Prevent dashboard refresh from overloading backend
   - Implement caching on metrics

3. **Add Error Logging**:
   - Log dashboard errors to monitoring service
   - Track metric fetch failures

4. **Optimize Performance**:
   - Cache dashboard HTML with HTTP headers
   - Compress SVG charts
   - Minimize JavaScript

## 📞 Quick Deployment Commands

```bash
# 1. Copy to your local repo
cp atlas-phase43-dashboard.html ~/atlas-phase42/public/dashboard/index.html

# 2. Commit and push
cd ~/atlas-phase42
git add public/dashboard/
git commit -m "feat: add Phase 4.3 Analytics Dashboard - agent orchestration metrics"
git push origin main

# 3. Railway auto-deploys (wait 2-5 minutes)

# 4. Test the dashboard
curl https://fulfilling-charm-production-b137.up.railway.app/dashboard

# 5. Access in browser
# Option A: https://fulfilling-charm-production-b137.up.railway.app/dashboard
# Option B: https://atlas.bonusvarsel.no/dashboard (after DNS config)
```

---

**Created**: 2026-09-26  
**Version**: ATLAS Phase 4.3 Analytics Dashboard v1.0  
**Status**: Ready for deployment to fulfilling-charm Railway project
