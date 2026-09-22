const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URL = 'http://localhost:3000/oauth/callback';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

console.log('\n🔐 Gmail OAuth Token Generator');
console.log('================================\n');
console.log('1. Besøk denne URL-en:');
console.log(authUrl);
console.log('\n2. Logg inn med din Google-konto');
console.log('3. Godta tilgang til Gmail');
console.log('4. Kopier authorization code fra URL-en\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Paste authorization code her: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n✅ Success! Legg denne til i .env:\n');
    console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  rl.close();
});
