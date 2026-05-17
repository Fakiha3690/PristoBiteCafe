const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
    orderId: String,
    customerName: String,
    rating: Number,
    feedback: String,
    ratedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Rating', ratingSchema)
