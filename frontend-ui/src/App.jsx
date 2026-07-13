import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Navbar from './components/Navbar'
import OrdersTab from './components/OrdersTab'
import KitchenTab from './components/KitchenTab'
import PaymentTab from './components/PaymentTab'
import DeliveryTab from './components/DeliveryTab'

function App() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('orders')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  const [firstFetchDone, setFirstFetchDone] = useState(false)
  const [deliveryTimestamps, setDeliveryTimestamps] = useState(() => {
    return JSON.parse(localStorage.getItem('delivery_timestamps') || '{}')
  })

  // Fetch orders from API
  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const response = await axios.get('/api/orders')
      const fetchedOrders = response.data || []
      
      // Manage delivery transition timestamps
      const storedTimestamps = JSON.parse(localStorage.getItem('delivery_timestamps') || '{}')
      let updatedTimestamps = { ...storedTimestamps }
      let changed = false
      
      fetchedOrders.forEach(order => {
        if (order.status === 'DELIVERED') {
          if (updatedTimestamps[order.id] === undefined) {
            // If it is the first fetch of the app session, mark historical orders as completed immediately
            // by setting their timestamp 60s in the past. Otherwise, mark with current time for a 40s delay.
            updatedTimestamps[order.id] = firstFetchDone ? Date.now() : (Date.now() - 60000)
            changed = true
          }
        }
      })
      
      if (changed) {
        localStorage.setItem('delivery_timestamps', JSON.stringify(updatedTimestamps))
        setDeliveryTimestamps(updatedTimestamps)
      }
      
      if (!firstFetchDone && fetchedOrders.length > 0) {
        setFirstFetchDone(true)
      }
      
      // Sort orders by id descending to show newest first
      const sortedOrders = fetchedOrders.sort((a, b) => b.id - a.id)
      setOrders(sortedOrders)
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
  }, [firstFetchDone])

  // Handle Order Submit
  const handleOrderSubmit = async (formValues, clearFormCallback) => {
    setErrorMsg('')
    setSuccessMsg('')

    const { customerName, item, amount } = formValues

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
      clearFormCallback()
      fetchOrders(false)
    } catch (error) {
      console.error('Error placing order:', error)
      setErrorMsg('Failed to place order. Please check the backend services.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Status Update (PATCH request to mock service transition)
  const updateOrderStatus = async (orderId, newStatus) => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      // If manually transitioning to DELIVERED, record the timestamp immediately in localStorage/state
      if (newStatus === 'DELIVERED') {
        const storedTimestamps = JSON.parse(localStorage.getItem('delivery_timestamps') || '{}')
        storedTimestamps[orderId] = Date.now()
        localStorage.setItem('delivery_timestamps', JSON.stringify(storedTimestamps))
        setDeliveryTimestamps(storedTimestamps)
      }

      await axios.patch(`/api/orders/${orderId}/status`, {
        status: newStatus
      })
      
      // Instantly update local state for fast UI response
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      // Poll immediately to sync with any side-effects in the DB
      fetchOrders(false)
    } catch (error) {
      console.error('Error updating order status:', error)
      setErrorMsg(`Failed to update status for Order #${orderId}.`)
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

  // Render active tab view
  const renderTabContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            handleOrderSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
            errorMsg={errorMsg}
            successMsg={successMsg}
            formatTime={formatTime}
            deliveryTimestamps={deliveryTimestamps}
          />
        )
      case 'kitchen':
        return (
          <KitchenTab
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            formatTime={formatTime}
          />
        )
      case 'payment':
        return (
          <PaymentTab
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            formatTime={formatTime}
          />
        )
      case 'delivery':
        return (
          <DeliveryTab
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            formatTime={formatTime}
          />
        )
      default:
        return <div className="card">Tab not found</div>
    }
  }

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} orders={orders} />

      {/* Main Container */}
      <main className="main-content-fluid">
        {/* Top level global alerts */}
        {errorMsg && activeTab !== 'orders' && (
          <div className="alert alert-error global-alert">{errorMsg}</div>
        )}

        <div className="tab-header-indicator">
          <span className="tab-current-view">
            Console View: <strong>{activeTab.toUpperCase()}</strong>
          </span>
          <div className="refresh-indicator">
            {isRefreshing ? <span className="indicator-spin"></span> : null}
            <span>Polling every 2s</span>
          </div>
        </div>

        {/* Dynamic Tab Panel */}
        <div className="tab-content-panel">
          {renderTabContent()}
        </div>
      </main>
    </div>
  )
}

export default App
