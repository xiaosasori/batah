const { hashPassword, createToken, getUserId } = require('../utils');
const bcryptjs = require('bcryptjs')
const Query = require('./Query')
const Mutation = require('./Mutation')
// ----------------------
const {OAuth2Client} = require('google-auth-library')
const CLIENT_ID = "131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID)
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
}
// -----------------------
module.exports = {
  Query,
  Mutation
};
