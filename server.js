const {ApolloServer, AuthenticationError} = require('apollo-server');
const mongoose = require('mongoose');
const User = require('./models/User')
require('dotenv').config({path: 'variables.env'})
// Import typeDefs & resolvers
const resolvers = require('./resolvers')
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
      req
    }
  }
})
// Run
server.listen(3000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});