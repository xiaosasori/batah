const mongoose = require('mongoose')
const AmenitiesSchema = new mongoose.Schema({
    wifi: {
        type: Boolean,
        default: false
    },
    tv: {
        type: Boolean,
        default: false
    },
    airConditioning: {
        type: Boolean,
        default: false
    },
    projector: {
        type: Boolean,
        default: false
    },
    whiteBoard: {
        type: Boolean,
        default: false
    }
})
module.exports = mongoose.model('Amenities', AmenitiesSchema)