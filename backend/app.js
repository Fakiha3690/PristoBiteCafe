const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 5000
const MONGO_URL =
    process.env.MONGO_URL ||
    "mongodb://localhost:27017/presto_cafe"

// ---------------- CONNECT DB ----------------
mongoose
    .connect(MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("DB Error:", err))

// ---------------- ORDER SCHEMA ----------------
const orderSchema = new mongoose.Schema(
    {
        orderId: String,
        customerName: String,
        customerPhone: String,
        paymentMethod: String,
        deliveryMethod: String,
        slot: String,
        items: Array,
        total: Number,

        status: {
            type: String,
            default: "pending",
        },

        cancelled: {
            type: Boolean,
            default: false,
        },

        cancelReason: String,

        rated: {
            type: Boolean,
            default: false,
        },

        rating: Number,
        feedback: String,
    },
    { timestamps: true }
)

const Order = mongoose.model("Order", orderSchema)

// ---------------- MENU SCHEMA ----------------
const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
    emoji: String,
})

const Menu = mongoose.model("Menu", menuSchema)

// ---------------- ROUTES ----------------

// MENU
app.get("/api/menu", async (req, res) => {
    const menu = await Menu.find()
    res.json(menu)
})

// CREATE ORDER
app.post("/api/orders", async (req, res) => {
    try {
        const order = new Order({
            ...req.body,
            orderId: "ORD" + Date.now(),
            status: "pending",
        })

        await order.save()
        res.json(order)
    } catch (err) {
        res.status(500).json({ error: "Order creation failed" })
    }
})

// GET ORDERS (by customer)
app.get("/api/orders", async (req, res) => {
    const { customerName } = req.query

    const orders = await Order.find({
        customerName,
    }).sort({ createdAt: -1 })

    res.json(orders)
})

// TRACK ORDER
app.get("/api/orders/track/:id", async (req, res) => {
    const order = await Order.findOne({ orderId: req.params.id })

    if (!order) {
        return res.status(404).json({ error: "Order not found" })
    }

    res.json(order)
})

// CANCEL ORDER
app.put("/api/orders/:id/cancel", async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ error: "Not found" })

    order.cancelled = true
    order.status = "cancelled"
    order.cancelReason = req.body.cancelReason || ""

    await order.save()

    res.json(order)
})

// RATE ORDER
app.put("/api/orders/:id/rate", async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ error: "Not found" })

    order.rated = true
    order.rating = req.body.rating
    order.feedback = req.body.feedback

    await order.save()

    res.json(order)
})

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
    console.log("Server running on port", PORT)
})