const {getUserId} = require('../utils');

const adminResolver = {
  Query: {
    async getOfficeByStatus(_,{},{req,User, Office}){
      console.log('getOfficeByStatus')
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(!user || user.role!=='admin') throw new Error('You cannot access this page')
      const offices = await Office.find()
      .populate({
        path: 'host',
        model: 'User',
        select: '_id firstName lastName'
      })
      .select('id title address description pictures status')
      const active = offices.filter(office => office.status==='active')
      const pending = offices.filter(office => office.status==='pending')
      const deactive = offices.filter(office => office.status==='deactive')
      return {active, pending, deactive}
    },
    async getAdminRevenue(_,{},{req,User, Revenue, Booking, PayoutPending}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(!user || user.role!=='admin') throw new Error('You cannot access this page')
      let total = await Revenue.aggregate([{$group: {_id:null,sum:{$sum: "$total"}}}])
      total = total[0].sum
      const bookings = await Booking.find().count()
      const revenue = await Revenue.find().populate({
        path: 'host',
        model: 'User',
        select: 'firstName lastName id avatar',
        populate: {
          path: 'offices',
          model: 'Office'
        }
      }).sort('-total')
      const payouts = await PayoutPending.find().populate({
        path: 'host',
        model: 'User',
        select: 'firstName lastName id avatar paypal'
      }).sort('-createdAt')
      let paid =await PayoutPending.aggregate([{$match: {status: 'paid'}},{$group: {_id:null,sum:{$sum: "$money"}}}])
      console.log('paid',paid)
      //host earning
      let hostEarnings = []
      // console.log(revenue.user)
      for(let rev of revenue){
        // console.log(rev.host.offices)
        let userId = rev.host._id
        for(let office of rev.host.offices) {console.log(office._id)
          let book = await Booking.find({office:office._id}).populate([{ //[]
            path: 'payment', //{id,payment:{totalPrice}, createdAt}
            model: 'Payment',
            select: 'totalPrice'
          }, {
            path: 'office',
            model: 'Office',
            select: 'title',
            populate: {
              path: 'host',
              model: 'User'
            }
          }]).select('createdAt')
          hostEarnings.push(...book)
        }
      }
      hostEarnings = hostEarnings.sort((a,b)=> a.createdAt < b.createdAt)
      return {
        revenue,
        total,
        bookings,
        payouts,
        balance: paid.length>0?paid[0].sum : 0,
        hostEarnings
      }
    }
  },
  Mutation: {
    async acceptPayoutPending(_, { payoutId }, { User, PayoutPending, req }) {
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(!user) throw new Error('User not exist')
      if(user.role!=='admin') throw new Error('Not authorized!')
      // in a time, only have 1 PayoutPending for a host (see withdrawRevenue)
      const currentPayoutPending = await PayoutPending.findOneAndUpdate({
        _id: payoutId,
        status: "unpaid"
      }, {
          status: "paid",
          createdAt: new Date()
        }, { new: true })
      return currentPayoutPending
    },
    async approveOffice(_, {office}, {req, User, Office, Notification}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(user.role!=='admin') throw new Error('You cannot do this action')
      try{
        const updatedOffice=await Office.findOneAndUpdate({_id: office},
          {status: 'active'},{new: true})
        await new Notification({user:updatedOffice.host, type:'accept',
          office,message:`Your office ${updatedOffice.title} has been accepted`}).save()
          return updatedOffice

      } catch(err){
        throw new Error('Cannot find office')
      }
    },
    async rejectOffice(_, {office}, {req, User, Office, Notification}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(user.role!=='admin') throw new Error('You cannot do this action')
      try{
        const updatedOffice = await Office.findOneAndUpdate({_id: office},{status: 'deactive'},{new: true})
        await new Notification({user:updatedOffice.host,type:'accept',
          office,message:`Your office ${updatedOffice.title} has been rejected`}).save()
          return updatedOffice
      } catch(err){
        throw new Error('Cannot find office')
      }
    }
  }
}

module.exports =  adminResolver