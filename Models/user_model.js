const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, minLength: 8},
    email: {type: String, required: false},
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
})

//userSchema.plugin(uniqueValidator)
module.exports = mongoose.model('User', userSchema)