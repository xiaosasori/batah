const mongoose = require('mongoose')
const ConversationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true
    }]
})
module.exports = mongoose.model('Conversation', ConversationSchema)