const API = process.env.API_URL || 'http://localhost:5000'

async function main() {
  try {
    // create an order
    const orderPayload = {
      customerName: 'TEST USER',
      customerPhone: '0000000000',
      paymentMethod: 'Cash on Delivery',
      deliveryMethod: 'Pickup',
      deliveryAddress: '',
      slot: '12:00 PM',
      items: [
        { menuId: 'test1', name: 'Test Item', price: 10, quantity: 1 }
      ],
      total: 10
    }

    console.log('Creating order...')
    const createRes = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })

    if (!createRes.ok) {
      console.error('Create order failed', await createRes.text())
      process.exit(2)
    }

    const order = await createRes.json()
    console.log('Order created:', order._id, order.orderId)

    // rate the order
    console.log('Rating order...')
    const rateRes = await fetch(`${API}/api/orders/${order._id}/rate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, feedback: 'Excellent' })
    })

    if (!rateRes.ok) {
      console.error('Rate failed', await rateRes.text())
      process.exit(3)
    }

    const rated = await rateRes.json()
    console.log('Rated order:', rated._id, 'rated=', rated.rated, 'rating=', rated.rating)

    // fetch the order back
    const fetchRes = await fetch(`${API}/api/orders?customerName=TEST%20USER`)
    const list = await fetchRes.json()
    console.log('Orders for TEST USER count:', list.length)

  } catch (err) {
    console.error('Test failed', err)
    process.exit(1)
  }
}

main()
