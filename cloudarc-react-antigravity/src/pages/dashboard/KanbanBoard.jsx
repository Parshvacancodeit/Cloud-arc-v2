import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiClock, FiPackage, FiMapPin, FiPhone, FiX, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { ordersApi } from '../../services/api';
import '../../styles/KanbanBoard.css';

const EMPTY_BOARD = { received: [], preparing: [], ready: [], dispatched: [], completed: [], cancelled: [] };

const KanbanBoard = () => {
  const restaurantId = localStorage.getItem('restaurant_id');

  const [orders, setOrders] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getAll(restaurantId);
      // API returns { received: [...], preparing: [...], ready: [...], dispatched: [...] }
      setOrders({
        received: data.received || [],
        preparing: data.preparing || [],
        ready: data.ready || [],
        dispatched: data.dispatched || [],
        completed: data.completed || [],
        cancelled: data.cancelled || [],
      });
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30s for real-time feel
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const columns = [
    { id: 'received', title: 'Received', color: '#3B82F6' },
    { id: 'preparing', title: 'Preparing', color: '#FF5722' },
    { id: 'ready', title: 'Ready', color: '#10B981' },
    { id: 'dispatched', title: 'Dispatched', color: '#8B5CF6' },
    { id: 'completed', title: 'Completed', color: '#10B981', isEndStage: true },
  ];

  const handleDragStart = (e, order, sourceColumn) => {
    setDraggedOrder({ order, sourceColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    if (!draggedOrder || draggedOrder.sourceColumn === targetColumn) return;

    const { order, sourceColumn } = draggedOrder;

    // Optimistic UI update
    setOrders(prev => {
      const next = { ...prev };
      next[sourceColumn] = next[sourceColumn].filter(o => o.id !== order.id);
      next[targetColumn] = [...next[targetColumn], { ...order, status: targetColumn }];
      return next;
    });
    setDraggedOrder(null);

    // Persist to API
    try {
      await ordersApi.updateStatus(order.id, targetColumn);
    } catch {
      // Revert on failure
      fetchOrders();
    }
  };

  const handleStatusUpdate = async (order, nextStatus) => {
    // Optimistic UI update
    setOrders(prev => {
      const next = { ...prev };
      const currentStatus = order.status;
      
      // Defensive checks to prevent crashing
      if (next[currentStatus]) {
        next[currentStatus] = next[currentStatus].filter(o => o.id !== order.id);
      }
      if (next[nextStatus]) {
        next[nextStatus] = [...next[nextStatus], { ...order, status: nextStatus }];
      } else {
        // If nextStatus isn't a column we track in state, just remove from current
        console.warn(`Status ${nextStatus} not found in state board`);
      }
      
      return next;
    });

    try {
      await ordersApi.updateStatus(order.id, nextStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchOrders();
    }
  };

  const getPriorityColor = (priority) => ({ high: '#FF5722', normal: '#00ADB5', low: '#64748B', urgent: '#DC2626' }[priority] || '#64748B');

  const filteredOrders = (columnOrders) => {
    if (!searchTerm) return columnOrders;
    const term = searchTerm.toLowerCase();
    return columnOrders.filter(o =>
      String(o.id).includes(term) ||
      (o.order_number || '').toLowerCase().includes(term) ||
      (o.customer_name || '').toLowerCase().includes(term) ||
      (o.platform || '').toLowerCase().includes(term)
    );
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    const diff = Math.floor((Date.now() - new Date(isoStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  if (loading) return (
    <div className="kanban-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading orders...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="kanban-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ color: '#64748B', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchOrders} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div>
          <h1>Order Management</h1>
          <p>Drag and drop orders between stages — auto-refreshes every 30s</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <FiSearch />
            <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-secondary" onClick={fetchOrders}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map((column) => (
          <div key={column.id} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)}>
            <div className="column-header">
              <div className="column-title">
                <div className="status-indicator" style={{ background: column.color }} />
                <h3>{column.title}</h3>
                <span className="order-count">{orders[column.id].length}</span>
              </div>
            </div>

            <div className="column-content">
              {filteredOrders(orders[column.id]).map((order) => (
                <div
                  key={order.id}
                  className="order-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, order, column.id)}
                  onClick={() => setSelectedOrder(order)}
                  style={{ borderLeftColor: column.color }}
                >
                  <div className="order-card-header">
                    <span className="order-number">{order.order_number || `#${order.id}`}</span>
                    <span className="priority-badge" style={{ background: `${getPriorityColor(order.priority)}20`, color: getPriorityColor(order.priority) }}>
                      {order.priority || 'normal'}
                    </span>
                  </div>

                  <div className="order-platform-badge">{order.platform}</div>

                  <div className="order-items">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="item-row">
                        <span>{item.qty || item.quantity}x</span>
                        <span>{item.name || item.item_name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">₹{order.total_amount || order.total}</div>
                    <div className="order-time">
                      <FiClock />
                      {formatTime(order.created_at)}
                    </div>
                  </div>

                  {order.assigned_to && <div className="assigned-badge">{order.assigned_to}</div>}

                  {column.id === 'received' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button 
                        className="btn-complete" 
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'preparing'); }}
                        style={{ flex: 1, padding: '8px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn-archive" 
                        onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'cancelled'); }}
                        style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {column.id === 'preparing' && (
                    <button 
                      className="btn-complete" 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'ready'); }}
                      style={{ marginTop: '12px', padding: '8px', background: '#FF5722', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                    >
                      Mark as Ready
                    </button>
                  )}

                  {column.id === 'ready' && (
                    <button 
                      className="btn-complete" 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'dispatched'); }}
                      style={{ marginTop: '12px', padding: '8px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                    >
                      Dispatch Order
                    </button>
                  )}

                  {column.id === 'dispatched' && (
                    <button 
                      className="btn-complete" 
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'completed'); }}
                      style={{ marginTop: '12px', padding: '8px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                    >
                      Complete Order
                    </button>
                  )}
                  {column.id === 'completed' && (
                    <div style={{ marginTop: '12px', textAlign: 'center', color: '#10B981', fontSize: '12px', fontWeight: '700', background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiCheckCircle /> Delivered
                    </div>
                  )}
                  {column.id === 'cancelled' && (
                    <div style={{ marginTop: '12px', textAlign: 'center', color: '#EF4444', fontSize: '12px', fontWeight: '700', background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <FiX /> Cancelled
                    </div>
                  )}
                </div>
              ))}

              {filteredOrders(orders[column.id]).length === 0 && (
                <div className="empty-column">
                  <FiPackage />
                  <p>No orders</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.order_number || `#${selectedOrder.id}`}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Details</h3>
                <div className="detail-row"><FiPackage /><span>{selectedOrder.customer_name}</span></div>
                {selectedOrder.customer_phone && <div className="detail-row"><FiPhone /><span>{selectedOrder.customer_phone}</span></div>}
                {selectedOrder.customer_address && <div className="detail-row"><FiMapPin /><span>{selectedOrder.customer_address}</span></div>}
              </div>
              <div className="detail-section">
                <h3>Order Items</h3>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="item-detail">
                    <span>{item.qty || item.quantity}x {item.name || item.item_name}</span>
                  </div>
                ))}
              </div>
              {selectedOrder.notes && (
                <div className="detail-section">
                  <h3>Special Instructions</h3>
                  <p style={{ fontSize: '14px', color: '#64748B' }}>{selectedOrder.notes}</p>
                </div>
              )}
              <div className="detail-section">
                <div className="total-row">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{selectedOrder.total_amount || selectedOrder.total}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
