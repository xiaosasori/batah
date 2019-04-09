const {
  hashPassword,
  createToken,
  getUserId,
  formatSearch,
  addViewsView, addViewsBooking, addMoneyToRevenue, getAvailableSchedule,
  createRevenue
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
    async getOffice(_, args, {Office}){
      console.log('getOffice')
      const office = await Office.findById(args.id).populate([{
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
      await addViewsView(office._id)
      return office
    },
    async searchOffice(_, { searchTerm, area, category, page }, { Office, Location }) {
      console.log("Function: searchOffice")
      const condition = {status: 'active'}
      // searchTitle
      
      console.log("searchTerm: " + searchTerm)
      if(searchTerm){
        searchTerm = formatSearch(searchTerm)
        condition.searchTitle = { "$regex": searchTerm, "$options": "i" }
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
      // search
      let pageSize = 4
      let pageNum = !!page ? page : 1
      let foundOffices = await Office.find(condition)
      .skip(pageSize * (pageNum-1))
      .limit(pageSize)
      .populate([{
        path: 'pricing'
      },{
        path: 'location'
      }, {
        path: 'reviews'
      }])
      let totalDocs =  await Office.find(condition).count()
      console.log('totalDocs',totalDocs)
      const hasMore = totalDocs > pageSize * pageNum
      console.log('found: ',foundOffices.length)
      let scheduleByOffice = null; //schedule of a office
        let result = [];
        for (office of foundOffices) { //loop over all founded offices
          // create a copy of office
          let { id, title,category, address, shortDescription,numSeats, pictures,
            tags,status,reviews,size, pricing, location} = office
          let tmp = {id, title, category,address, shortDescription,numSeats, 
            pictures,tags,reviews,size, status,pricing, location}

          let daysResult = [] // available days array of current office
          scheduleByOffice  = await getAvailableSchedule(office._id)
          for(dayAvailable of scheduleByOffice){
            daysResult.push(dayAvailable.date) //return array of day available
          }
          tmp.availableSchedule = daysResult // assign to tmp office
          result.push(tmp) // add tmp office to result
          // console.log(office.daysAvailable)
        }

        console.log('res length: ',result.length)
        return {foundOffices: result, hasMore}
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
    // top booking offices
    async topBookingOffice(_, {}, { Office, Booking, Views }) {
      let topOffices =await Views.find().sort('-numBooking').limit(10)
      let result = []
      for(el of topOffices){
        let foundOffice = await Office.findOne({_id: el.office}).populate({
          path: 'reviews',
          select: 'stars'
        }).select('id title address pictures status')
        result.push(foundOffice)
      }
      // console.log(result)
      return result
    },
    // find num office contain address
    async getNumOffice(_, { }, { Office }) { // eg: sContain = Hà Nội
      console.log("Function: findNumOffice")
      const condition = {}
      let sContain = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh']
      let results = []
      for(s of sContain){
        condition.address = { "$regex": s, "$options": "i" }
        const currentOffice = await Office.find(condition)
        results.push(currentOffice.length)
      }
      // console.log(results)
      return results
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
      }]).sort('-createdAt')
      console.log(currentBooking)
      return currentBooking;
    },
    async getInvoice(_,{bookingId}, {Booking}){
      const booking = await Booking.findById(bookingId)
      .populate([{
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
      if(!booking) throw new Error('Invoice not exist')
      return booking
    },
    async getMessages(_,{},{User, Conversation, req}){
      const userId = getUserId(req)
      console.log('getMessage')
      const conversations = await Conversation.find({participants: {$in: [userId]}})
      .populate([{
        path: 'messages',
        populate: {
          path: 'from to',
          model: 'User',
          select: 'firstName lastName avatar'
        }
      }]).sort('-createdAt')
      let res = []
      let tmp = {}
      for(let i of conversations){
        i.participants.splice(i.participants.indexOf(userId),1)
        // console.log(i.participants[0])
        i.withPerson = await User.findById(i.participants[0]).select('id firstName lastName avatar')
        tmp ={messages: i.messages, withPerson: i.withPerson, createdAt: i.createdAt,id: i._id,read:i.read}
        // console.log(tmp)
        res.push(tmp)
        // console.log(i.withPerson)
      }
      // console.log(conversations)
      return res
    },
    async addView(_,{},{User,Views, Office, Revenue, Booking}){
      /** fix host to guest*/
      // let a =await User.update({}, {role: 'guest'}, {multi:true}).where('offices').size(0)
      // console.log('user :',a)
      /** Update booking with name, phone ,email */
      const bookings = await Booking.find().populate('bookee')
      for(let booking of bookings){
        let update = {
          firstName:booking.bookee.firstName,
          lastName:booking.bookee.lastName,
          email:booking.bookee.email
        }
        // console.log(`${booking._id} ${booking.bookee.firstName} ${booking.bookee.lastName} ${booking.bookee.email}`)
        await Booking.updateOne({_id: booking._id},update, {new:true})
      }
      // console.log('addView')
      // let users = await User.find()
      // for(user of users){
      //   await new Revenue({host: user._id}).save()
      // }
      // await Office.update({}, {status: 'pending'}, {multi:true})
      // const offices = await Office.find()
      // for(o of offices){
      //   o.
      // //   // console.log(o._id)
      // //   await new Views({office: o._id}).save()
      // }
    },
    async getDashboard(_,{},{req,User, Office, Views, Notification}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      const result = {totalViews: 0, totalBooking:0, totalReviews:0}
      if(user.role==='guest') throw new Error('You have no access to this page')
      else if(user.role==='host'){
        const notifies = await Notification.find({user: userId}).populate('office').sort('-createdAt')
        result.notifies = notifies
        //get all offices of user 
        // TODO: find where status is active
        const userOffices = await Office.find({host: user._id, status: 'active'}).select('_id reviews')
        result.activeOffices =  userOffices.length
        for(office of userOffices){
          // add totalView totalBooking
          let view = await Views.findOne({office: office._id}).select('numView numBooking')
          result.totalViews += view.numView
          result.totalBooking += view.numBooking
          // add totalReviews
          result.totalReviews += office.reviews.length
        }
      }
      // console.log('res: ',result)
      return result
    },
    async canReview(_, {office}, { Office,Booking, req}){
      let canReview = false
      const userId = getUserId(req, false)
      if(userId) {
        const isHost = await Office.findOne({host: userId, _id: office})
        if(isHost) {console.log('isHost');return false;}
        let booking = await Booking.findOne({bookee: userId, office})
        if(booking) canReview = true
      }
      return canReview
    },
    async getBookmarks(_,{},{req, User}){
      const userId = getUserId(req,false)
      let officesBookmarked = await User.findById(userId).populate({
        path: 'bookmarks',
        model: 'Office',
        select: 'title address pictures',
        populate: {
          path: 'reviews',
          model: 'Review',
        }
      }).select('bookmarks')
      return officesBookmarked.bookmarks
    },
    async getUserReviews(_,{},{req, Review}){
      const userId = getUserId(req, false)
      const reviews = await Review.find({user: userId})
        .populate([
          {path:'office',model:'Office',select: 'title _id'}
        ])
        .select('createdAt stars pictures text')
        return reviews
    }
  },
  Mutation: {
    async setPassword(_, { password, confirmPassword }, { req, User }) {
      if(password !== confirmPassword) throw new Error('Password and Confirm password are not matched')
      const userId = getUserId(req)
      const user = await User.findById(userId)

      if (!user) {
        throw new Error('User not exist')
      }
      const hashedPassword = await hashPassword(password)
      const newUser = await User.findOneAndUpdate({_id: userId}, {password: hashedPassword, userType:"normal"}, {new: true})
      // create Revenue
      return newUser
    },
    async changePassword(_, {currentPassword, password, confirmPassword }, { req, User }){
      if(password !== confirmPassword) throw new Error('Password and Confirm password are not matched')

      const userId = getUserId(req)
      const user = await User.findById(userId)

      if (!user) {
        throw new Error('User not exist')
      }
      const isValidPassword = await bcryptjs.compare(currentPassword, user.password)
      if (!isValidPassword) throw new Error('Invalid password')
      
      const hashedPassword = await hashPassword(password)
      const newUser = await User.findOneAndUpdate({_id: userId}, {password: hashedPassword, userType:"normal"}, {new: true})
      // create Revenue
      console.log(newUser)
      return newUser
    },
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
      console.log('login')
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
    updateProfile(_, { email, firstName, lastName, phone, identity, avatar, address }, { User, req }) {
      const userId = getUserId(req)
      console.log('updateProfile')
      const user = User.findOneAndUpdate(
        { _id: userId },
        { email, firstName, lastName, phone, identity, avatar, address },
        { new: true }
      )
      return user
    },
    async createReview(_, {text,cleanliness,accuracy, location, checkIn,office, pictures}, {User, Office,Notification, Review,Booking, req}){
      console.log('createReview')
      const userId = getUserId(req)
      const user = await User.findById(userId)
      //TODO:need to check if user has booked this
      let booking = await Booking.find({bookee: userId, office})
      if(!booking) throw new Error('You cannot leave review to this office')
      const stars= ((cleanliness+accuracy+ location+ checkIn)/4).toFixed(2)
      const newReview =  await new Review({pictures,text,stars,cleanliness,accuracy, location, checkIn,office,user:userId}).save()
      const updatedOffice=await Office.findOneAndUpdate({_id: office},{ $push: {reviews:{$each: [newReview._id]}} })
      const result = await Review.findById(newReview._id).populate('user','firstName lastName avatar')
      //TODO: user can only review onece per order
      // create notification
      await new Notification({user:updatedOffice.host, type:'review',
          office,message:`${user.firstName} ${user.lastName} left a review ${stars} on ${updatedOffice.title}`}).save()
      console.log('result review: ',result)
      return result
    },
    async createBooking(_, { bookedSchedules }, {User,Notification,BookedSchedule, Office,Booking, Payment, req }) {
      console.log('createBooking')
      const userId = getUserId(req, false)
      if(userId) {
        const user = await User.findById(userId)
        if(!user.identity) await User.updateOne({_id:userId}, {identity})
      }
      const {firstName, lastName, email, phone, identity} = bookedSchedules
      let officeId = bookedSchedules.office
      let office = await Office.findById(officeId).populate('pricing host')
      // console.log('office', office.pricing.basePrice)
      let totalPrice = office.pricing.basePrice * bookedSchedules.slots.length
      // console.log('totalPrice', totalPrice)
      let serviceFee = totalPrice * 0.1
      // console.log('serviceFee', serviceFee)
      let paymentMethod = 'paypal'
      const payment = await new Payment({serviceFee, officePrice: office.pricing.basePrice,totalPrice,paymentMethod}).save()
      // console.log('id',payment._id)
      const newBookedSchedule = await new BookedSchedule({
        office: officeId,
        date : new Date(bookedSchedules.date),
        slots: bookedSchedules.slots
      }).save()
      console.log(`${firstName} ${lastName} ${phone} ${email}`)
      const newBooking = await new Booking({
        firstName,
        lastName,
        phone,
        email,
        bookee: userId,
        office:officeId,
        bookedSchedules: newBookedSchedule._id,
        payment: payment._id,
        identity
      }).save()

      // add View Booking
      await addViewsBooking(officeId)

      // add Revenue
      await addMoneyToRevenue({host: office.host, total: totalPrice - serviceFee, withdrawable: totalPrice - serviceFee})
      await new Notification({user:office.host, type:'booking',
          office: office._id,message:
          `${firstName} ${lastName} book slots ${bookedSchedules.slots} on ${bookedSchedules.date} - ${office.title}`}).save()

      return {id: newBooking._id, office, createdAt: newBooking.createdAt,firstName,lastName,email,phone,
        bookedSchedules:newBookedSchedule, payment: {totalPrice}}
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
      console.log('createMessage')
      const userId = getUserId(req)
      if(userId === to) throw new Error('Cannot send message')
      let receiver = await User.findById(to)
      if(!receiver) throw new Error('Cannot send message to this receiver')
      const newMessage = await new Message({from: userId, to, content}).save()
      let convo = await Conversation.findOne({participants: {$all: [userId, to]}})
      if(convo) await Conversation.updateOne({_id: convo._id},{read:false,
        createdAt: new Date(),$push: {messages: {$each: [newMessage._id]}}})
      else await new Conversation({participants: [userId, to], messages:[newMessage._id]}).save()
      return newMessage
    },
    async updateMessage(_, { id}, {req, Conversation, Message}){
      const userId = getUserId(req)
      console.log('updateMessage')
      return await Conversation.findOneAndUpdate({_id:id},{read: true}, { new: true })
    },
    async addViewsBooking(_, {office}, {Views}){
      return Views.findOneAndUpdate({office}, {$inc: {numBooking: 1}},{new: true});
    },
    async addViewsView(_, {office}, {Views}){
      return Views.findOneAndUpdate({office}, {$inc: {numView: 1}},{new: true});
    },
    async addMoneyToRevenue(_, { host, money }, { Revenue }) {
      return await Revenue.findOneAndUpdate({
        host
      }, {
          $inc: { total: money, withdrawable: money }
        }, { new: true })
    },
    async createRevenue(_, { host }, {Revenue}){
      const newRevenue = await new Revenue({
        host,
        total: 0,
        withdrawable: 0
      }).save()
      return newRevenue
    },
    bookmarkOffice: async (_, { office }, { req, Office, User }) => {
      const userId = getUserId(req, false)
      if(!userId) return 'You need to login to do this action.'
      console.log('bookmarkOff')
      // Find User, add id of post to its favorites array (which will be populated as Posts)
      try{
        const user = await User.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { bookmarks: office } },
          { new: true }
      )
      return 'Bookmark added'
      }catch(err) {return 'Cannot add bookmark :('}
  },
  unBookmarkOffice: async (_, { office }, { req, User }) => {
    const userId = getUserId(req, false)
    console.log('unbookmarkOff')

    if(!userId) return 'You need to login to do this action.'
    try{
      const user = await User.findOneAndUpdate(
          { _id: userId },
          { $pull: { bookmarks: office } },
          { new: true }
      )
      return 'Bookmark removed'
    }catch(err) {return 'Cannot remove bookmark :('}
  },
  }
}
module.exports =  guestResolver