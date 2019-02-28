const mongoose = require('mongoose')
const NotificationSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    type: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    link: {
        type: String,
        required: true
    },
    readDate: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('Notification', NotificationSchema)