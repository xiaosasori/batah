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
    async getOffice(_, args, {Office, Review}){
      const office = await Office.findOne({_id: args.id}).populate([{
        path: 'pricing'
      },{
        path: 'location'
      },{
        path: 'officeRules'
      }, {
        path: 'host'
      },{
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        }
      }])
      return office
    },
    async searchOffice(_, { searchTerm, area, category }, { Office, Location }) {

      if(!searchTerm && !area){
        throw new Error('Enter at least one field!');
      }
      console.log(area)
      const condition = {};
      // titile
      if(searchTerm){
        condition.title = { "$regex": searchTerm, "$options": "i" };
      }

      // area
      if(area){
        const foundLocation = await Location.find({
          lat: { $gte: area.ga.from, $lte: area.ga.to },
          lng: { $gte: area.ma.from, $lte: area.ma.to }
        })
        condition.location = { $in: foundLocation }
      }

      // category
      if(category && category!=='all') condition.category = category;  
      return await Office.find(condition).populate([{
        path: 'pricing'
      },{
        path: 'location'
      },{
        path: 'officeRules'
      }]);
    },
    async searchOfficeByFilter(_, { id, minSize, maxSize, minNumSeats, maxNumSeats, minPrice, maxPrice, amenities }, { Office, Pricing }) {
      const condition = {};
      // id
      if(id){
        condition._id = {$in: id};
      }
      // size
      if(minSize && maxSize && minSize <= maxSize) {
        condition.size = {  $gte: minSize, $lte: maxSize };
      }
      // numSeats
      if(minNumSeats && maxNumSeats && minNumSeats <= maxNumSeats) {
        condition.numSeats = {$gte: minNumSeats,  $lte:maxNumSeats };
      }
      // price
      if(minPrice && maxPrice && minPrice <= maxPrice){
        const foundPrice = await Pricing.find({basePrice: { $range: [ minPrice, maxPrice ] }}).select('_id')
        condition.pricing = foundPrice;
      }
      // amentities
      if(amenities){
        condition.amenities = { $all: amenities };
      }
      return Office.find(condition);
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
    },
    async createReview(_, {text,stars,office,user}, {User, Office, Review, req}){
      const userId = getUserId(req)
      //need to check if user has booked this
      const newReview =  await new Review({text,stars,office,user}).save()
      await Office.findOneAndUpdate({_id: office},{ $push: {reviews:{$each: [newReview._id]}} })
      const result = await Review.findById(newReview._id).populate('user','firstName lastName avatar')
      // user can only review onece per order
      return result
    },
    async createBooking(_, { office, bookedSchedules, payment }, { Booking, req }) {
      const userId = getUserId(req);
      const newBooking = await new Booking({
        bookee: userId,
        office,
        bookedSchedules,
        payment
      }).save()
      return {
        newBooking
      }
    },
    async createBookedSchedule(_, { date, slots }, { BookedSchedule }) {
      const newBookedSchedule = await new BookedSchedule({
        date,
        slots
      }).save()
      return {
        newBookedSchedule
      }
    }
  }
}

module.exports =  guestResolver