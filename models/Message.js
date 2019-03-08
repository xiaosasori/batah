const mongoose = require('mongoose')
const MessageSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveredAt: {
        type: String,
        required: true
    },
    readAt: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('Message', MessageSchema)