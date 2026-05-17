import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_HOST = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_API_URL || ''

function Menu() {
    const [menuItems, setMenuItems] = useState([])
    const [counts, setCounts] = useState(() => {
        try {
            const stored = localStorage.getItem('prestoCart')
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // load menu from backend
    useEffect(() => {
        async function loadMenu() {
            try {
                const resp = await axios.get(`${API_HOST}/api/menu`)
                setMenuItems(resp.data)
            } catch (err) {
                console.error('Unable to load menu items', err)
            }
        }

        loadMenu()
    }, [])

    function getImageUrl(src) {
        if (!src) return ''
        if (src.startsWith('http')) return src
        if (src.startsWith('/uploads/')) return API_HOST + src
        return src
    }

    function saveCounts(nextCounts) {
        const copy = { ...nextCounts }
        Object.keys(copy).forEach(function (k) {
            if (copy[k] === 0) {
                delete copy[k]
            }
        })
        localStorage.setItem('prestoCart', JSON.stringify(copy))
        setCounts(copy)
    }

    function updateCount(id, delta) {
        const current = counts[id] || 0
        let nextValue = current + delta
        if (nextValue < 0) nextValue = 0
        const nextCounts = { ...counts }
        if (nextValue === 0) {
            delete nextCounts[id]
        } else {
            nextCounts[id] = nextValue
        }
        saveCounts(nextCounts)
    }

    // build categories list
    const categorySet = new Set()
    for (let i = 0; i < menuItems.length; i++) {
        const it = menuItems[i]
        if (it && it.category) categorySet.add(it.category)
    }
    const categories = ['all', ...Array.from(categorySet).sort()]

    // filter visible items
    const term = (searchTerm || '').trim().toLowerCase()
    const visibleItems = []
    for (let i = 0; i < menuItems.length; i++) {
        const it = menuItems[i]
        if (!it) continue
        const name = (it.name || '').toLowerCase()
        const cat = (it.category || '').toLowerCase()
        const matchesSearch = !term || name.indexOf(term) !== -1 || cat.indexOf(term) !== -1
        const matchesCategory = selectedCategory === 'all' || it.category === selectedCategory
        if (matchesSearch && matchesCategory) visibleItems.push(it)
    }

    let selectedCount = 0
    Object.keys(counts).forEach(function (k) {
        selectedCount += counts[k]
    })

    return (
        <div className="page-card">
            <div className="section-header">
                <div>
                    <h1>Menu</h1>
                    <p>Choose from popular items and add them to your order.</p>
                </div>
                <Link to="/orders" className="secondary-button">
                    {selectedCount ? 'Go to Order (' + selectedCount + ')' : 'Go to Order'}
                </Link>
            </div>

            <div className="menu-controls-row">
                <input
                    className="menu-search-input"
                    type="text"
                    value={searchTerm}
                    placeholder="Search items or categories"
                    onChange={function (e) {
                        setSearchTerm(e.target.value)
                    }}
                />

                <div className="menu-filter-row">
                    {categories.map(function (category) {
                        return (
                            <button
                                key={category}
                                type="button"
                                className={selectedCategory === category ? 'menu-filter-button active' : 'menu-filter-button'}
                                onClick={function () {
                                    setSelectedCategory(category)
                                }}
                            >
                                {category === 'all' ? 'All' : category}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="items-grid">
                {visibleItems.length === 0 ? (
                    <div className="menu-empty-state">No items match your search.</div>
                ) : (
                    visibleItems.map(function (item) {
                        return (
                            <div key={item._id || item.name} className="item-card">
                                <div className="item-image">
                                    <img src={getImageUrl(item.img)} alt={item.name} />
                                </div>
                                <div className="item-info">
                                    <h3>{item.name}</h3>
                                    <p>{item.category}</p>
                                    <span className="item-price">Rs {item.price}</span>
                                </div>
                                <div className="item-controls">
                                    <button type="button" className="qty-button" onClick={function () { updateCount(item._id, -1) }}>
                                        −
                                    </button>
                                    <span className="qty-value">{counts[item._id] || 0}</span>
                                    <button type="button" className="qty-button" onClick={function () { updateCount(item._id, 1) }}>
                                        +
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Menu
