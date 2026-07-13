import React from 'react'

function Navbar({ activeTab, setActiveTab, orders }) {
  // Calculate counts for each tab
  const getKitchenCount = () => orders.filter(o => o.status === 'PLACED' || o.status === 'KITCHEN_PREP').length
  const getPaymentCount = () => orders.filter(o => o.status === 'AWAITING_PAYMENT').length
  const getDeliveryCount = () => orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length

  const tabs = [
    { id: 'orders', label: 'Orders', icon: '📝', count: orders.length },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳', count: getKitchenCount() },
    { id: 'payment', label: 'Payment', icon: '💳', count: getPaymentCount() },
    { id: 'delivery', label: 'Delivery', icon: '🚚', count: getDeliveryCount() }
  ]

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🍔</span>
        <h1 className="navbar-title">Online Food Order Processing</h1>
      </div>
      <div className="navbar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`tab-badge badge-${tab.id}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="system-status">
        <span className="status-dot"></span>
        <span>System Active</span>
      </div>
    </nav>
  )
}

export default Navbar
