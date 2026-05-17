const express = require('express')
const Suggestion = require('../models/Suggestion')

const router = express.Router()

router.get('/', function (req, res) {
    ; (async function () {
        try {
            var suggestions = await Suggestion.find().sort({ createdAt: -1 })
            res.json(suggestions)
        } catch (error) {
            res.status(500).json({ error: 'Unable to load suggestions.' })
        }
    })()
})

router.post('/', function (req, res) {
    ; (async function () {
        try {
            var text = req.body.text
            var author = req.body.author
            var role = req.body.role

            if (!text || !author || !role) {
                return res.status(400).json({ error: 'Text, author, and role are required.' })
            }

            var suggestion = new Suggestion({ text: text.trim(), author: author, role: role, reply: '', repliedBy: '' })

            await suggestion.save()
            res.json(suggestion)
        } catch (error) {
            res.status(500).json({ error: 'Unable to save suggestion.' })
        }
    })()
})

router.put('/:id/reply', function (req, res) {
    ; (async function () {
        try {
            var reply = req.body.reply
            var repliedBy = req.body.repliedBy

            if (!reply) {
                return res.status(400).json({ error: 'Reply text is required.' })
            }

            var suggestion = await Suggestion.findByIdAndUpdate(
                req.params.id,
                { reply: reply.trim(), repliedBy: repliedBy || 'Admin' },
                { new: true }
            )

            if (!suggestion) {
                return res.status(404).json({ error: 'Suggestion not found.' })
            }

            res.json(suggestion)
        } catch (error) {
            res.status(500).json({ error: 'Unable to save reply.' })
        }
    })()
})

module.exports = router
