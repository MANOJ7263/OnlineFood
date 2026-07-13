import React from 'react'

function PaymentTab({ orders, updateOrderStatus, formatTime }) {
  // Filter only AWAITING_PAYMENT orders
  const paymentOrders = orders.filter(o => o.status === 'AWAITING_PAYMENT')

  return (
    <div className="tab-control-panel">
      <div className="dashboard-header">
        <div className="dashboard-title-container">
          <h2 className="dashboard-heading">Payment Transaction Console</h2>
          <span className="dashboard-subtitle">Orders ready for checkout and billing processing</span>
        </div>
      </div>

      <div className="control-list">
        {paymentOrders.length === 0 ? (
          <div className="empty-state card">
            <span className="empty-icon">💳</span>
            <p>No transactions awaiting checkout. Waiting for kitchen prep to complete.</p>
          </div>
        ) : (
          paymentOrders.map((order) => (
            <div key={order.id} className="control-card card">
              <div className="control-card-header">
                <div>
                  <span className="order-id">#{order.id}</span>
                  <h3 className="order-customer">{order.customerName}</h3>
                </div>
                <span className="badge badge-payment">Awaiting Payment</span>
              </div>
              <div className="control-card-body">
                <div className="ticket-detail">
                  <span>Item: <strong>{order.item}</strong></span>
                  <span>Amount: <strong className="highlight-text">${parseFloat(order.amount).toFixed(2)}</strong></span>
                  <span>Prepared At: {formatTime(order.createdAt)}</span>
                </div>
                <div className="control-actions">
                  <button
                    className="btn-control btn-pay"
                    onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                  >
                    💳 Process Payment
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PaymentTab
