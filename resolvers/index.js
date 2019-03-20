const adminResolver =require('./admin')
const guestResolver =require('./guest')
const hostResolver =require('./host')
const officeResolver =require('./office')

const resolvers = {
  Query: {
    ...adminResolver.Query,
    ...guestResolver.Query,
    ...hostResolver.Query,
    ...officeResolver.Query
  },
  Mutation: {
    ...adminResolver.Mutation,
    ...guestResolver.Mutation,
    ...hostResolver.Mutation,
    ...officeResolver.Mutation
  }
}

module.exports = resolvers