const mongoose = require('mongoose')
const PayoutPendingSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    money: {
        type: Number,
        required: true
    },
    status: {
        type: String, //paid unpaid
        default: "unpaid"
    }
})
module.exports = mongoose.model('PayoutPending', PayoutPendingSchema)