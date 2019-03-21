const mongoose = require('mongoose')
const PaymentAccountSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String
    },
    paypal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaypalInformation'
    },
    creditcard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditCardInformation'
    },
})
module.exports = mongoose.model('PaymentAccount', PaymentAccountSchema)