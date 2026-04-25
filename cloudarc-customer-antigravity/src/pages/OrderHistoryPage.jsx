import { useState, useEffect } from 'react';
import { FiShoppingBag, FiInfo } from 'react-icons/fi';
import { FiActivity as HistoryIcon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

const OrderHistoryPage = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    customerApi.getOrderHistory(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return (
    <div className="center-state" style={{ height: '70%' }}>
      <div className="empty-icon"><HistoryIcon size={48} /></div>
      <div className="empty-title">Login to see orders</div>
      <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => onNavigate('login', {})}>Login</button>
    </div>
  );

  return (
    <div>
      <div className="page-header"><div className="page-title">My Orders</div></div>
      {loading ? (
        <div className="center-state"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="center-state">
          <div className="empty-icon"><FiShoppingBag size={48} /></div>
          <div className="empty-title">No orders yet</div>
          <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => onNavigate('home', {})}>Order Now</button>
        </div>
      ) : (
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 16, position: 'relative', overflow: 'hidden' }}>
              {o.customer_message && (o.status === 'received' || o.status === 'preparing') && (
                <div style={{ background: 'rgba(0,173,181,0.15)', color: 'var(--teal)', fontSize: 12, padding: '8px 12px', marginBottom: 12, borderRadius: 10, border: '1px solid rgba(0,173,181,0.3)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <FiInfo size={14} /> {o.customer_message}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{o.restaurant_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order {o.order_number}</div>
                </div>
                <div className={`open-badge ${(o.status === 'dispatched' || o.status === 'completed') ? 'open' : ''}`}
                  style={{ alignSelf: 'flex-start', background: 'rgba(0,173,181,0.1)', color: 'var(--teal)' }}>
                  {o.status === 'completed' ? 'DELIVERED' : o.status.toUpperCase()}
                </div>
              </div>
              <div style={{ fontSize: 13, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {o.items.map((it, i) => <div key={i} style={{ color: 'var(--muted)', marginBottom: 2 }}>{it.quantity}x {it.name}</div>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--teal)' }}>₹{o.total_amount}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
