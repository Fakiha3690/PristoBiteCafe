import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './MyOrders.css'

const API = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_API_URL || ''

// simple helper - backend status to display text
function getDisplayStatus(order) {
    if (order.cancelled) return 'Cancelled'
    const s = (order.status || 'pending').toLowerCase()
    if (s === 'ready') return 'Ready'
    if (s === 'preparing') return 'Preparing'
    return 'Pending'
}

function formatOrderTime(dateString) {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    if (isToday) return `Today, ${time}`
    if (isYesterday) return `Yesterday, ${time}`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + time
}

function FilterTabs({ filter, setFilter }) {
    const tabs = [
        { id: 'all', label: '📋 All Orders' },
        { id: 'active', label: '⚡ Active' },
        { id: 'completed', label: '✅ Completed' },
    ]

    return (
        <div className="tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    className={`tab ${filter === tab.id ? 'active' : ''}`}
                    onClick={() => setFilter(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

function OrderCard({ order, onReorder, onCancel, onRate }) {
    const steps = ['Pending', 'Preparing', 'Ready']
    const status = getDisplayStatus(order)
    const stepIndex = order.cancelled ? -1 : steps.indexOf(status)
    const canCancel = !order.cancelled && (status === 'Pending' || status === 'Preparing')

    const getStatusClass = () => {
        if (order.cancelled) return 'status-cancelled'
        if (status === 'Pending') return 'status-pending'
        if (status === 'Preparing') return 'status-preparing'
        return 'status-ready'
    }

    const getStatusText = () => {
        if (order.cancelled) return '❌ Cancelled'
        if (status === 'Ready') return '✅ Ready'
        if (status === 'Preparing') return '⚙️ Preparing'
        return '⏳ Pending'
    }

    const isCod = order.paymentMethod === 'Cash on Delivery'

    return (
        <div className="order-card">
            <div className="order-header">
                <div>
                    <div className="order-id">{order.orderId}</div>
                    <div className="order-time">
                        <span>🕐 {order.timeLabel}</span>
                        <span>⏰ Slot: {order.slot || '—'}</span>
                        <span className={`payment-badge ${isCod ? 'payment-cod' : 'payment-online'}`}>
                            {isCod ? '💵 Cash on Delivery' : '💳 Online Payment'}
                        </span>
                    </div>
                </div>
                <span className={`status-badge ${getStatusClass()}`}>{getStatusText()}</span>
            </div>

            {!order.cancelled && (
                <div className="tracker">
                    {steps.map((step, i) => (
                        <span key={step} style={{ display: 'contents' }}>
                            {i > 0 && <div className={`track-line ${i <= stepIndex ? 'done' : ''}`} />}
                            <div className="track-step">
                                <div className={`track-circle ${i < stepIndex ? 'done' : i === stepIndex ? 'active' : ''}`}>
                                    {i < stepIndex ? '✓' : i + 1}
                                </div>
                                <div className="track-label">{step}</div>
                            </div>
                        </span>
                    ))}
                </div>
            )}

            <div className="order-items">
                {order.items.map((item, idx) => (
                    <span key={idx} className="item-chip">
                        {item.emoji || '🍽️'} {item.name} × {item.quantity}
                    </span>
                ))}
            </div>

            <div className="order-footer">
                <div className="order-total">₨ {order.total}</div>
                <div className="button-group">
                    <button type="button" className="btn btn-outline" onClick={() => onReorder(order)}>
                        ⟳ Reorder
                    </button>
                    {canCancel && (
                        <button type="button" className="btn btn-danger" onClick={() => onCancel(order)}>
                            ✕ Cancel
                        </button>
                    )}
                    {status === 'Ready' && !order.rated && !order.cancelled && (
                        <button type="button" className="btn btn-primary" onClick={() => onRate(order)}>
                            ★ Rate
                        </button>
                    )}
                    {order.rated && <span className="rated-text">✓ Rated</span>}
                </div>
            </div>
        </div>
    )
}

function CancelModal({ isOpen, onClose, onConfirm }) {
    const [reason, setReason] = useState('')

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Cancel Order?</h3>
                <p>This action cannot be undone. The order will be cancelled immediately.</p>
                <textarea
                    placeholder="Reason for cancellation (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                />
                <div className="modal-buttons">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Keep Order
                    </button>
                    <button
                        type="button"
                        className="btn-confirm-danger"
                        onClick={() => {
                            onConfirm(reason)
                            setReason('')
                        }}
                    >
                        Yes, Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

function RatingModal({ isOpen, onClose, onSubmit }) {
    const [rating, setRating] = useState(0)
    const [feedback, setFeedback] = useState('')

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating ⭐')
            return
        }
        onSubmit(rating, feedback)
        setRating(0)
        setFeedback('')
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Rate Your Order ⭐</h3>
                <p>How was your experience?</p>
                <div className="star-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${rating >= star ? 'lit' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <textarea
                    placeholder="Share your feedback (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                />
                <div className="modal-buttons">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Skip
                    </button>
                    <button type="button" className="btn-confirm" onClick={handleSubmit}>
                        Submit Rating
                    </button>
                </div>
            </div>
        </div>
    )
}

function Toast({ message, visible }) {
    return <div className={`toast ${visible ? 'show' : ''}`}>{message}</div>
}

function MyOrders({ user }) {
    const [orders, setOrders] = useState([])
    const [filter, setFilter] = useState('all')
    const [cancelModalOpen, setCancelModalOpen] = useState(false)
    const [ratingModalOpen, setRatingModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [toast, setToast] = useState({ message: '', visible: false })
    const [loading, setLoading] = useState(true)

    const showToast = (message) => {
        setToast({ message, visible: true })
        setTimeout(() => setToast({ message: '', visible: false }), 2500)
    }

    const loadOrders = useCallback(async (showLoading = false) => {
        if (!user) return
        try {
            if (showLoading) setLoading(true)
            const response = await axios.get(`${API}/api/orders`, {
                params: { customerName: user.name },
            })
            const list = response.data.map((o) => ({
                ...o,
                timeLabel: formatOrderTime(o.createdAt),
            }))
            setOrders(list)
        } catch (error) {
            console.error('Could not load orders', error)
            showToast('Could not load orders')
        } finally {
            if (showLoading) setLoading(false)
        }
    }, [user])

    useEffect(() => {
        async function fetchOrders() {
            await loadOrders(true)
        }
        fetchOrders()
        const interval = setInterval(() => {
            loadOrders()
        }, 3000)
        return () => clearInterval(interval)
    }, [loadOrders])

    const handleReorder = (order) => {
        const itemsList = order.items
            .map((i) => `${i.emoji || '🍽️'} ${i.name} x${i.quantity}`)
            .join(', ')
        showToast(`🛒 Added to cart: ${itemsList}`)
    }

    const handleCancelClick = (order) => {
        setSelectedOrder(order)
        setCancelModalOpen(true)
    }

    const handleConfirmCancel = async (reason) => {
        if (!selectedOrder) return
        try {
            await axios.put(`${API}/api/orders/${selectedOrder._id}/cancel`, {
                cancelReason: reason,
            })
            await loadOrders()
            showToast(`❌ Order ${selectedOrder.orderId} cancelled`)
            setCancelModalOpen(false)
            setSelectedOrder(null)
        } catch (error) {
            console.error(error)
            showToast('Cancel failed')
        }
    }

    const handleRateClick = (order) => {
        setSelectedOrder(order)
        setRatingModalOpen(true)
    }

    const handleSubmitRating = async (rating, feedback) => {
        if (!selectedOrder) return
        try {
            await axios.put(`${API}/api/orders/${selectedOrder._id}/rate`, {
                rating,
                feedback,
            })
            await loadOrders()
            showToast('⭐ Thanks for your rating!')
            setRatingModalOpen(false)
            setSelectedOrder(null)
        } catch (error) {
            console.error(error)
            showToast('Rating failed')
        }
    }

    let filteredOrders = [...orders]
    if (filter === 'all') {
        filteredOrders = filteredOrders.filter((o) => {
            const s = getDisplayStatus(o)
            return s !== 'Ready'
        })
    } else if (filter === 'active') {
        filteredOrders = filteredOrders.filter((o) => {
            const s = getDisplayStatus(o)
            return s === 'Pending' || s === 'Preparing'
        })
    } else if (filter === 'completed') {
        filteredOrders = filteredOrders.filter((o) => {
            const s = getDisplayStatus(o)
            return s === 'Ready'
        })
    }

    const totalOrders = orders.length
    const activeOrders = orders.filter((o) => {
        const s = getDisplayStatus(o)
        return s !== 'Ready' && s !== 'Cancelled'
    }).length
    const totalSpent = orders.filter((o) => !o.cancelled).reduce((sum, o) => sum + (o.total || 0), 0)

    if (!user) {
        return (
            <div className="my-orders-page page-card">
                <div className="login-note">
                    <h2>📋 My Orders</h2>
                    <p>Please login first to see your orders.</p>
                    <Link to="/login" className="primary-button">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <div className="header">
                    <h1>
                        <span>📋</span> My Orders
                    </h1>
                    <div className="stats">
                        <div className="stat-badge">
                            <strong>{totalOrders}</strong> Total
                        </div>
                        <div className="stat-badge">
                            <strong>{activeOrders}</strong> Active
                        </div>
                        <div className="stat-badge">
                            <strong>₨{totalSpent.toLocaleString()}</strong> Spent
                        </div>
                    </div>
                </div>

                <FilterTabs filter={filter} setFilter={setFilter} />

                {loading && <p>Loading orders...</p>}

                {!loading && filteredOrders.length === 0 && (
                    <div className="empty-state">
                        <span className="icon">📭</span>
                        <h3>No orders found</h3>
                        <p>
                            {filter === 'all' && "You haven't placed any orders yet"}
                            {filter === 'active' && 'No active orders'}
                            {filter === 'completed' && 'No completed orders'}
                        </p>
                    </div>
                )}

                {!loading &&
                    filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onReorder={handleReorder}
                            onCancel={handleCancelClick}
                            onRate={handleRateClick}
                        />
                    ))}

                <CancelModal
                    isOpen={cancelModalOpen}
                    onClose={() => setCancelModalOpen(false)}
                    onConfirm={handleConfirmCancel}
                />

                <RatingModal
                    isOpen={ratingModalOpen}
                    onClose={() => setRatingModalOpen(false)}
                    onSubmit={handleSubmitRating}
                />

                <Toast message={toast.message} visible={toast.visible} />
            </div>
        </div>
    )
}

export default MyOrders
