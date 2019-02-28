const mongoose = require('mongoose')
const AvailableScheduleSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    availableDate: {
        type: String,
        required: true
    },
    availableHour: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('AvailableSchedule', AvailableScheduleSchema)