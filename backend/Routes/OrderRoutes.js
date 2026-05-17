const express = require('express')
const Order = require('../models/Order')
const Rating = require('../models/Rating')

const router = express.Router()

function createOrderId() {
  return 'ORD' + Date.now().toString().slice(-6)
}

router.get('/', function (req, res) {
  ; (async function () {
    try {
      var query = {}

      if (req.query.status && req.query.status !== 'all') {
        query.status = req.query.status
      }

      if (req.query.customerName) {
        query.customerName = req.query.customerName
      }

      var orders = await Order.find(query).sort({ createdAt: -1 })
      res.json(orders)
    } catch (error) {
      res.status(500).json({ error: 'Unable to load orders.' })
    }
  })()
})

router.get('/track/:orderId', function (req, res) {
  ; (async function () {
    try {
      var order = await Order.findOne({ orderId: req.params.orderId })
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' })
      }
      res.json(order)
    } catch (error) {
      res.status(500).json({ error: 'Unable to track order.' })
    }
  })()
})

router.post('/', function (req, res) {
  ; (async function () {
    try {
      var order = new Order(Object.assign({}, req.body, { orderId: createOrderId() }))
      await order.save()
      res.json(order)
    } catch (error) {
      res.status(500).json({ error: 'Unable to create order.' })
    }
  })()
})

router.put('/:id', function (req, res) {
  ; (async function () {
    try {
      var order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      res.json(order)
    } catch (error) {
      res.status(500).json({ error: 'Unable to update order.' })
    }
  })()
})

router.put('/:id/cancel', function (req, res) {
  ; (async function () {
    try {
      var order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: 'cancelled',
          cancelled: true,
          cancelReason: req.body.cancelReason || ''
        },
        { new: true }
      )

      res.json(order)
    } catch (error) {
      res.status(500).json({ error: 'Unable to cancel order.' })
    }
  })()
})

router.put('/:id/rate', function (req, res) {
  ; (async function () {
    try {
      var update = {
        rated: true,
        rating: req.body.rating,
        feedback: req.body.feedback || ''
      }
      var order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })

      if (order) {
        var rating = new Rating({
          orderId: order.orderId,
          customerName: order.customerName,
          rating: req.body.rating,
          feedback: req.body.feedback || ''
        })
        await rating.save()
      }

      res.json(order)
    } catch (error) {
      res.status(500).json({ error: 'Unable to rate order.' })
    }
  })()
})

router.delete('/:id', function (req, res) {
  ; (async function () {
    try {
      await Order.findByIdAndDelete(req.params.id)
      res.json({ success: true })
    } catch (error) {
      res.status(500).json({ error: 'Unable to delete order.' })
    }
  })()
})

router.get('/stats', function (req, res) {
  ; (async function () {
    try {
      var orders = await Order.find()

      var totalOrders = orders.length
      var revenue = 0
      var pendingOrders = 0
      var codOrders = 0
      var onlinePaid = 0
      var usersSet = new Set()

      for (var i = 0; i < orders.length; i++) {
        var ord = orders[i]
        revenue += ord.total || 0
        if (ord.status === 'pending') pendingOrders++
        if (ord.paymentMethod === 'Cash on Delivery') codOrders++
        if (ord.paymentMethod === 'Online') onlinePaid++
        if (ord.customerName) usersSet.add(ord.customerName)
      }

      var users = usersSet.size

      res.json({ totalOrders: totalOrders, revenue: revenue, pendingOrders: pendingOrders, codOrders: codOrders, onlinePaid: onlinePaid, users: users })
    } catch (error) {
      res.status(500).json({ error: 'Unable to load stats.' })
    }
  })()
})

module.exports = router
