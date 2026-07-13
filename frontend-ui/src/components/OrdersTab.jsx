import React, { useState, useEffect } from 'react'

function OrdersTab({ orders, handleOrderSubmit, isSubmitting, errorMsg, successMsg, formatTime, deliveryTimestamps }) {
  const [customerName, setCustomerName] = useState('')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  
  // Real-time ticking state to trigger local re-render every second for the 40s countdown
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    handleOrderSubmit({ customerName, item, amount }, () => {
      setCustomerName('')
      setItem('')
      setAmount('')
    })
  }

  // Stepper helper with 40-second delivery delay simulation
  const getStepState = (status, step, orderId) => {
    if (status === 'CANCELLED') {
      if (step === 'PLACED') return 'completed'
      if (step === 'CANCELLED') return 'failed'
      return 'disabled'
    }

    const stepsOrder = ['PLACED', 'KITCHEN_PREP', 'AWAITING_PAYMENT', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const currentIndex = stepsOrder.indexOf(status)
    const stepIndex = stepsOrder.indexOf(step)

    if (stepIndex === -1) return 'disabled'

    // If order is DELIVERED and we are rendering the final DELIVERED step node,
    // enforce a 40-second delay countdown before turning it green.
    if (step === 'DELIVERED' && status === 'DELIVERED') {
      const deliveredAt = deliveryTimestamps[orderId]
      if (deliveredAt) {
        const elapsed = now - deliveredAt
        if (elapsed >= 40000) {
          return 'completed' // Enforce green tick after 40 seconds
        }
        return 'active' // Show as active/processing (blue step 5) during countdown
      }
      return 'completed' // Fallback to green tick for historical/pre-existing orders
    }

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStatusBadgeClass = (status, orderId) => {
    if (status === 'DELIVERED') {
      const deliveredAt = deliveryTimestamps[orderId]
      if (deliveredAt && now - deliveredAt < 40000) {
        return 'badge badge-delivery' // Keep it blue during the countdown
      }
    }
    
    switch (status?.toUpperCase()) {
      case 'PLACED': return 'badge badge-placed'
      case 'KITCHEN_PREP': return 'badge badge-kitchen'
      case 'AWAITING_PAYMENT': return 'badge badge-payment'
      case 'OUT_FOR_DELIVERY': return 'badge badge-delivery'
      case 'DELIVERED': return 'badge badge-delivered'
      case 'CANCELLED': return 'badge badge-cancelled'
      default: return 'badge'
    }
  }

  const getStatusLabel = (status, orderId) => {
    if (status === 'DELIVERED') {
      const deliveredAt = deliveryTimestamps[orderId]
      if (deliveredAt) {
        const elapsed = now - deliveredAt
        if (elapsed < 40000) {
          const remainingSecs = Math.max(0, Math.ceil((40000 - elapsed) / 1000))
          return `Delivering (${remainingSecs}s)`
        }
      }
    }
    
    switch (status) {
      case 'PLACED': return 'Placed'
      case 'KITCHEN_PREP': return 'Preparing'
      case 'AWAITING_PAYMENT': return 'Awaiting Payment'
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery'
      case 'DELIVERED': return 'Delivered'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="tab-layout">
      {/* Placement Form */}
      <div className="card form-card">
        <h2 className="card-title">Place New Order</h2>
        <form onSubmit={onSubmit}>
          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

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

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Submit Order'}
          </button>
        </form>
      </div>

      {/* Orders Stepper Dashboard */}
      <div className="orders-dashboard">
        <div className="dashboard-header">
          <div className="dashboard-title-container">
            <h2 className="dashboard-heading">Track Active Orders</h2>
            <span className="dashboard-subtitle">Real-time status across microservice boundaries</span>
          </div>
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">📝</span>
              <p>No orders placed yet. Submit the form to place an order.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="order-lifecycle-card card">
                <div className="order-lifecycle-header">
                  <div>
                    <span className="order-id">#{order.id}</span>
                    <h3 className="order-customer">{order.customerName}</h3>
                  </div>
                  <div className="order-lifecycle-meta">
                    <span className={getStatusBadgeClass(order.status, order.id)}>
                      {getStatusLabel(order.status, order.id)}
                    </span>
                    <span className="order-time">{formatTime(order.createdAt)}</span>
                  </div>
                </div>

                <div className="order-details-summary">
                  Ordered <strong className="highlight-text">{order.item}</strong> for <strong className="highlight-text">${parseFloat(order.amount).toFixed(2)}</strong>
                </div>

                {/* Timeline Stepper */}
                <div className="stepper-container">
                  {order.status === 'CANCELLED' ? (
                    <div className="stepper">
                      <div className="step completed">
                        <div className="step-dot">✓</div>
                        <div className="step-label">Placed</div>
                      </div>
                      <div className="step-line failed"></div>
                      <div className="step failed">
                        <div className="step-dot">✗</div>
                        <div className="step-label">Cancelled</div>
                      </div>
                    </div>
                  ) : (
                    <div className="stepper">
                      {[
                        { id: 'PLACED', label: 'Placed' },
                        { id: 'KITCHEN_PREP', label: 'Kitchen Prep' },
                        { id: 'AWAITING_PAYMENT', label: 'Awaiting Payment' },
                        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                        { id: 'DELIVERED', label: 'Delivered' }
                      ].map((step, idx, arr) => {
                        const state = getStepState(order.status, step.id, order.id)
                        return (
                          <React.Fragment key={step.id}>
                            <div className={`step ${state}`}>
                              <div className="step-dot">
                                {state === 'completed' ? '✓' : idx + 1}
                              </div>
                              <div className="step-label">{step.label}</div>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`step-line ${getStepState(order.status, arr[idx + 1].id, order.id) === 'completed' || getStepState(order.status, arr[idx + 1].id, order.id) === 'active' ? 'active' : ''}`}></div>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersTab
