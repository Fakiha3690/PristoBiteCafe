import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'   // FIX: single source (optional but safe)

function Admin({ user }) {
    const [stats, setStats] = useState({})
    const [orders, setOrders] = useState([])
    const [menuItems, setMenuItems] = useState([])
    const [filter, setFilter] = useState('all')
    const [newItem, setNewItem] = useState({ name: '', category: '', price: 0, img: '' })
    const [newImageFile, setNewImageFile] = useState(null)
    const [addMessage, setAddMessage] = useState('')
    const [imageInputKey, setImageInputKey] = useState(Date.now())

    const getImageUrl = (src) => {
        if (!src) return ''
        if (src.startsWith('http')) return src
        if (src.startsWith('/uploads/')) return `${API}${src}`   // FIX
        return src
    }

    useEffect(() => {
        if (user?.role === 'admin') {
            loadStats()
            loadOrders()
            loadMenu()
        }
    }, [user])

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API}/api/orders/stats`)  // FIX
            setStats(response.data)
        } catch (error) {
            console.error('Unable to load stats', error)
        }
    }

    const loadOrders = async (nextFilter = filter) => {
        try {
            const url = `${API}/api/orders${nextFilter !== 'all' ? `?status=${nextFilter}` : ''}` // FIX
            const response = await axios.get(url)
            setOrders(response.data)
        } catch (error) {
            console.error('Unable to load orders', error)
        }
    }

    const loadMenu = async () => {
        try {
            const response = await axios.get(`${API}/api/menu`) // FIX
            setMenuItems(response.data)
        } catch (error) {
            console.error('Unable to load menu', error)
        }
    }

    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${API}/api/orders/${id}`, { status })
            await loadOrders()
            await loadStats()
        } catch (error) {
            console.error('Unable to update order', error)
        }
    }

    const deleteOrder = async (id) => {
        try {
            await axios.delete(`${API}/api/orders/${id}`)
            await loadOrders()
            await loadStats()
        } catch (error) {
            console.error('Unable to delete order', error)
        }
    }

    const deleteMenuItem = async (id) => {
        try {
            await axios.delete(`${API}/api/menu/${id}`)
            await loadMenu()
        } catch (error) {
            console.error('Unable to delete menu item', error)
        }
    }

    const saveMenuItem = async (item) => {
        try {
            await axios.put(`${API}/api/menu/${item._id}`, item)
            await loadMenu()
        } catch (error) {
            console.error('Unable to save menu item', error)
        }
    }

    const addMenuItem = async (e) => {
        e.preventDefault()
        if (!newItem.name || !newItem.category || newItem.price <= 0) return

        try {
            const formData = new FormData()
            formData.append('name', newItem.name)
            formData.append('category', newItem.category)
            formData.append('price', newItem.price.toString())

            if (newImageFile) {
                formData.append('imgFile', newImageFile)
            }

            await axios.post(`${API}/api/menu`, formData) // FIX

            setNewItem({ name: '', category: '', price: 0, img: '' })
            setNewImageFile(null)
            setAddMessage('Item added successfully.')
            setImageInputKey(Date.now())
            await loadMenu()
        } catch (error) {
            console.error('Unable to add item', error)
        }
    }

    if (user?.role !== 'admin') {
        return (
            <div className="page-card">
                <h1>Admin Area</h1>
                <p>You need to login as Admin to view this page.</p>
            </div>
        )
    }

    return (
        <div className="page-card admin-page">
            {/* ❗ NO CHANGE IN JSX OR CLASSNAMES */}
            <div className="section-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage orders, revenue, menu items, and track customer activity.</p>
                </div>
            </div>

            <div className="admin-grid stats-grid">
                <div className="stat-card">
                    <h3>Total Orders</h3>
                    <p>{stats.totalOrders || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Revenue</h3>
                    <p>Rs {stats.revenue || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Pending Orders</h3>
                    <p>{stats.pendingOrders || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Users</h3>
                    <p>{stats.users || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>COD Orders</h3>
                    <p>{stats.codOrders || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Online Paid</h3>
                    <p>{stats.onlinePaid || 0}</p>
                </div>
            </div>

            <div className="section-header">
                <div>
                    <h2>Live Orders</h2>
                    <p>Filter orders by status and update the customer workflow.</p>
                </div>
            </div>

            <div className="order-filter-row">
                {['all', 'pending', 'preparing', 'ready'].map((status) => (
                    <button
                        key={status}
                        type="button"
                        className={filter === status ? 'filter-button active' : 'filter-button'}
                        onClick={async () => {
                            setFilter(status)
                            await loadOrders(status)
                        }}
                    >
                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            <div className="admin-grid order-grid">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-card-head">
                            <div>
                                <strong>{order.orderId}</strong>
                                <p>{order.customerName}</p>
                            </div>
                            <div className={`status-chip status-${order.status}`}>{order.status}</div>
                        </div>
                        <p>Rs {order.total}</p>
                        <p>{order.paymentMethod} • {order.deliveryMethod}</p>
                        <p>{order.items.length} item(s)</p>
                        <div className="order-card-actions">
                            <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)}>
                                <option value="pending">pending</option>
                                <option value="preparing">preparing</option>
                                <option value="ready">ready</option>
                            </select>
                            <button type="button" className="delete-button" onClick={() => deleteOrder(order._id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="section-header" style={{ marginTop: '28px' }}>
                <div>
                    <h2>Menu Management</h2>
                    <p>Add, edit, or delete menu items from the admin panel.</p>
                </div>
            </div>

            <div className="menu-management-form">
                <h3>Add New Menu Item</h3>
                <form onSubmit={addMenuItem}>
                    <label>
                        Name
                        <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                    </label>
                    <label>
                        Category
                        <input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
                    </label>
                    <label>
                        Price
                        <input
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                        />
                    </label>
                    <label>
                        Upload Image
                        <input
                            key={imageInputKey}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                        />
                    </label>
                    {newImageFile && (
                        <div className="image-preview-row">
                            <strong>Preview:</strong>
                            <img src={URL.createObjectURL(newImageFile)} alt="Preview" className="preview-image" />
                        </div>
                    )}
                    <button type="submit" className="primary-button">
                        Add Item
                    </button>
                    {addMessage && <p className="success-text">{addMessage}</p>}
                </form>
            </div>

            <div className="admin-grid menu-admin-grid">
                {menuItems.map((item) => (
                    <div key={item._id} className="menu-card">
                        <div className="item-image">
                            <img src={getImageUrl(item.img)} alt={item.name} />
                        </div>
                        <div className="menu-card-body">
                            <input
                                value={item.name}
                                onChange={(e) => setMenuItems(menuItems.map((menu) => (menu._id === item._id ? { ...menu, name: e.target.value } : menu)))}
                            />
                            <input
                                value={item.category}
                                onChange={(e) => setMenuItems(menuItems.map((menu) => (menu._id === item._id ? { ...menu, category: e.target.value } : menu)))}
                            />
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => setMenuItems(menuItems.map((menu) => (menu._id === item._id ? { ...menu, price: Number(e.target.value) } : menu)))}
                            />
                            <input
                                value={item.img}
                                onChange={(e) => setMenuItems(menuItems.map((menu) => (menu._id === item._id ? { ...menu, img: e.target.value } : menu)))}
                            />
                        </div>
                        <div className="menu-card-actions">
                            <button type="button" onClick={() => saveMenuItem(item)} className="secondary-button">
                                Save
                            </button>
                            <button type="button" onClick={() => deleteMenuItem(item._id)} className="delete-button">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Admin;
