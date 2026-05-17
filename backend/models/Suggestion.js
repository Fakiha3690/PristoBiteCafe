const mongoose = require('mongoose')

const suggestionSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        author: { type: String, required: true },
        role: { type: String, required: true },
        reply: { type: String, default: '' },
        repliedBy: { type: String, default: '' }
    },
    { timestamps: true }
)

module.exports = mongoose.model('Suggestion', suggestionSchema)
