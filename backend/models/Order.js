const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderId: String,
    customerName: String,
    customerPhone: String,
    paymentMethod: String,
    deliveryMethod: String,
    deliveryAddress: String,
    status: {
        type: String,
        default: 'pending'
    },
    cancelled: {
        type: Boolean,
        default: false
    },
    cancelReason: String,
    rated: {
        type: Boolean,
        default: false
    },
    rating: Number,
    feedback: String,
    slot: String,
    items: [
        {
            menuId: String,
            name: String,
            quantity: Number,
            price: Number,
            emoji: String
        }
    ],
    total: Number,
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)