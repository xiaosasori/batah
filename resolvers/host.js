const {getUserId, getDaysLeftInMonth} = require('../utils');
const hostResolver = {
  Query: {
    async getOffices(_, args, {User, Office, req}){
      const userId = getUserId(req);
      const res = await Office.find({host: userId}).populate('reviews')
      return res
    },
    /* host can not edit booked schedule */
    async getBookedSchedule(_, {office, startDate, endDate},{ BookedSchedule }){
      console.log("Function: getBookedSchedule");
      const currentBookedSchedule = await BookedSchedule.find({
        office,
        date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
      })
      return currentBookedSchedule;
    }
  },
  Mutation: {
    async createList(_, args, { User, Office, Location, Pricing, OfficeRules, AvailableSchedule, req }) {
      const userId = getUserId(req);
      const newLocation = await new Location(args.location).save();
      const newPricing = await new Pricing(args.pricing).save();
      const newOfficeRules = await new OfficeRules(args.officeRules).save();

      /*
      const schedule = args.schedule;
      const daysLeft = getDaysLeftInMonth();
      let availableSchedule = [];
      daysLeft.forEach(day => {
        if (day.day() === 1 && schedule.some(i => i.name === 'monday')) {
          const tmp = schedule.find(i => i.name === 'monday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 2 && schedule.some(i => i.name === 'tuesday')) {
          const tmp = schedule.find(i => i.name === 'tuesday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 3 && schedule.some(i => i.name === 'wednesday')) {
          const tmp = schedule.find(i => i.name === 'wednesday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 4 && schedule.some(i => i.name === 'thursday')) {
          const tmp = schedule.find(i => i.name === 'thursday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 5 && schedule.some(i => i.name === 'friday')) {
          const tmp = schedule.find(i => i.name === 'friday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 6 && schedule.some(i => i.name === 'saturday')) {
          const tmp = schedule.find(i => i.name === 'saturday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
        if (day.day() === 0 && schedule.some(i => i.name === 'sunday')) {
          const tmp = schedule.find(i => i.name === 'sunday');
          availableSchedule.push({ date: day, slots: tmp.availableHour });
        }
      });
      */
      const newOffice = {
        ...args,
        officeRules: newOfficeRules._id,
        location: newLocation._id,
        pricing: newPricing._id,
        host: userId
      };

      const savedOffice = await new Office(newOffice).save();
      // console.log(args.schedule)
      args.schedule.forEach(async el => await AvailableSchedule({...el,office: savedOffice._id}).save())

      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { offices: { $each: [savedOffice._id], $position: 0 } } }
      );
      return savedOffice;
    },
    async createAvailableSchedule(_, { office, date, slots }, { AvailableSchedule }) {
      const newAvailableSchedule = await new AvailableSchedule({
        office,
        date : new Date(date),
        slots
      }).save()
      return newAvailableSchedule
    },
    async deleteAvailableSchedule(_, { office, startDate, endDate }, { AvailableSchedule }) {
      AvailableSchedule.deleteMany({
        office,
        date: {$gte: new Date(startDate),  $lte: new Date(endDate) }
      }, function (err) {
        if (err) return false
      })
      return true
    }
  }
};

module.exports =  hostResolver;
