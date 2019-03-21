const mongoose = require('mongoose')
const CreditCardInformationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    cardNumber: {
        type: String,
        required: true
    },
    expiresOnMonth: {
        type: Number,
        required: true
    },
    expiresOnYear: {
        type: Number,
        required: true
    },
    securityCode: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model('CreditCardInformation', CreditCardInformationSchema)