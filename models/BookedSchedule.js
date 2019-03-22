const mongoose = require('mongoose')
const BookedScheduleSchema = new mongoose.Schema({
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office'
    },
    date: {
        type: Date,
        required: true
    },
    slots: {
        type: Array,
        required: true
    }
})
module.exports = mongoose.model('BookedSchedule', BookedScheduleSchema)