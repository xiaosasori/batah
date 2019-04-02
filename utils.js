const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const Views = require('./models/Views')
const Revenue = require('./models/Revenue')
<<<<<<< HEAD
const AvailableSchedule = require('./models/AvailableSchedule')
const BookedSchedule = require('./models/BookedSchedule')
=======
const PayoutPending = require('./models/PayoutPending')
>>>>>>> 009dd0b26d69fdf283fb00f0abe7a6a858818eec

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

const addViewsView = async (office) => {
  return await Views.findOneAndUpdate({office}, {$inc: {numView: 1}},{new: true});
}

const addViewsBooking = async (office) => {
  return await Views.findOneAndUpdate({office}, {$inc: {numBooking: 1}},{new: true});
}

const addMoneyToRevenue = async ({host,total,withdrawable}) => {
  return await Revenue.findOneAndUpdate({
    host
  }, {
      $inc: { total, withdrawable }
    }, { new: true })
}

<<<<<<< HEAD
const getAvailableSchedule = async(office) => {
  // get current AvailableSchedule
  console.log("Function: getAvailableSchedule");
  let currentAvailableSchedule = await AvailableSchedule.find({
    office,
    // date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
  })
  // delete slots in each day
  for(element of currentAvailableSchedule){
    // get booked slots
    // console.log("Day: "+element.date);
    let formatDate = new Date(element.date)
    formatDate.setHours(0,0,0,0)
    let nextDate = new Date(formatDate.getFullYear(), formatDate.getMonth(), formatDate.getDate()+1)
    const bookedSlots = await BookedSchedule.findOne({
      office,
      date: {"$gte": formatDate, "$lt": nextDate}
    })
    if(bookedSlots){
    console.log(new Date(element.date))
      // delete slots are booked
      // console.log("date booked: "+bookedSlots.date)
      // console.log("slots are booked: "+bookedSlots.slots)
      // console.log("slots are availabled before: "+element.slots)
      for(element2 of bookedSlots.slots){
        if(element.slots.indexOf(element2)>=0)
          element.slots.splice(element.slots.indexOf(element2), 1)
      }
      // console.log("slots are availabled after: "+element.slots)
      if(element.slots.length==0) {
        // console.log(currentAvailableSchedule.indexOf(element))
        currentAvailableSchedule.splice(currentAvailableSchedule.indexOf(element),1)
      }
    }
  }
  // console.log("AvailableSchedule result: "+currentAvailableSchedule)
  return currentAvailableSchedule
}

module.exports = { createToken, getUserId, hashPassword, getDaysLeftInMonth, formatSearch,
  addViewsView, addViewsBooking, addMoneyToRevenue, getAvailableSchedule};
=======
const createRevenue = async({ host }) => {
  const newRevenue = await new Revenue({
    host,
    total: 0,
    withdrawable: 0
  }).save()
  return newRevenue
}

const createPayoutPending = async ({ host, money }) => {
  const newPayoutPending = await new PayoutPending({
    host,
    money
  }).save()
  return newPayoutPending
}

module.exports = { createToken, getUserId, hashPassword, getDaysLeftInMonth, formatSearch,
  addViewsView, addViewsBooking, addMoneyToRevenue, createRevenue, createPayoutPending};
>>>>>>> 009dd0b26d69fdf283fb00f0abe7a6a858818eec
// let a = new Date()
// a.setHours(0,0,0,0)
// let b = new Date(a.getFullYear(), a.getMonth(), a.getDate()+1)
// // let b = new Date(new Date(a.getTime()+ (24 * 60 * 60 * 1000)).setHours(0,0,0,0))
// console.log(a.getDate()+ ' '+a.getHours())
      // console.log(b.getDate()+' '+b.getHours())