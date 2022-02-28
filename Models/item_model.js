const mongoose = require('mongoose')
//const uniqueValidator = require('mongoose-unique-validator')

const Schema = mongoose.Schema

const delivery = ["Pickup","Shipping"]

const itemSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    location: {type:String, required: true},
    images: {type: Array, required: true},
    price: {type: String, required: true},
    postingDate: {type: Date, required: true},
    deliveryType: {type: String, enum: delivery, required: true},
    seller: { type: Schema.Types.ObjectId, ref: 'User'}
})

//itemSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Item', itemSchema)