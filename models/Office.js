const mongoose = require('mongoose')
const PlaceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    searchTitle: {
        type: String,
        // required: true
    },
    category: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    address: {
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
    phone: {
        type: String,
        required: true
    },
    website: {
        type: String
    },
    email: {
        type: String
    },
    tags: {
        type: Array
    },
    status: {
        type: String,
        default: 'Pending'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    }],
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
    },
    guestRequirements: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GuestRequirements'
    },
    policies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Policies'
    },
    officeRules: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OfficeRules',
        required: true
    },
    bookings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Booking',
    },
    pictures: [{
        type: String,
        required: true
    }],
    popularity: {
        type: Number
    },
    availableSchedule: {
        type:[mongoose.Schema.Types.ObjectId],
        ref: 'AvailableSchedule'
    },
    status: {
        type: String //pending approve deactive
    }
})
module.exports = mongoose.model('Office', PlaceSchema)