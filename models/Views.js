const mongoose = require('mongoose')
const ViewsSchema = new mongoose.Schema({
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    numView: {
        type: Number,
        default: 0,
        required: true
    },
    numBooking: {
        type: Number,
        default: 0,
        required: true
    }
})
module.exports = mongoose.model('Views', ViewsSchema)