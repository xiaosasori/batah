const {
  getUserId,
  formatSearch,
  createPayoutPending
} = require('../utils')
const moment = require('moment-timezone')

const hostResolver = {
  Query: {
    async getOffices(_, args, {Booking, Office, req}){
      const userId = getUserId(req);
      const offices = await Office.find({host: userId}).populate('reviews')
      const bookee = []
      for(let office of offices){
        let bookingInfo = await Booking.find({office:office._id}).populate([{
          path: 'bookee',
          model: 'User',
          select: 'firstName lastName avatar'
        },{
          path: 'bookedSchedules',
          select: 'date slots'
        },{
          path: 'payment',
          model: 'Payment',
          select: 'totalPrice'
        },{
          path: 'office',
          model: 'Office',
          select: '_id title'
        }]).select('createdAt firstName lastName email phone')
        
        if(bookingInfo.length){
          bookee.push(...bookingInfo)
        }
      }
      return {offices, booking:bookee}
    },
    /* host can not edit booked schedule */
    async getBookedSchedule(_, {office},{ BookedSchedule }){
      console.log("Function: getBookedSchedule");
      const currentBookedSchedule = await BookedSchedule.find({
        office,
        date: {$gte: new Date()}
      })
      return currentBookedSchedule;
    },
    /* host can view history of guest booking */
    async getBookingByHost(_, {},{ Booking, Office, req }){
      console.log("Function: getBookingByHost");

      // get offices by this host
      const hostId = getUserId(req)
      const ownOffice = await Office.find({
        host: hostId,
      })

      // get bookings by above office
      const currentBooking = await Booking.find({
        office: {$in: ownOffice}
      }).populate(['bookedSchedules bookee'])
      return currentBooking;
    },
    /* host can view total price if input office (each office earn) or not input (total price) */
    async getTotalPrice(_, {office},{ Booking, Office, req }){
      console.log("Function: getTotalPrice");

      // get offices by this host
      const hostId = getUserId(req)
      const condition = {host: hostId}
      if(office) condition._id = office
      const ownOffice = await Office.find(condition)

      // get bookings by above office
      const currentBooking = await Booking.find({
        office: {$in: ownOffice}
      }).populate('payment', 'totalPrice')
      console.log(currentBooking)
      
      // sum payments of bookings
      let sum = 0.0;
      for(element of currentBooking){
        sum+=element.payment.totalPrice
      }
      console.log("Total price: " + sum)
      return {price: sum};
    },
    async getRevenue(_, {},{  User,Revenue, Booking, PayoutPending, req }){
      console.log('getRevenue')
      const userId = getUserId(req)
      let user = await User.findById(userId).populate({
        path: 'offices',
        model: 'Office'
      })
      // console.log('user',user)
      if(user.role !== 'host') throw new Error('You have no access to this')
      const revenue = await Revenue.findOne({host: userId}) // {id,host,total, withdrawable}
      console.log(revenue)
      let bookings = []
      for(let office of user.offices){
        let booking = await Booking.find({office:office._id}).populate([{ //[]
          path: 'payment', //{id,payment:{totalPrice}, createdAt}
          model: 'Payment',
          select: 'totalPrice'
        }, {
          path: 'office',
          model: 'Office',
          select: 'title'
        }]).select('createdAt')
        bookings.push(...booking)
      }
      // console.log('booking: ', bookings)
      let payoutHistories = await PayoutPending.find({host: userId}).sort('-createdAt') // {createdAt,host,money,status}
      bookings = bookings.sort((a,b)=> a.createdAt < b.createdAt)
      return {
        revenue,
        bookings,
        payoutHistories
      }
    },
    async getVisitorReviews(_, {},{ User,Review, req }){
      const userId = getUserId(req)
      const user = await User.findById(userId).populate({path: 'offices',model:'Office',select:'_id'})
      if(user.role!=='host') throw new Error('You are not host')
        const reviews = await Review.find({office: {$in: user.offices}})
        .populate([
          {path:'user',model:'User',select: 'firstName lastName avatar'},
          {path:'office',model:'Office',select: 'title _id'}
        ])
        .select('createdAt stars pictures text')
        .sort('-createdAt')
        console.log(reviews)
        return reviews
    }
  },
  Mutation: {
    async createList(_, args, { Revenue,User, Office, Location, Pricing, OfficeRules, AvailableSchedule, Views, req }) {
      const userId = getUserId(req);
      const newLocation = await new Location(args.location).save();
      const newPricing = await new Pricing(args.pricing).save();
      const newOfficeRules = await new OfficeRules(args.officeRules).save();
      let searchTitle = formatSearch(args.title)
      const newOffice = {
        ...args,
        officeRules: newOfficeRules._id,
        location: newLocation._id,
        pricing: newPricing._id,
        host: userId,
        searchTitle
      };

      const savedOffice = await new Office(newOffice).save();
      // console.log(args.schedule)
      args.schedule.forEach(async el => await AvailableSchedule({...el,office: savedOffice._id}).save())

      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { offices: { $each: [savedOffice._id], $position: 0 } },
                  role: 'host' }
      );
      const rev=await Revenue.findOne({host: userId})
      if(!rev)
        await new Revenue({host: userId}).save()
      await new Views({office: savedOffice._id}).save()
      return savedOffice;
    },
    async updateOffice(_, args, { User, Office, Location, Pricing, OfficeRules, req }) {
      const userId = getUserId(req);
      const user = await User.findById(userId)
      if(!user || user.role!=='host') throw new Error('Not authorized')
      const officeToUpdate = await Office.findOne({_id: args.officeId})
      if(!officeToUpdate) throw new Error('Office not found')
      console.log('updateOffice')
      await Location.deleteOne({_id: officeToUpdate.location})
      await Pricing.deleteOne({_id: officeToUpdate.pricing})
      await OfficeRules.deleteOne({_id: officeToUpdate.officeRules})
      const newLocation = await new Location(args.location).save();
      const newPricing = await new Pricing(args.pricing).save();
      const newOfficeRules = await new OfficeRules(args.officeRules).save();
      let searchTitle = formatSearch(args.title)
      const newOffice = {
        ...args,
        officeRules: newOfficeRules._id,
        location: newLocation._id,
        pricing: newPricing._id,
        host: userId,
        searchTitle
      };

      const savedOffice = await Office.findOneAndUpdate({_id: args.officeId},newOffice, {new:true} )
      return savedOffice;
    },
    async updateOfficeImages(_, args, { User, Office, req }) {
      const userId = getUserId(req);
      const user = await User.findById(userId)
      if(!user || user.role!=='host') throw new Error('Not authorized')
      const officeToUpdate = await Office.findOne({_id: args.officeId})
      if(!officeToUpdate) throw new Error('Office not found')
      console.log('updateOfficeImages')

      const savedOffice = await Office.findOneAndUpdate({_id: args.officeId},{pictures:args.pictures}, {new:true} )
      return savedOffice;
    },
    async updateOfficeSchedule(_, args, { User, AvailableSchedule, Office, req }){
      const userId = getUserId(req);
      const user = await User.findById(userId)
      if(!user || user.role!=='host') throw new Error('Not authorized')
      const officeToUpdate = await Office.findOne({_id: args.officeId})
      if(!officeToUpdate) throw new Error('Office not found')
      console.log('updateOfficeSchedule')
      try{
        await AvailableSchedule.deleteMany({office: args.officeId})
        for(let item of args.schedule) {
          if(moment().startOf('day').valueOf()<Number(item.date))
            await new AvailableSchedule({date:Number(item.date),slots:item.slots,office: args.officeId}).save()
        }
        return true
      }catch{
        return false
      }
    },
    async createAvailableSchedule(_, { office, date, slots }, { AvailableSchedule }) {
      const newAvailableSchedule = await new AvailableSchedule({
        office,
        date : new Date(date),
        slots
      }).save()
      return newAvailableSchedule
    },
    async deleteAvailableSchedule(_, { office, startDate, endDate }, { AvailableSchedule }) {
      AvailableSchedule.deleteMany({
        office,
        date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
      }, function (err) {
        if (err) return false
      })
      return true
    },
    async createViews(_, { office }, {Views}){
      const newViews = await new Views({
        office,
        numView: 0,
        numBooking: 0
      }).save()
      return newViews
    },
    async withdrawRevenue(_, { paypal }, { User, Revenue, PayoutPending, req }) {
      console.log('withdraw')
      const userId = getUserId(req)
      // if admin haven't accept (status = unpaid) the last request => can not withdraw
      const currentPayoutPending = await PayoutPending.find({host: userId, status: "unpaid"})
      if(currentPayoutPending.length) {
        return null
      }
      if(paypal) await User.updateOne({_id: userId}, {paypal})
      const revenueWithdraw = await Revenue.findOne({host: userId})
      const money = revenueWithdraw.withdrawable
      console.log("money", money)
      if(money==0) return null // canot withdraw if money = 0
      // edit Revenue (-withdrawable)
      const currentRevenue = await Revenue.findOneAndUpdate({
        host: userId
      }, {
          $inc: { withdrawable: - money }
        }, { new: true })

      // create PayoutPending (for admin accept)
      const newPayout = await createPayoutPending({ host: userId, money })
        let res = {revenue: currentRevenue, payout: newPayout}
        console.log(res)
      return res
    },
    async createPayoutPending(_, { host, money }, { PayoutPending }) {
      const newPayoutPending = await new PayoutPending({
        host,
        money
      }).save()
      return newPayoutPending
    },
    // async createAcceptNotification(_, {officeId, officeName, message},{req,User,Notification}) {
    //     const userId = getUserId(req)
    //     const user = await User.findById(userId)
    //     if(user.role!=='admin') throw new Error('Your are not authorized')
    //     const newNotify = await new Notification({})
    // }
  }
};

module.exports =  hostResolver;
