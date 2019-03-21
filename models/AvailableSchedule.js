const mongoose = require('mongoose')
const AvailableScheduleSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    slots: {
        type: Array,
        required: true
    }
})
module.exports = mongoose.model('AvailableSchedule', AvailableScheduleSchema)