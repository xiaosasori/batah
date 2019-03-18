const {
  hashPassword,
  createToken,
  getUserId,
  getDaysLeftInMonth
} = require('./utils');
const bcryptjs = require('bcryptjs');
const moment = require('moment-timezone');

// ----------------------
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID =
  '131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com';
module.exports = {
  Query: {
    async getCurrentUser(_, args, { User, req }) {
      const userId = getUserId(req);
      return await User.findById(userId);
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
    updateProfile(_, { email, firstName, lastName, phone }, { User, req }) {
      const userId = getUserId(req);
      const user = User.findOneAndUpdate(
        { _id: userId },
        { email, firstName, lastName, phone },
        { new: true }
      );
      return user;
    },
    // function for host to add list
    async createList(
      _,
      args,
      { User, Office, Location, Pricing, OfficeRules, req }
    ) {
      const userId = getUserId(req);
      const newLocation = await new Location(args.location).save();
      const newPricing = await new Pricing(args.pricing).save();
      const newOfficeRules = await new OfficeRules(args.officeRules).save();

      const schedule = args.schedule;
      const daysLeft = getDaysLeftInMonth();
      let availableSchedule = [];
      daysLeft.forEach(day => {
        if (day.day() === 1 && schedule.some(i => i.name === 'monday')) {
          const tmp = schedule.find(i => i.name === 'monday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 2 && schedule.some(i => i.name === 'tuesday')) {
          const tmp = schedule.find(i => i.name === 'tuesday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 3 && schedule.some(i => i.name === 'wednesday')) {
          const tmp = schedule.find(i => i.name === 'wednesday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 4 && schedule.some(i => i.name === 'thursday')) {
          const tmp = schedule.find(i => i.name === 'thursday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 5 && schedule.some(i => i.name === 'friday')) {
          const tmp = schedule.find(i => i.name === 'friday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 6 && schedule.some(i => i.name === 'saturday')) {
          const tmp = schedule.find(i => i.name === 'saturday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 0 && schedule.some(i => i.name === 'sunday')) {
          const tmp = schedule.find(i => i.name === 'sunday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
      })

      const newOffice = {
        ...args,
        officeRules: newOfficeRules._id,
        location: newLocation._id,
        pricing: newPricing._id,
        availableSchedule,
        host: userId
      };

      const savedOffice = await new Office(newOffice).save();
      await User.findOneAndUpdate({_id: userId}, {$push: {offices: {$each: [savedOffice._id], $position: 0}}})
      return savedOffice;
    }
  }
};
