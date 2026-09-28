// ============================================================================
// ATLAS Phase 3: Custom Time Ranges for Metrics
// Add this to your server.js after the existing /api/metrics/requests endpoint
// ============================================================================

// Helper function to generate metrics data for any date range
function generateMetricsForRange(startDate, endDate) {
  const data = [];
  let current = new Date(startDate);

  while (current < endDate) {
    // Random request count between 200-500 per minute
    const requestCount = Math.floor(Math.random() * 300) + 200;

    data.push({
      timestamp: new Date(current).toISOString(),
      requests: requestCount
    });

    current.setMinutes(current.getMinutes() + 1);
  }

  return data;
}

// UPDATED: /api/metrics/requests - Now supports custom time ranges
app.get('/api/metrics/requests', (req, res) => {
  let startDate, endDate;

  if (req.query.start && req.query.end) {
    // Parse provided start and end dates
    startDate = new Date(req.query.start);
    endDate = new Date(req.query.end);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use ISO8601: 2026-09-28T14:00:00Z'
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        error: 'Start date must be before end date'
      });
    }
  } else {
    // Default: last 60 minutes
    endDate = new Date();
    startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
  }

  // Generate data for the requested range
  const data = generateMetricsForRange(startDate, endDate);

  res.json({
    range: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      pointCount: data.length
    },
    data: data,
    timestamp: new Date().toISOString()
  });
});

// NEW: /api/metrics/summary - Get aggregated metrics for a time range
app.get('/api/metrics/summary', (req, res) => {
  let startDate, endDate;

  if (req.query.start && req.query.end) {
    startDate = new Date(req.query.start);
    endDate = new Date(req.query.end);
  } else {
    endDate = new Date();
    startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
  }

  // Generate data for calculation
  const data = generateMetricsForRange(startDate, endDate);
  const values = data.map(d => d.requests);

  // Calculate statistics
  const total = values.reduce((a, b) => a + b, 0);
  const avg = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  res.json({
    range: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    statistics: {
      totalRequests: total,
      averagePerMinute: Math.round(avg),
      peakPerMinute: max,
      minimumPerMinute: min,
      dataPoints: values.length
    },
    timestamp: new Date().toISOString()
  });
});

// NEW: /api/metrics/export - Export metrics as CSV
app.get('/api/metrics/export', (req, res) => {
  let startDate, endDate;

  if (req.query.start && req.query.end) {
    startDate = new Date(req.query.start);
    endDate = new Date(req.query.end);
  } else {
    endDate = new Date();
    startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
  }

  const data = generateMetricsForRange(startDate, endDate);

  // Generate CSV
  let csv = 'timestamp,requests\n';
  data.forEach(point => {
    csv += `${point.timestamp},${point.requests}\n`;
  });

  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="atlas-metrics-${startDate.toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});
