const mongoose = require('mongoose')
const RevenueSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total: {
        type: Number,
        default: 0
    },
    withdrawable: {
        type: Number,
        default: 0
    }
})
module.exports = mongoose.model('Revenue', RevenueSchema)