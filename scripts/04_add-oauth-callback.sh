#!/bin/bash

# Add OAuth callback route to server.js

SERVER_FILE="$HOME/mnt/atlas-phase2/backend/server.js"

# Check if route already exists
if grep -q "oauth/callback" "$SERVER_FILE"; then
  echo "✓ OAuth callback route already exists"
  exit 0
fi

# Find the line with app.post('/webhooks/bonusshop/campaign'
# and add the OAuth route after it

sed -i '' "/app.post('\/webhooks\/bonusshop\/campaign/a\\
\\
// OAuth callback handler\\
app.get('/oauth/callback', async (req, res) => {\\
  const { code } = req.query;\\
  if (!code) {\\
    return res.status(400).json({ error: 'No authorization code provided' });\\
  }\\
  res.json({ code, message: 'Authorization code received. Paste into the terminal running get-gmail-token.js' });\\
  console.log('\\\\n✓ AUTHORIZATION CODE:', code);\\
});
" "$SERVER_FILE"

echo "✓ OAuth callback route added to server.js"
