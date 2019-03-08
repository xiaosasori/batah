const mongoose = require('mongoose')
const BookedScheduleSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    bookedDate: {
        type: String,
        required: true
    },
    bookedHour: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('BookedSchedule', BookedScheduleSchema)