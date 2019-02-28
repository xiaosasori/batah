const mongoose = require('mongoose')
const CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    neighbourhoods: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Neighbourhood',
        required: true
    },
})
module.exports = mongoose.model('City', CitySchema)