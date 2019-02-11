const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const createToken = (user, expiresIn) => {
  const { _id: userId, email } = user;
  return jwt.sign({ userId, email }, process.env.SECRET, { expiresIn })
}

const getUserId = (request, requireAuth = true) => {
  const token = request ? request.headers.authorization : request.connection.context.Authorization

  if (token) {
      // const token = header.replace('Bearer ', '')
      try {
        const decoded = jwt.verify(token, process.env.SECRET)
        return decoded.userId
      } catch(err){
        throw new Error('Invalid token')
      }
  }

  if (requireAuth) {
      throw new Error('Authentication required')
  } 
  
  return null
}

const hashPassword = (password) => {
    // if (password.length < 8) {
    //     throw new Error('Password must be 8 characters or longer.')
    // }

    return bcrypt.hash(password, 10)
}

module.exports = {createToken, getUserId, hashPassword}