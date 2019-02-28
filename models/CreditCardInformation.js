const mongoose = require('mongoose')
const CreditCardInformationSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
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
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    paymentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentAccount'
    },
})
module.exports = mongoose.model('CreditCardInformation', CreditCardInformationSchema)