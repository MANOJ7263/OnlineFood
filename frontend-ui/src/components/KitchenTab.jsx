import React from 'react'

function KitchenTab({ orders, updateOrderStatus, formatTime }) {
  // Filter only PLACED or KITCHEN_PREP orders
  const kitchenOrders = orders.filter(o => o.status === 'PLACED' || o.status === 'KITCHEN_PREP')

  const getStatusBadgeClass = (status) => {
    return status === 'KITCHEN_PREP' ? 'badge badge-kitchen' : 'badge badge-placed'
  }

  return (
    <div className="tab-control-panel">
      <div className="dashboard-header">
        <div className="dashboard-title-container">
          <h2 className="dashboard-heading">Kitchen Preparation Console</h2>
          <span className="dashboard-subtitle">Active chef tickets and preparation controls</span>
        </div>
      </div>

      <div className="control-list">
        {kitchenOrders.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">🍳</span>
            <p>No active kitchen tickets. Waiting for new orders to be placed.</p>
          </div>
        ) : (
          kitchenOrders.map((order) => (
            <div key={order.id} className="control-card card">
              <div className="control-card-header">
                <div>
                  <span className="order-id">#{order.id}</span>
                  <h3 className="order-customer">{order.customerName}</h3>
                </div>
                <span className={getStatusBadgeClass(order.status)}>
                  {order.status === 'KITCHEN_PREP' ? 'Preparing' : 'Placed'}
                </span>
              </div>
              <div className="control-card-body">
                <div className="ticket-detail">
                  <span>Item: <strong>{order.item}</strong></span>
                  <span>Received: {formatTime(order.createdAt)}</span>
                </div>
                <div className="control-actions">
                  {order.status === 'PLACED' ? (
                    <button
                      className="btn-control btn-start-prep"
                      onClick={() => updateOrderStatus(order.id, 'KITCHEN_PREP')}
                    >
                      🍳 Start Prep
                    </button>
                  ) : (
                    <button
                      className="btn-control btn-ready"
                      onClick={() => updateOrderStatus(order.id, 'AWAITING_PAYMENT')}
                    >
                      ✓ Mark Dish as Ready
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default KitchenTab
