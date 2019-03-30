const mongoose = require('mongoose')
const RevenueSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    withdrawable: {
        type: Number,
        required: true
    }
})
module.exports = mongoose.model('Revenue', RevenueSchema)