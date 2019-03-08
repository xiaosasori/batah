const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    bookee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    bookedSchedules: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'BookedSchedule',
        required: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    }
})

module.exports = mongoose.model('Booking', BookingSchema)