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
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    bookedSchedules: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookedSchedule',
        required: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Booking', BookingSchema)