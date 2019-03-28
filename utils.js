const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');

const createToken = (user, expiresIn) => {
  const { _id: userId, email } = user;
  return jwt.sign({ userId, email }, process.env.SECRET, { expiresIn });
};

const getUserId = (request, requireAuth = true) => {
  const token = request
    ? request.headers.authorization
    : request.connection.context.Authorization;

  if (token) {
    // const token = header.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, process.env.SECRET);
      return decoded.userId;
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  if (requireAuth) {
    throw new Error('Authentication required');
  }

  return null;
};

const hashPassword = password => {
  // if (password.length < 8) {
  //     throw new Error('Password must be 8 characters or longer.')
  // }

  return bcrypt.hash(password, 10);
};

const getDaysLeftInMonth = () => {
  let daysInMonth = moment().daysInMonth();
  let arrDays = [];

  while (daysInMonth) {
    let current = moment().date(daysInMonth);
    arrDays.unshift(current);
    daysInMonth--;
  }
  let current = moment();
  let schedule = [];
  arrDays.forEach(function(item) {
    if (item.isSameOrAfter(current)) {
      schedule.push(item)
    }
  });
  return schedule;
};

const formatSearch = (str) => {
  str = str.trim().toLowerCase()
  str = str.replace(/\s+/g, ' ')
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  return str
};

module.exports = { createToken, getUserId, hashPassword, getDaysLeftInMonth, formatSearch };
// let a = new Date()
// a.setHours(0,0,0,0)
// let b = new Date(a.getFullYear(), a.getMonth(), a.getDate()+1)
// // let b = new Date(new Date(a.getTime()+ (24 * 60 * 60 * 1000)).setHours(0,0,0,0))
// console.log(a.getDate()+ ' '+a.getHours())
// console.log(b.getDate()+' '+b.getHours())