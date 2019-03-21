const mongoose = require('mongoose')
const PaypalInformationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('PaypalInformation', PaypalInformationSchema)