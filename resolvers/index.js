const adminResolver =require('./admin')
const guestResolver =require('./guest')
const hostResolver =require('./host')

const resolvers = {
  Query: {
    ...adminResolver.Query,
    ...guestResolver.Query,
    ...hostResolver.Query
  },
  Mutation: {
    ...adminResolver.Mutation,
    ...guestResolver.Mutation,
    ...hostResolver.Mutation
  },
  Subscription: {
    notification: {
      async subscribe(parent, {userId}, { User, pubsub }, info) {
        const user = User.findById(userId)
        if(!user) throw new Error('User not found')
        return pubsub.asyncIterator(`notification on ${userId}`)
      }
    } 
  }
}

module.exports = resolvers