const mongoose = require('mongoose')
const ViewsSchema = new mongoose.Schema({
    lastWeek: {
        type: Number,
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
})
module.exports = mongoose.model('Views', ViewsSchema)