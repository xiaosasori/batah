const {getUserId, getDaysLeftInMonth} = require('../utils');
const hostResolver = {
  Query: {
    async getOffices(_, args, {User, Office, req}){
      const userId = getUserId(req);
      const res = await Office.find({host: userId})
      return res
    }
  },
  Mutation: {
    async createList(_, args, { User, Office, Location, Pricing, OfficeRules, req }) {
      const userId = getUserId(req);
      const newLocation = await new Location(args.location).save();
      const newPricing = await new Pricing(args.pricing).save();
      const newOfficeRules = await new OfficeRules(args.officeRules).save();

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

      const newOffice = {
        ...args,
        officeRules: newOfficeRules._id,
        location: newLocation._id,
        pricing: newPricing._id,
        availableSchedule,
        host: userId
      };

      const savedOffice = await new Office(newOffice).save();
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { offices: { $each: [savedOffice._id], $position: 0 } } }
      );
      return savedOffice;
    },
    async createAvailableSchedule(_, { date, slots }, { AvailableSchedule }) {
      const newAvailableSchedule = await new AvailableSchedule({
        date,
        slots
      }).save()
      return {
        newAvailableSchedule
      }
    }
  }
};

module.exports =  hostResolver;
