const mongoose = require('mongoose')
const ViewsSchema = new mongoose.Schema({
    office: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Office',
        required: true
    },
    numView: {
        type: Number,
        required: true
    },
    numBooking: {
        type: Number,
        required: true
    }
})
module.exports = mongoose.model('Views', ViewsSchema)