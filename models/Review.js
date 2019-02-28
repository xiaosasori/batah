const mongoose = require('mongoose')
const ReviewSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    stars: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    location: {
        type: Number,
        required: true
    },
    checkIn: {
        type: Number,
        required: true
    },
    cleanliness: {
        type: Number,
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
})
module.exports = mongoose.model('Review', ReviewSchema)