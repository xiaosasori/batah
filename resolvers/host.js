const {
  getUserId,
  formatSearch,
  createPayoutPending
} = require('../utils')

const hostResolver = {
  Query: {
    async getOffices(_, args, {User, Office, req}){
      const userId = getUserId(req);
      const res = await Office.find({host: userId}).populate('reviews')
      return res
    },
    /* host can not edit booked schedule */
    async getBookedSchedule(_, {office, startDate, endDate},{ BookedSchedule }){
      console.log("Function: getBookedSchedule");
      const currentBookedSchedule = await BookedSchedule.find({
        office,
        date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
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
    async getRevenue(_, {},{ User,Revenue, Booking, PayoutPending, req }){
      const userId = getUserId(req)
      let user = await User.findById(userId).populate({
        path: 'offices',
        model: 'Office'
      })
      // console.log('user',user)
      if(user.role !== 'host') throw new Error('You have no access to this')
      const revenue = await Revenue.findOne({host: userId}) // {id,host,total, withdrawable}
      let bookings = []
      for(office of user.offices){
        console.log(office._id)
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
      console.log('booking: ', bookings)

      let payoutHistorys = await PayoutPending.find({host: userId}) // {createdAt,host,money,status}
      return {
        revenue,
        bookings,
        payoutHistorys
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
        console.log(reviews)
        return reviews
    }
  },
  Mutation: {
    async createList(_, args, { User, Office, Location, Pricing, OfficeRules, AvailableSchedule, Views, req }) {
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
      await new Views({office: savedOffice._id}).save()
      return savedOffice;
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
    async withdrawRevenue(_, {  money }, { User, Revenue, PayoutPending, req }) {
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(user.role !== 'host') throw new Error('You cannot withdraw')
      // if admin haven't accept (status = unpaid) the last request => can not withdraw
      const currentPayoutPending = await PayoutPending.find({host: userId, status: "unpaid"})
      if(!!currentPayoutPending) {
        return null
      }
      // edit Revenue (-withdrawable)
      const currentRevenue = await Revenue.findOneAndUpdate({
        host,
        withdrawable: { $gte: money } // if money > withdrawable => can not widthdraw
      }, {
          $inc: { withdrawable: - money }
        }, { new: true })

      // create PayoutPending (for admin accept)
      await createPayoutPending({ host, money })

      return currentRevenue
    },
    async createPayoutPending(_, { host, money }, { PayoutPending }) {
      const newPayoutPending = await new PayoutPending({
        host,
        money
      }).save()
      return newPayoutPending
    }
  }
};

module.exports =  hostResolver;
