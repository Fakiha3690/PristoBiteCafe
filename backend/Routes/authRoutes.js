const express = require('express')
const crypto = require('crypto')
const User = require('../models/User')

const router = express.Router()

function mapUser(user) {
    var result = user.toObject ? user.toObject() : Object.assign({}, user)
    delete result.password
    return result
}

function md5(value) {
    return crypto.createHash('md5').update(String(value || '')).digest('hex')
}

function validateEmail(value) {
    var v = String(value || '').trim()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function validatePhone(value) {
    var v = String(value || '').trim()
    if (!v) return true
    return /^[0-9+\-\s]{7,15}$/.test(v)
}

router.post('/login', function (req, res) {
    ; (async function () {
        try {
            var email = req.body.email
            var password = req.body.password
            var role = req.body.role

            if (!email || !password || !role) {
                return res.status(400).json({ error: 'Email, password and role are required.' })
            }

            var user = await User.findOne({ email: email.toLowerCase(), role: role })

            if (!user || user.password !== md5(password)) {
                return res.status(401).json({ error: 'Invalid credentials.' })
            }

            res.json(mapUser(user))
        } catch (error) {
            res.status(500).json({ error: 'Login failed.' })
        }
    })()
})

router.post('/signup', function (req, res) {
    ; (async function () {
        try {
            var firstName = req.body.firstName
            var lastName = req.body.lastName
            var email = req.body.email
            var password = req.body.password
            var role = req.body.role
            var phone = req.body.phone

            if (!firstName || !email || !password || !role) {
                return res.status(400).json({ error: 'First name, email, password and role are required.' })
            }

            if (!validateEmail(email)) {
                return res.status(400).json({ error: 'Enter a valid email address.' })
            }

            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters.' })
            }

            if (!validatePhone(phone)) {
                return res.status(400).json({ error: 'Phone number is invalid.' })
            }

            if (role === 'admin') {
                return res.status(403).json({ error: 'Admin signup is not allowed.' })
            }

            var existing = await User.findOne({ email: email.toLowerCase() })
            if (existing) {
                return res.status(409).json({ error: 'This email is already registered.' })
            }

            var user = new User({
                name: lastName ? (firstName.trim() + ' ' + lastName.trim()).trim() : firstName.trim(),
                email: email.toLowerCase(),
                password: md5(password),
                role: role,
                phone: phone ? phone.trim() : ''
            })

            await user.save()
            res.json(mapUser(user))
        } catch (error) {
            res.status(500).json({ error: 'Signup failed.' })
        }
    })()
})

module.exports = router
