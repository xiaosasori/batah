const mongoose = require('mongoose')
// const bcryptjs = require('bcryptjs')
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    password: {
        type: String,
        required: true,
        trim: true 
    },
    avatar: {
        type: String
    },
    joinDate: {
        type: Date,
        default: Date.now
    }
})

// Create and add avatar to user
UserSchema.pre('save', function(next){
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