const {
  hashPassword,
  createToken,
  getUserId
} = require('../utils');
const bcryptjs = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = '131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com';

const guestResolver = {
  Query: {
    async getCurrentUser(_, args, { User, req }) {
      const userId = getUserId(req);
      return await User.findById(userId);
    },
    async searchOffice(_, { title, location, category }, { Office, Location }) {
      if(!title && !location){
        throw new Error('Enter at least one field!');
      }
      const condtion = {};
      if(title) condtion.title = title;
      if(location) {
        const foundLocation = await Location.find(location).select('_id')
        console.log(foundLocation)
        condtion.location = foundLocation;
      }
      if(category) condtion.category = category;

      return await Office.find(condtion).populate({
        path: 'location'
      });
    },
    async getOffice(_, args, {Office}){
      const office = await Office.findOne({_id: args.id}).populate([{
        path: 'pricing'
      }, {
        path: 'officeRules'
      }, {
        path: 'location'
      }])
      return office
    }
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
        email,
        avatar: `http://gravatar.com/avatar/${email}?d=identicon`
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
    updateProfile(_, { email, firstName, lastName, phone }, { User, req }) {
      const userId = getUserId(req);
      const user = User.findOneAndUpdate(
        { _id: userId },
        { email, firstName, lastName, phone },
        { new: true }
      );
      return user;
    }
  }
}

module.exports =  guestResolver