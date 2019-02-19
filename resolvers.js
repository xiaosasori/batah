const { hashPassword, createToken, getUserId } = require('./utils');
const bcryptjs = require('bcryptjs')
// ----------------------
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);
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
  Query: {
    async me(_, args, { User, req }) {
      const userId = getUserId(req);
      return await User.findById(userId);
    }
  },
  Mutation: {
    async signup(_, { email, password }, { User }) {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('User already exists');
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await new User({
        password: hashedPassword,
        email
      }).save();
      return {
        user: newUser,
        token: createToken(newUser, '1hr')
      };
    },
    async login(_, { email, password }, { User }) {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) throw new Error('Invalid password');
      return { user, token: createToken(user, '1hr') };
    },
    async signinUser(_, { token, type }, { User }) {
      verify(token).catch(console.error);
      return {token: type};
    }
  }
};
