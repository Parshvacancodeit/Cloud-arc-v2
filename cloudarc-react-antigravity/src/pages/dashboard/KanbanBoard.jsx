import { useState, useEffect, useCallback, useRef } from 'react';
import { FiRefreshCw, FiClock, FiCheck, FiAlertCircle, FiCheckCircle, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { ordersApi } from '../../services/api';
import '../../styles/KanbanBoard.css';

const COLUMNS = [
  { key: 'received', label: 'New Orders', color: '#00ADB5' },
  { key: 'preparing', label: 'Preparing', color: '#3b82f6' },
  { key: 'ready', label: 'Ready', color: '#10B981' },
  { key: 'dispatched', label: 'Dispatched', color: '#8b5cf6' },
];

const NEXT_ACTION = {
  received: { label: 'Accept & Prepare', next: 'preparing' },
  preparing: { label: 'Mark Ready', next: 'ready' },
  ready: { label: 'Dispatch', next: 'dispatched' },
  dispatched: { label: 'Mark Delivered', next: 'completed' },
};

const KanbanBoard = () => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kds_checks') || '{}'); }
    catch { return {}; }
  });
  const prevReceivedCount = useRef(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('kds_checks', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (orderId, idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), [idx]: !(prev[orderId]?.[idx]) }
    }));
  };

  const restaurantId = localStorage.getItem('restaurant_id');

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [soundEnabled]);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await ordersApi.getAll(restaurantId);
      if (data) {
        setOrdersByStatus(data);
        const newCount = (data.received || []).length;
        if (prevReceivedCount.current > 0 && newCount > prevReceivedCount.current) {
          playChime();
        }
        prevReceivedCount.current = newCount;
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, playChime]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (order, newStatus) => {
    try {
      setOrdersByStatus(prev => {
        const u = { ...prev };
        u[order.status] = (u[order.status] || []).filter(o => o.id !== order.id);
        u[newStatus] = [...(u[newStatus] || []), { ...order, status: newStatus }];
        return u;
      });
      if (newStatus === 'completed') {
        setCheckedItems(prev => { const n = { ...prev }; delete n[order.id]; return n; });
      }
      await ordersApi.updateStatus(order.id, newStatus);
      fetchOrders();
    } catch {
      fetchOrders();
    }
  };

  const formatElapsed = (createdAtStr) => {
    const ms = currentTime - new Date(createdAtStr).getTime();
    if (ms < 0) return { display: 'now', level: 'normal' };
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    let display;
    if (hrs > 0) display = `${hrs}h ${mins}m`;
    else if (mins > 0) display = `${mins}m ${secs}s`;
    else display = `${secs}s`;
    let level = 'normal';
    if (hrs > 0 || mins >= 20) level = 'late';
    else if (mins >= 10) level = 'warn';
    return { display, level };
  };

  const activeCount = (ordersByStatus.received?.length || 0)
    + (ordersByStatus.preparing?.length || 0)
    + (ordersByStatus.ready?.length || 0)
    + (ordersByStatus.dispatched?.length || 0);

  const completedOrders = (ordersByStatus.completed || [])
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  if (loading) {
    return <div className="kds-loading-state">Loading kitchen orders...</div>;
  }

  const renderCard = (order) => {
    const elapsed = formatElapsed(order.created_at);
    const isSwiggy = (order.platform || '').toLowerCase().includes('swiggy') || order.platform === 'Partner App';
    const items = order.items || [];
    const action = NEXT_ACTION[order.status];
    const checkedCount = items.filter((_, i) => checkedItems[order.id]?.[i]).length;

    return (
      <div key={order.id} className={`kds-card time-${elapsed.level}`}>
        <div className="kds-card-top">
          <span className="kds-order-id">#{order.order_number || order.id}</span>
          <span className={`kds-elapsed time-${elapsed.level}`}>
            <FiClock size={12} /> {elapsed.display}
          </span>
        </div>

        <div className="kds-card-customer">
          <span className="kds-cust-name">{order.customer_name}</span>
          <span className={`kds-source ${isSwiggy ? 'swiggy' : 'direct'}`}>
            {isSwiggy ? 'Swiggy' : 'Direct'}
          </span>
        </div>

        {items.length > 0 && (
          <div className="kds-prep-bar">
            <div className="kds-prep-fill" style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}></div>
          </div>
        )}

        <div className="kds-items-section">
          {items.map((item, idx) => {
            const done = checkedItems[order.id]?.[idx];
            return (
              <div key={idx} className={`kds-item-row ${done ? 'done' : ''}`} onClick={() => toggleCheck(order.id, idx)}>
                <div className={`kds-checkbox ${done ? 'checked' : ''}`}>
                  {done && <FiCheck size={11} />}
                </div>
                <span className="kds-item-qty">{item.qty || item.quantity}×</span>
                <span className="kds-item-name">{item.name || item.item_name}</span>
              </div>
            );
          })}
        </div>

        {order.notes && (
          <div className="kds-notes"><FiAlertCircle size={12} /> {order.notes}</div>
        )}

        {action && (
          <button className={`kds-action-btn status-${order.status}`} onClick={() => handleStatusUpdate(order, action.next)}>
            {action.label}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="kds-page">
      {/* Header */}
      <div className="kds-page-header">
        <div>
          <h1 className="kds-page-title">Kitchen Display</h1>
          <p className="kds-page-sub">
            {activeCount} active order{activeCount !== 1 ? 's' : ''}
            {' · '}
            {new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div className="kds-header-actions">
          <button className={`kds-icon-btn ${soundEnabled ? '' : 'muted'}`} onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          </button>
          <button className="kds-icon-btn" onClick={fetchOrders} title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="kds-kanban">
        {COLUMNS.map(col => {
          const colOrders = (ordersByStatus[col.key] || [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          return (
            <div key={col.key} className="kds-column">
              <div className="kds-col-header">
                <div className="kds-col-dot" style={{ background: col.color }}></div>
                <span className="kds-col-title">{col.label}</span>
                <span className="kds-col-count">{colOrders.length}</span>
              </div>
              <div className="kds-col-body">
                {colOrders.length === 0 ? (
                  <div className="kds-col-empty">No orders</div>
                ) : (
                  colOrders.map(renderCard)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Section */}
      <div className="kds-completed-section">
        <button className="kds-completed-toggle" onClick={() => setShowCompleted(!showCompleted)}>
          <FiCheckCircle size={16} />
          Recently Completed ({completedOrders.length})
          <span className="kds-toggle-arrow">{showCompleted ? '▲' : '▼'}</span>
        </button>
        {showCompleted && (
          <div className="kds-completed-list">
            {completedOrders.length === 0 ? (
              <p className="kds-completed-empty">No completed orders yet</p>
            ) : (
              completedOrders.map(order => (
                <div key={order.id} className="kds-completed-row">
                  <span className="kds-completed-id">#{order.order_number || order.id}</span>
                  <span className="kds-completed-customer">{order.customer_name}</span>
                  <span className={`kds-source ${(order.platform || '').toLowerCase().includes('swiggy') || order.platform === 'Partner App' ? 'swiggy' : 'direct'}`}>
                    {(order.platform || '').toLowerCase().includes('swiggy') || order.platform === 'Partner App' ? 'Swiggy' : 'Direct'}
                  </span>
                  <span className="kds-completed-amount">₹{order.total_amount}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
