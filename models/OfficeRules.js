const mongoose = require('mongoose')
const OfficeRulesSchema = new mongoose.Schema({
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
module.exports = mongoose.model('OfficeRules', OfficeRulesSchema)