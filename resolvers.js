const { hashPassword, createToken, getUserId } = require('./utils');
const bcryptjs = require('bcryptjs');
// ----------------------
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID =
  '131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com';
// const client = new OAuth2Client(CLIENT_ID);
// async function verify(token) {
//   const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: CLIENT_ID
//   });
//   const payload = ticket.getPayload()
//   const email = payload['email']
//   const firstName = payload['given_name']
//   const lastName = payload['family_name']
//   const avatar = payload['picture']
// }
// -----------------------
module.exports = {
  Query: {
    async getCurrentUser(_, args, { User, req }) {
      const userId = getUserId(req);
      return await User.findById(userId);
    }
    //   getCurrentUser: async (_, args, { User, currentUser }) => {
    //     if (!currentUser) return null;
    //     const user = await User.findOne({
    //         username: currentUser.username
    //     }).populate({
    //         path: 'favorites',
    //         model: 'Post'
    //     });
    //     return user;
    // }
  },
  Mutation: {
    async signup(_, { email, password, firstName, lastName }, { User }) {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error('User already exists');
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await new User({
        firstName,
        lastName,
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
    async loginGoogle(_, { token }, { User }) {
      // console.log('loginGoogle')
      const client = new OAuth2Client(CLIENT_ID);
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const email = payload['email'];
        const user = await User.findOne({ email });
        if (!user) {
          const firstName = payload['given_name'];
          const lastName = payload['family_name'];
          const avatar = payload['picture'];
          const newUser = await new User({
            email,
            firstName,
            lastName,
            avatar,
            userType: 'google'
          }).save();
          return {
            user: newUser,
            token: createToken(newUser, '1hr')
          };
        }
        return {
          user,
          token: createToken(user, '1hr')
        };
      } catch (err) {
        // console.log(err);
        throw new Error('Invalid token');
      }
    },
    async signinUser(_, { token, type }, { User }) {
      verify(token).catch(console.error);
      return { token: type };
    },
    updateProfile(_, { email, firstName, lastName, phone }, { User, req }) {
      const userId = getUserId(req);
      const user = User.findOneAndUpdate(
        { _id: userId },
        { email, firstName, lastName, phone },
        { new: true }
      );
      return user;
    },
    async addList(_, args, {User, Office, req}){
      const userId = getUserId(req);
      const newOffice = {...args, host: userId}
      // console.log(newOffice)
      const savedOffice = await new Office(newOffice).save()
      return savedOffice
    }
  }
};
