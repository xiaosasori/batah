const mongoose = require('mongoose')
const PaypalInformationSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    paymentAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentAccount',
        required: true
    },
})
module.exports = mongoose.model('PaypalInformation', PaypalInformationSchema)