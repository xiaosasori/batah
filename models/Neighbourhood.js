const mongoose = require('mongoose')
const NeighbourhoodSchema = new mongoose.Schema({
    locations: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Location',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    homePreview: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Picture'
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    featured: {
        type: Boolean,
        required: true
    },
    popularity: {
        type: Number,
        required: true
    },
})
module.exports = mongoose.model('Neighbourhood', NeighbourhoodSchema)