const mongoose = require('mongoose')
const PictureSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('Picture', PictureSchema)