import { Link } from 'react-router-dom'
import './components/Home.css'

function Home() {
    function goToMenu() {
        window.location.href = '/menu'
    }

    function goToLogin() {
        window.location.href = '/login'
    }

    return (
        <div className="home-page">
            <section className="welcome-banner">
                <div className="welcome-container">
                    <h1 className="welcome-title">Welcome to PréstoBite</h1>
                    <p className="welcome-subtitle">Fast, Fresh, and Delivered to You</p>
                </div>
            </section>
            <section className="hero-section-new">
                <div className="hero-content">
                    <div className="hero-text-box">
                        <p className="hero-label">⏱️ Skip the Queue</p>
                        <h2>Order Now, Enjoy Later</h2>
                        <p className="hero-description">PréstoBite Café is your campus café pre-order platform. Place your order, choose your time, and skip waiting in line. Fast service for students and faculty!</p>
                        <div className="hero-buttons">
                            <button className="primary-button" onClick={goToMenu}>View Menu</button>
                            <button className="secondary-button" onClick={goToLogin}>Login to Order</button>
                        </div>
                    </div>
                    <div className="hero-image-box">
                        <img src="/cafe.jpg" alt="PréstoBite Café" className="hero-image-main" />
                    </div>
                </div>
            </section>
            <section className="features-section">
                <h2>Why Choose PréstoBite Café?</h2>
                <div className="features-grid">
                    <div className="feature-item">
                        <div className="feature-image-wrapper">
                            <img src="/fasservice.jpg" alt="Super Fast" className="feature-image" />
                        </div>
                        <h3>Super Fast</h3>
                        <p>Pre-order and get your food in minutes. No waiting in long queues!</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-image-wrapper">
                            <img src="/flexiblw_pickup.jpg" alt="Flexible Pickup" className="feature-image" />
                        </div>
                        <h3>Flexible Pickup</h3>
                        <p>Choose when to pick up your order. Students: pickup only. Faculty: delivery available.</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-image-wrapper">
                            <img src="/tracklive.jpg" alt="Track Live" className="feature-image" />
                        </div>
                        <h3>Track Live</h3>
                        <p>See your order status in real-time. Pending → Preparing → Ready!</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-image-wrapper">
                            <img src="/rate.jpg" alt="Rate Orders" className="feature-image" />
                        </div>
                        <h3>Rate Orders</h3>
                        <p>Share feedback on your orders and help us improve every day.</p>
                    </div>
                </div>
            </section>
            <section className="popular-section">
                <h2>Popular Items Today</h2>
                <div className="items-showcase">
                    <div className="showcase-item">
                        <img src="/chicken_burger.jpg" alt="Chicken Burger" />
                        <h3>Chicken Burger</h3>
                        <p>Rs 180</p>
                    </div>
                    <div className="showcase-item">
                        <img src="/abc_juice.webp" alt="Fruit Cooler" />
                        <h3>Fruit Cooler</h3>
                        <p>Rs 90</p>
                    </div>
                    <div className="showcase-item">
                        <img src="/spring roll.webp" alt="Spring Roll" />
                        <h3>Spring Roll</h3>
                        <p>Rs 120</p>
                    </div>
                </div>
                <div className="see-all-btn-wrapper">
                    <button className="primary-button" onClick={goToMenu}>See All Items</button>
                </div>
            </section>
            <section className="roles-section">
                <h2>For Everyone</h2>
                <div className="roles-grid">
                    <div className="role-card">
                        <div className="role-emoji">👨‍🎓</div>
                        <h3>Students</h3>
                        <p>Quick pickup orders from campus café. Save time between classes!</p>
                    </div>
                    <div className="role-card">
                        <div className="role-emoji">👨‍🏫</div>
                        <h3>Faculty</h3>
                        <p>Order with pickup or delivery to your office. Easy and convenient!</p>
                    </div>
                    <div className="role-card">
                        <div className="role-emoji">👨‍💼</div>
                        <h3>Admin</h3>
                        <p>Manage menu, orders, and view live dashboard. Full control!</p>
                    </div>
                </div>
            </section>
            <section className="cta-section">
                <h2>Ready to Order?</h2>
                <p>Login or browse the menu to get started</p>
                <div className="cta-buttons">
                    <button className="primary-button" onClick={goToLogin}>Login Now</button>
                    <button className="secondary-button" onClick={goToMenu}>Browse Menu</button>
                </div>
            </section>
        </div>
    )
}

export default Home

