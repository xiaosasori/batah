const {
  hashPassword,
  createToken,
  getUserId
} = require('../utils')
const bcryptjs = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const CLIENT_ID = '131089285485-c6aep24hbqq39l6ftd5mnjep5495tssc.apps.googleusercontent.com'

const guestResolver = {
  Query: {
    async getCurrentUser(_, args, { User, req }) {
      const userId = getUserId(req)
      return await User.findById(userId)
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
        return await Office.find({}).populate([{
          path: 'pricing'
        },{
          path: 'location'
        },{
          path: 'officeRules'
        }, {
          path: 'reviews'
        }])
      }
      const condition = {}
      // titile
      if(searchTerm){
        condition.title = { "$regex": searchTerm, "$options": "i" }
      }

      // area
      if(area){
        // console.log('area', area)
        const foundLocation = await Location.find({
          lat: { $gte: area.ma.from, $lte: area.ma.to },
          lng: { $gte: area.ga.from, $lte: area.ga.to }
        })
        condition.location = { $in: foundLocation }
      }

      // category
      if(category && category!=='all') condition.category = category  
      return await Office.find(condition).populate([{
        path: 'pricing'
      },{
        path: 'location'
      },{
        path: 'officeRules'
      }, {
        path: 'reviews'
      }])
    },
    async searchOfficeByFilter(_, { id, minSize, maxSize, minNumSeats, maxNumSeats, minPrice, maxPrice, amenities }, { Office, Pricing }) {
      const condition = {}
      // id
      if(id){
        condition._id = {$in: id}
      }
      // size
      if(minSize && maxSize && minSize <= maxSize) {
        condition.size = {  $gte: minSize, $lte: maxSize }
      }
      // numSeats
      if(minNumSeats && maxNumSeats && minNumSeats <= maxNumSeats) {
        condition.numSeats = {$gte: minNumSeats,  $lte:maxNumSeats }
      }
      // price
      if(minPrice && maxPrice && minPrice <= maxPrice){
        const foundPrice = await Pricing.find({basePrice: { $range: [ minPrice, maxPrice ] }}).select('_id')
        condition.pricing = foundPrice
      }
      // amentities
      if(amenities){
        condition.amenities = { $all: amenities }
      }
      return Office.find(condition)
    },
    /* guest can book in AvailablseSchedule */
    async getAvailableSchedule(_, {office, startDate, endDate},{ AvailableSchedule, BookedSchedule }){
      // get current AvailableSchedule
      console.log("Function: getAvailableSchedule");
      let currentAvailableSchedule = await AvailableSchedule.find({
        office,
        // date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
      })

      // delete slots in each day
      for(element of currentAvailableSchedule){
        // get booked slots
        // console.log("Day: "+element.date);
        let formatDate = new Date(element.date)
        formatDate.setHours(0,0,0,0)
        let nextDate = new Date(formatDate.getFullYear(), formatDate.getMonth(), formatDate.getDate()+1)
        const bookedSlots = await BookedSchedule.findOne({
          office,
          date: {"$gte": formatDate, "$lt": nextDate}
        })
        if(bookedSlots){
        console.log(new Date(element.date))
          // delete slots are booked
          console.log("date booked: "+bookedSlots.date)
          console.log("slots are booked: "+bookedSlots.slots)
          console.log("slots are availabled before: "+element.slots)
          for(element2 of bookedSlots.slots){
            if(element.slots.indexOf(element2)>=0)
              element.slots.splice(element.slots.indexOf(element2), 1)
          }
          console.log("slots are availabled after: "+element.slots)
          if(element.slots.length==0) {
            // console.log(currentAvailableSchedule.indexOf(element))
            currentAvailableSchedule.splice(currentAvailableSchedule.indexOf(element),1)
          }
        }
      }

      // console.log("AvailableSchedule result: "+currentAvailableSchedule)
      return currentAvailableSchedule
    },
    /* get all booking of a guest (logined) */
    async getBookingByGuest(_, arg,{ Booking, req }){
      console.log("Function: getBookingByGuest");
      const userId = getUserId(req)
      const currentBooking = await Booking.find({
        bookee: userId,
      }).populate([{
        path: 'payment',
        select: 'totalPrice'
      }, {
        path: 'office',
        select: 'id title pictures address',
        populate: {
          path: 'host',
          select: 'firstName lastName email phone'
        }
      }, {
        path: 'bookedSchedules',
        select: 'date slots'
      }])
      console.log(currentBooking)
      return currentBooking;
    },
    async getMessages(_,{},{Conversation,Message, req}){
      const userId = getUserId(req)
      const conversations = await Conversation.find({participants: {$in: [userId]}})
      .populate([{
        path: 'messages',
        populate: {
          path: 'from to',
          select: 'firstName lastName avatar'
        }
      }])
      return conversations
    },
  },
  Mutation: {
    async signup(_, { email, password, firstName, lastName }, { User }) {
      const user = await User.findOne({ email })
      if (user) {
        throw new Error('User already exists')
      }
      const hashedPassword = await hashPassword(password)
      const newUser = await new User({
        firstName,
        lastName,
        password: hashedPassword,
        email,
        avatar: `http://gravatar.com/avatar/${email}?d=identicon`
      }).save()
      return {
        user: newUser,
        token: createToken(newUser, '1hr')
      }
    },
    async login(_, { email, password }, { User }) {
      const user = await User.findOne({ email })
      if (!user) throw new Error('User not found')
      const isValidPassword = await bcryptjs.compare(password, user.password)
      if (!isValidPassword) throw new Error('Invalid password')
      return { user, token: createToken(user, '1hr') }
    },
    async loginGoogle(_, { token }, { User }) {
      // console.log('loginGoogle')
      const client = new OAuth2Client(CLIENT_ID)
      try {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID
        })
        const payload = ticket.getPayload()
        const email = payload['email']
        const user = await User.findOne({ email })
        if (!user) {
          const firstName = payload['given_name']
          const lastName = payload['family_name']
          const avatar = payload['picture']
          const newUser = await new User({
            email,
            firstName,
            lastName,
            avatar,
            userType: 'google'
          }).save()
          return {
            user: newUser,
            token: createToken(newUser, '1hr')
          }
        }
        return {
          user,
          token: createToken(user, '1hr')
        }
      } catch (err) {
        // console.log(err)
        throw new Error('Invalid token')
      }
    },
    updateProfile(_, { email, firstName, lastName, phone, identity, avatar }, { User, req }) {
      const userId = getUserId(req)
      const user = User.findOneAndUpdate(
        { _id: userId },
        { email, firstName, lastName, phone, identity, avatar },
        { new: true }
      )
      return user
    },
    async createReview(_, {text,cleanliness,accurracy, location, checkIn,office,user}, {User, Office, Review, req}){
      const userId = getUserId(req)
      //need to check if user has booked this
      const stars= ((cleanliness+accurracy+ location+ checkIn)/4).toFixed(2)
      const newReview =  await new Review({text,stars,cleanliness,accurracy, location, checkIn,office,user}).save()
      await Office.findOneAndUpdate({_id: office},{ $push: {reviews:{$each: [newReview._id]}} })
      const result = await Review.findById(newReview._id).populate('user','firstName lastName avatar')
      // user can only review onece per order
      return result
    },
    async createBooking(_, { bookedSchedules }, {BookedSchedule, Office,Booking, Payment, req }) {
      const userId = getUserId(req)
      let officeId = bookedSchedules.office
      let office = await Office.findById(officeId).populate('pricing')
      console.log('office', office.pricing.basePrice)
      let totalPrice = office.pricing.basePrice * bookedSchedules.slots.length
      console.log('totalPrice', totalPrice)
      let serviceFee = totalPrice * 0.1
      console.log('serviceFee', serviceFee)
      let paymentMethod = 'paypal'
      const payment = await new Payment({serviceFee, officePrice: office.pricing.basePrice,totalPrice,paymentMethod}).save()
      console.log('id',payment._id)
      const newBookedSchedule = await new BookedSchedule({
        office: officeId,
        date : new Date(bookedSchedules.date),
        slots: bookedSchedules.slots
      }).save()
      const newBooking = await new Booking({
        bookee: userId,
        office:officeId,
        bookedSchedules: newBookedSchedule._id,
        payment: payment._id
      }).save()
      return newBooking
    },
    async createBookedSchedule(_, { office, date, slots }, { BookedSchedule }) {
      const newBookedSchedule = await new BookedSchedule({
        office,
        date : new Date(date),
        slots
      }).save()
      return newBookedSchedule
    },
    async createPayment(_, { serviceFee, officePrice, numHours, paymentMethod }, { Payment }) {
      const newPayment = await new Payment({
        serviceFee,
        officePrice,
        totalPrice : officePrice * numHours * ( 1 + serviceFee/100 ),
        paymentMethod,
      }).save()
      return newPayment
    },
    async createPaymentAccount(_, { type, paypal, creditcard }, { PaymentAccount }) {
      const newPaymentAccount = await new PaymentAccount({
        type,
        paypal,
        creditcard
      }).save()
      return newPaymentAccount
    },
    async createPaypalInformation(_, { email }, { PaypalInformation }) {
      const newPaypalInformation = await new PaypalInformation({
        email
      }).save()
      return newPaypalInformation
    },
    async createCreditCardInformation(_, { cardNumber, expiresOnMonth, expiresOnYear, securityCode, fullName, country }, { CreditCardInformation }) {
      const newCreditCardInformation = await new CreditCardInformation({
        cardNumber,
        expiresOnMonth,
        expiresOnYear,
        securityCode,
        fullName,
        country
      }).save()
      return newCreditCardInformation
    },
    async createMessage(_, { to, content}, {req, User, Message, Conversation}){
      const userId = getUserId(req)
      try{
        await User.findById(to)
      }catch(err){ throw new Error('User not exist')}
      const newMessage = await new Message({from: userId, to, content}).save()
      let convo = await Conversation.findOne({participants: {$all: [userId, to]}})
      if(convo) await Conversation.updateOne({_id: convo._id},{$push: {messages: {$each: [newMessage._id]}}})
      else await new Conversation({participants: [userId, to], messages:[newMessage._id]}).save()
      return newMessage
    },
    async updateMessage(_, { id}, {req, Message}){
      const userId = getUserId(req)
      return await Message.findOneAndUpdate({_id:id},{readAt: new Date()}, { new: true })
    }
  }
}

module.exports =  guestResolver