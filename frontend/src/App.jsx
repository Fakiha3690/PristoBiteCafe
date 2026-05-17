import { useEffect, useState } from 'react'
import {
    BrowserRouter,
    NavLink,
    Route,
    Routes
} from 'react-router-dom'

import Home from './Home.jsx'
import Menu from './Menu.jsx'
import Login from './Login.jsx'
import Profile from './Profile.jsx'
import Order from './Cart.jsx'
import MyOrders from './MyOrders.jsx'
import Admin from './Admin.jsx'
import SuggestionBox from './SuggestionBox'

import './components/App.css'


function App() {

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('prestoUser')
        return stored ? JSON.parse(stored) : null
    })

    const isAdmin = user?.role === 'admin'
    const isStudent = user?.role === 'student'
    const isFaculty = user?.role === 'faculty'

    useEffect(() => {
        if (user) {
            localStorage.setItem('prestoUser', JSON.stringify(user))
        } else {
            localStorage.removeItem('prestoUser')
        }
    }, [user])


    return (

        <BrowserRouter>

            <div className="app-shell">


                <header className="app-header">

                    <div className="app-brand">
                        PréstoBite Café
                    </div>


                    <nav className="app-nav">


                        {/* before login */}

                        {!user && (
                            <>

                                <NavLink to="/" end>
                                    Home
                                </NavLink>

                                <NavLink to="/menu">
                                    Menu
                                </NavLink>

                                <NavLink to="/login">
                                    Login
                                </NavLink>

                            </>
                        )}



                        {/* admin */}

                        {isAdmin && (
                            <>

                                <NavLink to="/menu">
                                    Menu
                                </NavLink>

                                <NavLink to="/suggestions">
                                    Suggestions
                                </NavLink>

                                <NavLink to="/admin">
                                    Dashboard
                                </NavLink>

                                <NavLink to="/profile">
                                    Profile
                                </NavLink>

                            </>
                        )}



                        {/* student + faculty */}

                        {(isStudent || isFaculty) && (
                            <>

                                <NavLink to="/menu">
                                    Menu
                                </NavLink>

                                <NavLink to="/orders">
                                    Cart
                                </NavLink>

                                <NavLink to="/my-orders">
                                    Orders
                                </NavLink>

                                <NavLink to="/suggestions">
                                    Suggestions
                                </NavLink>

                                <NavLink to="/profile">
                                    Profile
                                </NavLink>

                            </>
                        )}


                    </nav>

                    {user && (
                        <div className="user-pill">
                            {user.name.split(' ')[0]}
                        </div>
                    )}

                </header>



                <main className="app-main">

                    <Routes>

                        <Route
                            path="/"
                            element={<Home />}
                        />

                        <Route
                            path="/menu"
                            element={<Menu />}
                        />

                        <Route
                            path="/orders"
                            element={
                                <Order user={user} />
                            }
                        />

                        <Route
                            path="/my-orders"
                            element={
                                <MyOrders user={user} />
                            }
                        />

                        <Route
                            path="/admin"
                            element={
                                <Admin user={user} />
                            }
                        />

                        <Route
                            path="/login"
                            element={
                                <Login onLogin={setUser} />
                            }
                        />

                        <Route
                            path="/suggestions"
                            element={<SuggestionBox user={user} />}
                        />

                        <Route
                            path="/profile"
                            element={
                                <Profile user={user} onLogout={() => setUser(null)} />
                            }
                        />

                    </Routes>

                </main>


            </div>

        </BrowserRouter>
    )
}


export default App