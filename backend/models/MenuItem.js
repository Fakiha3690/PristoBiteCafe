const mongoose = require('mongoose')

const menuItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        img: { type: String, default: '' }
    },
    { timestamps: true }
)

module.exports = mongoose.model('MenuItem', menuItemSchema)
