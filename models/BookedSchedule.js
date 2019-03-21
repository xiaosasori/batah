const mongoose = require('mongoose')
const BookedScheduleSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    slots: {
        type: Array,
        required: true
    }
})
module.exports = mongoose.model('BookedSchedule', BookedScheduleSchema)