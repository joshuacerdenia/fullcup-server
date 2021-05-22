const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Create an OAuth2 client with credentials
function createOAuth2Client() {
  // Load client secrets from local file
  const credentials = JSON.parse(fs.readFileSync('credentials.json'));
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  return oAuth2Client;
}

function authorize() {
  const oAuth2Client = createOAuth2Client();
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) getAccessToken(oAuth2Client);
    // If token already exists, do nothing.
  });
}

// Return an oAuth2 client with given credentials.
function getAuthorization() {
  const oAuth2Client = createOAuth2Client();
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH)); // get token from local file
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

// Get and store new token after prompting for user authorization.
// @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
   });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error('Hmm...' + err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
   });
 }

module.exports = {
  authorize,
  getAuthorization,
  getAccessToken
}