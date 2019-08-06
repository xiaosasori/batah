const {ApolloServer, AuthenticationError } = require('apollo-server');
const mongoose = require('mongoose');
// import models
const User = require('./models/User')
const Office = require('./models/Office')
const Location = require('./models/Location')
const Pricing = require('./models/Pricing')
const OfficeRules = require('./models/OfficeRules')
const Review = require('./models/Review')
const BookedSchedule = require('./models/BookedSchedule')
const AvailableSchedule = require('./models/AvailableSchedule')
const Booking = require('./models/Booking')
const Payment = require('./models/Payment')
const PaymentAccount = require('./models/PaymentAccount')
const PaypalInformation = require('./models/PaypalInformation')
const CreditCardInformation = require('./models/CreditCardInformation')
const Conversation = require('./models/Conversation')
const Message = require('./models/Message')
const Views = require('./models/Views')
const Revenue = require('./models/Revenue')
const Notification = require('./models/Notification')
const PayoutPending = require('./models/PayoutPending')

// import models
require('dotenv').config({path: 'variables.env'})
// Import typeDefs & resolvers
// const resolvers = require('./resolvers')
const path = require('path')
const fs = require('fs')
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
const resolvers = require('./resolvers/index')
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: async ({req}) => {
      return {
      User,
      Office,
      Location,
      Pricing,
      OfficeRules,
      Review,
      BookedSchedule,
      AvailableSchedule,
      Booking,
      Payment,
      PaymentAccount,
      PaypalInformation,
      CreditCardInformation,
      Message,
      Conversation,
      Views,
      Revenue,
      PayoutPending,
      Notification,
      req
      }
  }
})
// Run
server.listen({port: process.env.PORT || 3000}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});