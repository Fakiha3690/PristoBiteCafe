import axios from 'axios'

const API = import.meta.env.DEV ? 'http://localhost:5000' : import.meta.env.VITE_API_URL || ''

export const getOrders = (name) =>
    axios.get(`${API}/api/orders`, { params: { customerName: name } })

export const createOrder = (data) =>
    axios.post(`${API}/api/orders`, data)

export const cancelOrder = (id, reason) =>
    axios.put(`${API}/api/orders/${id}/cancel`, { cancelReason: reason })

export const rateOrder = (id, rating, feedback) =>
    axios.put(`${API}/api/orders/${id}/rate`, { rating, feedback })

export const trackOrder = (id) =>
    axios.get(`${API}/api/orders/track/${id}`)