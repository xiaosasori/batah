const mongoose = require('mongoose')
const PoliciesSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    },
    checkInStartTime: {
        type: Number/*float*/,
        required: true
    },
    checkInEndTime: {
        type: Number/*float*/,
        required: true
    },
    checkoutTime: {
        type: Number/*float*/,
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
})
module.exports = mongoose.model('Policies', PoliciesSchema)