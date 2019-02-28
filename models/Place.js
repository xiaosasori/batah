const mongoose = require('mongoose')
const PlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String
    },
    shortDescription: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    numSeats: {
        type: Number,
        required: true
    },
    reviews: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Review',
        required: true
    },
    amenities: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenities',
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
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    views: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Views',
        required: true
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
        required: true
    },
    pictures: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Picture',
        required: true
    },
    popularity: {
        type: Number,
        required: true
    },
    availableSchedule: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'AvailableSchedule',
        required: true
    },
})
module.exports = mongoose.model('Place', PlaceSchema)