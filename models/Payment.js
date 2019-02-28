const mongoose = require('mongoose')
const PaymentSchema = new mongoose.Schema({
    createdAt: {
        type: String,
        required: true
    },
    serviceFee: {
        type: Number/*float*/,
        required: true
    },
    placePrice: {
        type: Number/*float*/,
        required: true
    },
    totalPrice: {
        type: Number/*float*/,
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    paymentMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentAccount',
        required: true
    },
})
module.exports = mongoose.model('Payment', PaymentSchema)