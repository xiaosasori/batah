const mongoose = require('mongoose')
const AmenitiesSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    wifi: {
        type: Boolean,
        required: true
    },
    smokingAllowed: {
        type: Boolean,
        required: true
    },
    partiesAndEventsAllowed: {
        type: Boolean,
        required: true
    },
    tv: {
        type: Boolean,
        required: true
    },
    airConditioning: {
        type: Boolean,
        required: true
    },
    projector: {
        type: Boolean,
        required: true
    },
    whiteBoard: {
        type: Boolean,
        required: true
    },
})
module.exports = mongoose.model('Amenities', AmenitiesSchema)