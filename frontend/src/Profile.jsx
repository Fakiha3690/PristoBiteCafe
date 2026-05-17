import axios from 'axios'
import { useEffect, useState } from 'react'
import './Profile.css'

function Profile({ user, onLogout }) {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        if (!user) return

        async function fetchOrders() {
            try {
                const res = await axios.get('http://localhost:5000/api/orders', {
                    params: { customerName: user.name }
                })
                setOrders(res.data)
            } catch (err) {
                console.log(err)
            }
        }

        fetchOrders()
    }, [user])

    const totalSpent = orders
        .filter(o => !o.cancelled)
        .reduce((sum, o) => sum + (o.total || 0), 0)

    const ratedOrders = orders.filter((o) => o.rated && typeof o.rating === 'number')
    const averageRating = ratedOrders.length
        ? +(ratedOrders.reduce((sum, o) => sum + o.rating, 0) / ratedOrders.length).toFixed(1)
        : 0
    const highestRating = ratedOrders.length ? Math.max(...ratedOrders.map((o) => o.rating)) : 0

    const initials = user?.name
        ? user.name.trim().split(' ')[0][0].toUpperCase()
        : ''

    if (!user) {
        return (
            <div className="page-card">
                <p className="no-login-note">
                    Please login first to see your profile details.
                </p>
            </div>
        )
    }

    return (
        <div className="page-card profile-page">

            <h1>Profile</h1>

            {/* PROFILE HEADER */}
            <div className="profile-top-card">

                <div className="profile-circle-large">
                    {initials}
                </div>

                <h2>{user.name}</h2>

                <div className="role-badge">
                    {user.role}
                </div>
            </div>

            {/* ROLE INFO */}
            <div className="profile-info-card">
                <h3>Account Info</h3>
                <p>
                    {user.role === 'admin'
                        ? 'Manage menu, users and orders'
                        : user.role === 'faculty'
                            ? 'Faculty can order with flexible delivery/pickup'
                            : 'Student access for ordering and tracking'}
                </p>
            </div>

            {/* STATS */}
            {user.role !== 'admin' && (
                <div className="profile-stats">

                    <div className="stat-card">
                        <h4>📦 Orders</h4>
                        <p>{orders.length}</p>
                    </div>

                    <div className="stat-card">
                        <h4>💰 Spent</h4>
                        <p>Rs {totalSpent.toLocaleString()}</p>
                    </div>

                    <div className="stat-card">
                        <h4>⭐ Rating</h4>
                        {ratedOrders.length ? (
                            <>
                                <p>{averageRating} / 5</p>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', margin: '8px 0' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} style={{ color: star <= Math.round(averageRating) ? '#f5c518' : '#ccc', fontSize: '18px' }}>
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <small>{highestRating} highest rating</small>
                            </>
                        ) : (
                            <p>No ratings yet</p>
                        )}
                    </div>

                </div>
            )}

            {/* LOGOUT */}
            <div className="logout-section">
                <button
                    className="logout-btn"
                    onClick={() => {
                        if (typeof onLogout === 'function') {
                            onLogout()
                        }
                    }}
                >
                    Logout
                </button>
            </div>

        </div>
    )
}

export default Profile