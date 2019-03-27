const mongoose = require('mongoose')
const MessageSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        default: Date.now
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
    readAt: {
        type: String
    },
    content: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('Message', MessageSchema)