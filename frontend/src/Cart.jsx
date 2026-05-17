import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_API_URL || ''

function Order({ user }) {

    const [menu, setMenu] = useState([])
    const [cart, setCart] = useState({})
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
    const [deliveryMethod, setDeliveryMethod] = useState('Pickup')
    const [deliveryAddress, setDeliveryAddress] = useState('')
    const [orderResponse, setOrderResponse] = useState(null)
    const [trackId, setTrackId] = useState('')
    const [trackedOrder, setTrackedOrder] = useState(null)
    const [message, setMessage] = useState('')

    const isAdmin = user?.role === 'admin'
    const isFaculty = user?.role === 'faculty'

    useEffect(() => {
        async function loadData() {
            try {
                const response = await axios.get(`${API}/api/menu`)
                setMenu(response.data)
            } catch (error) {
                console.error('Unable to load menu', error)
            }
        }

        loadData()

        const savedCart = JSON.parse(localStorage.getItem('prestoCart') || '{}')
        setCart(savedCart)

    }, [])

    useEffect(() => {
        if (user) {
            setCustomerName(user.name)
        }
    }, [user])

    function saveCart(nextCart) {
        localStorage.setItem('prestoCart', JSON.stringify(nextCart))
        setCart(nextCart)
    }

    function updateCount(itemId, delta) {
        var current = cart[itemId] || 0
        var nextCount = current + delta
        if (nextCount < 0) nextCount = 0

        var nextCart = {}
        var key
        for (key in cart) {
            if (Object.prototype.hasOwnProperty.call(cart, key)) {
                nextCart[key] = cart[key]
            }
        }

        if (nextCount === 0) {
            if (Object.prototype.hasOwnProperty.call(nextCart, itemId)) {
                delete nextCart[itemId]
            }
        } else {
            nextCart[itemId] = nextCount
        }

        saveCart(nextCart)
    }

    // build selectedItems array from menu and cart
    var selectedItems = []
    for (var i = 0; i < menu.length; i++) {
        var m = menu[i]
        if (!m) continue
        var qty = cart[m._id] || 0
        if (qty > 0) {
            selectedItems.push({
                menuId: m._id,
                name: m.name,
                price: m.price,
                quantity: qty,
            })
        }
    }

    // calculate total amount
    var totalAmount = 0
    for (var j = 0; j < selectedItems.length; j++) {
        var si = selectedItems[j]
        totalAmount += si.price * si.quantity
    }

    function handlePlaceOrder(e) {
        e.preventDefault()

        if (!customerName || !customerName.trim()) {
            setMessage('Enter name and phone number to place an order.')
            return
        }

        if (!customerPhone || !customerPhone.trim()) {
            setMessage('Enter name and phone number to place an order.')
            return
        }

        if (selectedItems.length === 0) {
            setMessage('Select at least one item first.')
            return
        }

        if (deliveryMethod === 'Delivery') {
            if (!deliveryAddress || !deliveryAddress.trim()) {
                setMessage('Enter room/building/floor for delivery.')
                return
            }
        }

        var payload = {
            customerName: customerName,
            customerPhone: customerPhone,
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
            deliveryAddress: deliveryAddress,
            slot: '12:00 PM',
            items: selectedItems,
            total: totalAmount,
        }

            ; (async function () {
                try {
                    var response = await axios.post(`${API}/api/orders`, payload)
                    setOrderResponse(response.data)
                    setMessage('Order placed successfully.')
                    saveCart({})
                } catch (err) {
                    console.error(err)
                    setMessage('Unable to create order.')
                }
            })()
    }

    function handleTrackOrder(e) {
        e.preventDefault()
        setTrackedOrder(null)
        setMessage('')

        if (!trackId || !trackId.trim()) {
            setMessage('Enter order ID.')
            return
        }

        ; (async function () {
            try {
                var response = await axios.get(`${API}/api/orders/track/${trackId}`)
                setTrackedOrder(response.data)
            } catch (err) {
                setMessage('Order not found.')
            }
        })()
    }

    if (!user) {
        return (
            <div className="page-card">
                <h2>Please login first</h2>
            </div>
        )
    }

    if (isAdmin) {
        return (
            <div className="page-card">
                <h2>Admin users cannot place orders here.</h2>
                <p>Use the admin dashboard instead.</p>
            </div>
        )
    }

    return (
        <div className="page-card order-page">

            <div className="section-header">
                <div>
                    <h1>Order & Tracking</h1>
                </div>

                <Link to="/menu" className="secondary-button">
                    Back to Menu
                </Link>
            </div>

            <div className="order-grid">

                {/* ORDER FORM */}
                <div className="order-panel">

                    <h2>Create Order</h2>

                    <label>Name</label>
                    <input
                        value={customerName}
                        onChange={function (e) { setCustomerName(e.target.value) }}
                    />

                    <label>Phone</label>
                    <input
                        value={customerPhone}
                        onChange={function (e) { setCustomerPhone(e.target.value) }}
                    />

                    <label>Payment</label>
                    <select
                        value={paymentMethod}
                        onChange={function (e) { setPaymentMethod(e.target.value) }}
                    >
                        <option>Cash on Delivery</option>
                        <option>Online</option>
                    </select>

                    <label>Delivery</label>
                    <select
                        value={deliveryMethod}
                        onChange={function (e) { setDeliveryMethod(e.target.value) }}
                    >
                        <option>Pickup</option>
                        {isFaculty && <option>Delivery</option>}
                    </select>

                    {isFaculty && deliveryMethod === 'Delivery' && (
                        <>
                            <label>Room / Building / Floor</label>
                            <input
                                value={deliveryAddress}
                                onChange={function (e) { setDeliveryAddress(e.target.value) }}
                                placeholder="Room 204, Block B, Floor 2"
                            />
                        </>
                    )}

                    {selectedItems.length === 0 ? (
                        <p style={{ marginBottom: '20px', color: '#5f5349' }}>
                            Your cart is empty. Add items from the menu and then place your order.
                        </p>
                    ) : (
                        <div>
                            {selectedItems.map((item) => (
                                <div
                                    key={item.menuId}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px',
                                        marginBottom: '12px',
                                        background: '#fff',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div>
                                        <h4 style={{ margin: '0 0 6px', fontSize: '16px' }}>{item.name}</h4>
                                        <p style={{ margin: 0, color: '#6e5a47' }}>Rs {item.price}</p>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#f4f1ed' }}
                                            onClick={function () { updateCount(item.menuId, -1) }}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#f4f1ed' }}
                                            onClick={function () { updateCount(item.menuId, 1) }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <strong>Rs {item.price * item.quantity}</strong>
                                        <br />
                                        <button
                                            style={{
                                                marginTop: '8px',
                                                background: '#c0392b',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={function () { updateCount(item.menuId, -item.quantity) }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginTop: '12px', padding: '14px', borderRadius: '14px', background: '#f8f4ef' }}>
                                <p style={{ margin: 0, color: '#5f5349' }}>Items: {selectedItems.length}</p>
                                <p style={{ margin: 4, fontWeight: '700' }}>Total: Rs {totalAmount}</p>
                            </div>
                        </div>
                    )}

                    <button onClick={function (e) { handlePlaceOrder(e) }} className="primary-button">
                        Place Order
                    </button>

                    {message && <p>{message}</p>}

                    {orderResponse && (
                        <div>
                            <h3>Order Placed</h3>
                            <p>ID: {orderResponse.orderId}</p>
                            <p>Status: {orderResponse.status}</p>
                        </div>
                    )}

                </div>

                {/* TRACK ORDER */}
                <div className="order-panel">

                    <h2>Track Order</h2>

                    <input
                        value={trackId}
                        onChange={function (e) { setTrackId(e.target.value) }}
                        placeholder="Enter Order ID"
                    />

                    <button onClick={function (e) { handleTrackOrder(e) }} className="secondary-button">
                        Track
                    </button>

                    {trackedOrder && (
                        <div>
                            <p>ID: {trackedOrder.orderId}</p>
                            <p>Status: {trackedOrder.status}</p>
                            <p>Total: {trackedOrder.total}</p>
                        </div>
                    )}

                </div>

            </div>

        </div>
    )
}

export default Order