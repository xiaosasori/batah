const mongoose = require('mongoose')
const GuestRequirementsSchema = new mongoose.Schema({
    govIssuedId: {
        type: Boolean,
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
})
module.exports = mongoose.model('GuestRequirements', GuestRequirementsSchema)