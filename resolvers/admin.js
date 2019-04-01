const {getUserId} = require('../utils');

const adminResolver = {
  Query: {

  },
  Mutation: {
    async acceptPayoutPending(_, { host }, { PayoutPending }) {
      // in a time, only have 1 PayoutPending for a host (see withdrawRevenue)
      const currentPayoutPending = await PayoutPending.findOneAndUpdate({
        host
      }, {
          status: "paid"
        }, { new: true })
      return currentPayoutPending
    }
  }
}

module.exports =  adminResolver