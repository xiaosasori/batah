const mongoose = require('mongoose')
const PricingSchema = new mongoose.Schema({
    monthlyDiscount: {
        type: Number
    },
    weeklyDiscount: {
        type: Number
    },
    smartPricing: {
        type: Boolean,
    },
    basePrice: {
        type: Number,
        required: true
    },
    averageWeekly: {
        type: Number,
        // required: true
    },
    averageMonthly: {
        type: Number,
        // required: true
    },
    weekendPricing: {
        type: Number
    }
})
module.exports = mongoose.model('Pricing', PricingSchema)