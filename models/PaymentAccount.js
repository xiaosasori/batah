const mongoose = require('mongoose')
const PaymentAccountSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    type: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Payment',
        required: true
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