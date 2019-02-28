const mongoose = require('mongoose')
// const bcryptjs = require('bcryptjs')
const UserSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    ownedPlaces: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Place',
        required: true
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    },
    bookings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Booking',
        required: true
    },
    paymentAccount: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'PaymentAccount',
        required: true
    },
    sentMessages: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Message',
        required: true
    },
    receivedMessages: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Message',
        required: true
    },
    notifications: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Notification',
        required: true
    },
    profilePicture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Picture'
    },
})

// Create and add avatar to user
UserSchema.pre('save', function (next) {
    this.avatar = `http://gravatar.com/avatar/${this.username}?d=identicon`
    next()
})

// Hash password so it can't be seen w/ access to database
// UserSchema.pre('save', function(next){
//     if(!this.isModified('password')){
//         return next()
//     }
//     bcryptjs.genSalt(10, (err, salt) => {
//         if(err) return next(err)
//         bcryptjs.hash(this.password, salt, (err, hash) => {
//             if(err) return next()
//             this.password = hash
//             next()
//         })
//     })
// })

module.exports = mongoose.model('User', UserSchema)