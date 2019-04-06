const mongoose = require('mongoose')
const NotificationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    link: {
        type: String
    },
    message: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('Notification', NotificationSchema)