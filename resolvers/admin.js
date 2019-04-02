const {getUserId} = require('../utils');

const adminResolver = {
  Query: {

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
    async acceptOfficeStatus(_, { office }, { Office }) {
      const currentOffice = await Office.findOneAndUpdate({
        _id: office,
        status: "pending"
      }, {
          status: "approve"
        }, { new: true })
      return currentOffice
    }
  }
}

module.exports =  adminResolver