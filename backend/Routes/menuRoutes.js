const express = require('express')
const multer = require('multer')
const path = require('path')
const MenuItem = require('../models/MenuItem')

const uploadPath = path.join(__dirname, '..', 'uploads')
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadPath)
    },
    filename(req, file, cb) {
        const unique = Date.now() + '-' + Math.floor(Math.random() * 100000)
        const ext = path.extname(file.originalname)
        cb(null, `menu-${unique}${ext}`)
    }
})

const upload = multer({ storage })
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 })
        res.json(items)
    } catch (error) {
        res.status(500).json({ error: 'Unable to load menu items.' })
    }
})

router.post('/', upload.single('imgFile'), async (req, res) => {
    try {
        const menuItem = new MenuItem({
            name: req.body.name,
            category: req.body.category,
            price: Number(req.body.price) || 0,
            img: req.file ? `/uploads/${req.file.filename}` : req.body.img || ''
        })

        await menuItem.save()
        res.json(menuItem)
    } catch (error) {
        res.status(500).json({ error: 'Unable to add menu item.' })
    }
})

router.put('/:id', upload.single('imgFile'), async (req, res) => {
    try {
        const updates = { ...req.body }
        if (updates.price) {
            updates.price = Number(updates.price)
        }
        if (req.file) {
            updates.img = `/uploads/${req.file.filename}`
        }

        const item = await MenuItem.findByIdAndUpdate(req.params.id, updates, {
            new: true
        })

        res.json(item)
    } catch (error) {
        res.status(500).json({ error: 'Unable to update menu item.' })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete menu item.' })
    }
})

module.exports = router
