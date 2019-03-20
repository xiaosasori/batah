const mongoose = require('mongoose')
const BookedScheduleSchema = new mongoose.Schema({
    bookedDate: {
        type: String,
        required: true
    },
    bookedHour: [{
        start: {
            type: String
        },
        end: {
            type: String
        }
    }]
})
module.exports = mongoose.model('BookedSchedule', BookedScheduleSchema)