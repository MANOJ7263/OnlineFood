import React from 'react'

function DeliveryTab({ orders, updateOrderStatus, formatTime }) {
  // Filter only OUT_FOR_DELIVERY orders
  const deliveryOrders = orders.filter(o => o.status === 'OUT_FOR_DELIVERY')

  return (
    <div className="tab-control-panel">
      <div className="dashboard-header">
        <div className="dashboard-title-container">
          <h2 className="dashboard-heading">Delivery Fulfillment Console</h2>
          <span className="dashboard-subtitle">Orders in transit and delivery controls</span>
        </div>
      </div>

      <div className="control-list">
        {deliveryOrders.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">🚚</span>
            <p>No orders in transit. Waiting for payments to process.</p>
          </div>
        ) : (
          deliveryOrders.map((order) => {
            // Conditionally enabled logic: check if the order status is OUT_FOR_DELIVERY, 
            // indicating it successfully cleared the payment phase.
            const isPaymentCleared = order.status === 'OUT_FOR_DELIVERY'

            return (
              <div key={order.id} className="control-card card">
                <div className="control-card-header">
                  <div>
                    <span className="order-id">#{order.id}</span>
                    <h3 className="order-customer">{order.customerName}</h3>
                  </div>
                  <span className="badge badge-delivery">Out for Delivery</span>
                </div>
                <div className="control-card-body">
                  <div className="ticket-detail">
                    <span>Deliver Item: <strong>{order.item}</strong></span>
                    <span>To: <strong>{order.customerName}</strong></span>
                    <span>Dispatched At: {formatTime(order.createdAt)}</span>
                  </div>
                  <div className="control-actions">
                    <button
                      className="btn-control btn-deliver"
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      disabled={!isPaymentCleared}
                    >
                      🚚 Complete Delivery
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default DeliveryTab
