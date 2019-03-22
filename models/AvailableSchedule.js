const mongoose = require('mongoose')
const AvailableScheduleSchema = new mongoose.Schema({
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office'
    },
    schedule:[{
        date: {
            type: Date,
            required: true
        },
        slots: {
            type: Array,
            required: true
        }
    }]
})
module.exports = mongoose.model('AvailableSchedule', AvailableScheduleSchema)