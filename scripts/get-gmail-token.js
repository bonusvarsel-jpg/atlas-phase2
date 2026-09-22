const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '897788626995-h2lorciapdod8pfda4e108ot6259fngr.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'http://localhost:3000/oauth/callback';

console.log('🔐 Gmail OAuth Token Generator\n');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('REDIRECT_URL:', REDIRECT_URL);

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('\n📍 Visit this URL in your browser:\n');
console.log(authUrl);
console.log('\n✓ After authorization, you will be redirected to http://localhost:3000/oauth/callback?code=...\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste the authorization code here: ', async (code) => {
  if (!code || code.trim() === '') {
    console.error('\n❌ Error: No code provided');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('\n⏳ Exchanging code for tokens...');
    const { tokens } = await oauth2Client.getToken(code.trim());
    
    if (!tokens.refresh_token) {
      console.error('\n❌ Error: No refresh_token in response');
      console.log('Response:', tokens);
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ SUCCESS!\n');
    console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\nAdd this to your .env file');
    
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    if (err.response?.data) {
      console.error('Details:', err.response.data);
    }
    rl.close();
    process.exit(1);
  }
});

rl.on('close', () => {
  process.exit(0);
});
