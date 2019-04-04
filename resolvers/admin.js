const {getUserId} = require('../utils');

const adminResolver = {
  Query: {
    async getOfficeByStatus(_,{},{req,User, Office}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(!user || user.role!=='admin') throw new Error('You cannot access this page')
      const offices = await Office.find().select('id title address description pictures status')
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
        select: 'firstName lastName id avatar'
      }).sort('-total')
      const payouts = await PayoutPending.find().populate({
        path: 'host',
        model: 'User',
        select: 'firstName lastName id avatar'
      })
      return {
        revenue,
        total,
        bookings,
        payouts
      }
    }
  },
  Mutation: {
    async acceptPayoutPending(_, { host }, { Revenue, PayoutPending, req }) {
      // in a time, only have 1 PayoutPending for a host (see withdrawRevenue)
      const currentPayoutPending = await PayoutPending.findOneAndUpdate({
        host,
        status: "unpaid"
      }, {
          status: "paid"
        }, { new: true })
      return currentPayoutPending
    },
    async approveOffice(_, {office}, {req, User, Office}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(user.role!=='admin') throw new Error('You cannot do this action')
      try{
        return await Office.findOneAndUpdate({_id: office},{status: 'active'},{new: true})
      } catch(err){
        throw new Error('Cannot find office')
      }
    },
    async rejectOffice(_, {office}, {req, User, Office}){
      const userId = getUserId(req)
      const user = await User.findById(userId)
      if(user.role!=='admin') throw new Error('You cannot do this action')
      try{
        return await Office.findOneAndUpdate({_id: office},{status: 'deactive'},{new: true})
      } catch(err){
        throw new Error('Cannot find office')
      }
    }
  }
}

module.exports =  adminResolver