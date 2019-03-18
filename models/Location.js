const mongoose = require('mongoose')
const LocationSchema = new mongoose.Schema({
    lat: {
        type: Number/*float*/,
        required: true
    },
    lng: {
        type: Number/*float*/,
        required: true
    },
    neighbourHood: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Neighbourhood'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true
    },
    directions: {
        type: String
    },
})
module.exports = mongoose.model('Location', LocationSchema)