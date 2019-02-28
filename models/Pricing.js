const mongoose = require('mongoose')
const PricingSchema = new mongoose.Schema({
    place: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
        required: true
    },
    monthlyDiscount: {
        type: Number
    },
    weeklyDiscount: {
        type: Number
    },
    smartPricing: {
        type: Boolean,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    averageWeekly: {
        type: Number,
        required: true
    },
    averageMonthly: {
        type: Number,
        required: true
    },
    weekendPricing: {
        type: Number
    },
    currency: {
        type: String
    },
})
module.exports = mongoose.model('Pricing', PricingSchema)