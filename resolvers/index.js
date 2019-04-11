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
  }
}

module.exports = resolvers