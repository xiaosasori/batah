const mongoose = require('mongoose')
const HouseRulesSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    },
    smokingAllowed: {
        type: Boolean
    },
    partiesAndEventsAllowed: {
        type: Boolean
    },
    additionalRules: {
        type: String
    },
})
module.exports = mongoose.model('HouseRules', HouseRulesSchema)