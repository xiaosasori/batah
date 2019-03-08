const mongoose = require('mongoose')
const PlaceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    shortDescription: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        // required: true
    },
    numSeats: {
        type: Number,
        // required: true
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Review',
        required: true
    },
    amenities: {
        type: Array,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pricing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pricing',
        // required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        // required: true
    },
    views: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Views',
    },
    guestRequirements: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuestRequirements'
    },
    policies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policies'
    },
    houseRules: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HouseRules'
    },
    bookings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Booking',
    },
    pictures: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Picture',
        // required: true
    },
    popularity: {
        type: Number
    },
    availableSchedule: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'AvailableSchedule',
        // required: true
    },
})
module.exports = mongoose.model('Office', PlaceSchema)