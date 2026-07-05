import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [orders, setOrders] = useState([])
  const [customerName, setCustomerName] = useState('')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Fetch orders from API
  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const response = await axios.get('/api/orders')
      // Sort orders by id descending to show newest first
      const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id)
      setOrders(sortedOrders)
      setErrorMsg('')
    } catch (error) {
      console.error('Error fetching orders:', error)
      setErrorMsg('Failed to connect to backend server. Make sure order-service is running.')
    } finally {
      if (showSpinner) setIsRefreshing(false)
    }
  }

  // Load orders on mount and start polling every 2000ms
  useEffect(() => {
    fetchOrders(true)
    const interval = setInterval(() => {
      fetchOrders(false)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle Order Submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!customerName.trim() || !item.trim() || !amount) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Amount must be a positive number.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/orders', {
        customerName: customerName.trim(),
        item: item.trim(),
        amount: numericAmount
      })
      
      setSuccessMsg(`Order #${response.data.id} placed successfully!`)
      setCustomerName('')
      setItem('')
      setAmount('')
      fetchOrders(false)
    } catch (error) {
      console.error('Error placing order:', error)
      setErrorMsg('Failed to place order. Please check the backend services.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to get CSS class for status badges
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PLACED':
        return 'badge badge-placed'
      case 'PAID':
        return 'badge badge-paid'
      case 'READY':
        return 'badge badge-ready'
      case 'DELIVERED':
        return 'badge badge-delivered'
      case 'CANCELLED':
        return 'badge badge-cancelled'
      default:
        return 'badge'
    }
  }

  // Helper to format ISO timestamp
  const formatTime = (timeString) => {
    if (!timeString) return '-'
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString()
    } catch (e) {
      return timeString
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title-container">
          <span className="header-logo">🍔</span>
          <h1 className="header-title">Online Food Order Processing</h1>
        </div>
        <div className="system-status">
          <span className="status-dot"></span>
          <span>System Active</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="main-content">
        {/* Left Column - Form Card */}
        <div className="card">
          <h2 className="card-title">Place New Order</h2>
          <form onSubmit={handleOrderSubmit}>
            {errorMsg && (
              <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                {successMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="customerName">Customer Name</label>
              <input
                id="customerName"
                type="text"
                className="form-input"
                placeholder="e.g. Alice Smith"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="itemName">Item</label>
              <input
                id="itemName"
                type="text"
                className="form-input"
                placeholder="e.g. Pepperoni Pizza"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount ($)</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-submit"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Submit Order'}
            </button>
          </form>
        </div>

        {/* Right Column - Status Dashboard */}
        <div className="dashboard-panel">
          <div className="dashboard-header">
            <div className="dashboard-title-container">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem' }}>Live Status Dashboard</h2>
              <span className="dashboard-subtitle">Real-time status updates from microservices</span>
            </div>
            <div className="refresh-indicator">
              {isRefreshing ? <span className="indicator-spin"></span> : null}
              <span>Polling every 2s</span>
            </div>
          </div>

          <div className="table-wrapper">
            {orders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <p>No orders placed yet. Submit the form to place an order.</p>
              </div>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Placed At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td className="order-customer">{order.customerName}</td>
                      <td className="order-item">{order.item}</td>
                      <td className="order-amount">${parseFloat(order.amount).toFixed(2)}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatTime(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
