require('dotenv').config()
const dns = require('dns')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

dns.setServers(['8.8.8.8', '1.1.1.1'])

const authRoutes = require('./Routes/authRoutes')
const menuRoutes = require('./Routes/menuRoutes')
const orderRoutes = require('./Routes/OrderRoutes')
const suggestionRoutes = require('./Routes/suggestionRoutes')

const User = require('./models/User')
const MenuItem = require('./models/MenuItem')
const Suggestion = require('./models/Suggestion')

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/presto_cafe'

const uploadPath = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadPath, { recursive: true })

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(uploadPath))

app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/suggestions', suggestionRoutes)

app.get('/', (req, res) => {
  res.send('Backend server is running')
})

const md5 = (value) =>
  require('crypto').createHash('md5').update(String(value || '')).digest('hex')

async function seedMenu() {
  const count = await MenuItem.countDocuments()
  if (count > 0) return

  const menu = [
    { name: 'Chicken Burger', category: 'Fast Food', price: 180, img: '/chicken_burger.jpg' },
    { name: 'Cold Coffee', category: 'Drinks', price: 90, img: '/chocolate%20ice%20cream.webp' },
    { name: 'Veg Roll', category: 'Fast Food', price: 120, img: '/spring%20roll.webp' },
    { name: 'Paneer Wrap', category: 'Snacks', price: 150, img: '/sandwhich.webp' },
    { name: 'Mango Shake', category: 'Drinks', price: 95, img: '/mongo%20shake.webp' },
    { name: 'French Fries', category: 'Snacks', price: 80, img: '/fries.jpg' },
    { name: 'Aalo Samosa', category: 'Snacks', price: 50, img: '/aalo_samosa.webp' },
    { name: 'ABC Juice', category: 'Drinks', price: 85, img: '/abc_juice.webp' },
    { name: 'Cheese Paratha', category: 'Breakfast', price: 120, img: '/cheese_paratha.webp' },
    { name: 'Chicken Cheese Paratha', category: 'Breakfast', price: 145, img: '/chicken_cheese_paratha.jpg' }
  ]

  await MenuItem.insertMany(menu)
  console.log('Seeded menu items')
}

async function seedUsers() {
  const count = await User.countDocuments()
  if (count > 0) return

  const users = [
    { name: 'Admin User', email: 'admin@cafe.pk', password: md5('admin123'), role: 'admin', phone: '03000000001' },
    { name: 'Dr. Ali', email: 'ali@cafe.pk', password: md5('ali123'), role: 'faculty', phone: '03011223344' },
    { name: 'Engr. Gul Saba', email: 'saba@cafe.pk', password: md5('saba123'), role: 'faculty', phone: '03055667788' },
    { name: 'Fakiha Khan', email: 'fakiha@cafe.pk', password: md5('fakiha123'), role: 'student', phone: '03099887766' }
  ]

  await User.insertMany(users)
  console.log('Seeded default users')
}

async function seedSuggestions() {
  const count = await Suggestion.countDocuments()
  if (count > 0) return
  // No default hard-coded suggestions are inserted.
}

mongoose
  .connect(MONGO_URL)
  .then(async () => {
    console.log('MongoDB connected')
    await seedMenu()
    await seedUsers()
    await seedSuggestions()

    app.listen(PORT, () => {
      console.log('Server running on port', PORT)
    })
  })
  .catch((error) => {
    console.error('Database connection failed', error)
  })
