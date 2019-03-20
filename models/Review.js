const mongoose = require('mongoose')
const ReviewSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    text: {
        type: String,
        required: true
    },
    stars: {
        type: Number,
        required: true
    },
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})
module.exports = mongoose.model('Review', ReviewSchema)