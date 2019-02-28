const {ApolloServer, AuthenticationError} = require('apollo-server')
const mongoose = require('mongoose')
const User = require('./models/User')
const Place = require('./models/Place')
const Pricing = require('./models/Pricing')
const GuestRequirements = require('./models/GuestRequirements')
const Policies = require('./models/Policies')
const HouseRules = require('./models/HouseRules')
const Views = require('./models/Views')
const Location = require('./models/Location')
const Neighbourhood = require('./models/Neighbourhood')
const City = require('./models/City')
const Picture = require('./models/Picture')
const Amenities = require('./models/Amenities')
const Review = require('./models/Review')
const AvailableSchedule = require('./models/AvailableSchedule')
const BookedSchedule = require('./models/BookedSchedule')
const Booking = require('./models/Booking')
const Payment = require('./models/Payment')
const PaymentAccount = require('./models/PaymentAccount')
const PaypalInformation = require('./models/PaypalInformation')
const CreditCardInformation = require('./models/CreditCardInformation')
const Message = require('./models/Message')
const Notification = require('./models/Notification')

require('dotenv').config({path: 'variables.env'})
// Import typeDefs & resolvers
const resolvers = require('./resolvers/resolvers')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const filePath = path.join(__dirname, 'typeDefs.gql')
const typeDefs = fs.readFileSync(filePath, 'utf-8')
// Parse ObjectId
const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function () {
  return this.toString();
};
// Connect to mlab database
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true,  useCreateIndex: true })
    .then(()=>console.log(`DB connected`))
    .catch(err => console.log('Connect MongoDB error:',err))
// Create graphql server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({req}) => {
    return {
      User,
      req// request token
    }
  }
})
// Run
server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});