const {google} = require('googleapis');
const fs = require('fs');
const {authorize, getAuthorization, getAccessToken} = require('../helpers/auth');
const moment = require('moment');

const CLIENT_ID = "682460026176-v4dvfkodi0p8g8ufj4ovq5lenphdl2ni.apps.googleusercontent.com"

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
const TOKEN_PATH = 'token.json'

async function verify() {
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));

  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  console.log(userid);
  return "ey";
}

// verify().catch(console.error);

module.exports = {
	verify
}