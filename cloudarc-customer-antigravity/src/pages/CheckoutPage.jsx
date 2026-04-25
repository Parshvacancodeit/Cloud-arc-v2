import { useState, useEffect } from 'react';
import { FiCheckCircle, FiMapPin, FiSmartphone, FiAlertTriangle, FiChevronLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { customerApi } from '../services/api';

const CheckoutPage = ({ total, onNavigate }) => {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect the checkout page — redirect to login if not authenticated
  useEffect(() => {
    if (!token || !user) {
      onNavigate('login', { redirect: 'checkout', total });
    }
  }, [token, user, onNavigate, total]);

  if (!user) return null;

  const handleOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        customer_name: user.name,
        customer_phone: user.phone || 'Not Provided',
        customer_address: user.address || 'Not Provided',
        notes: '',
        total_amount: total,
        items: cart.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, name: i.name, price: i.price })),
        source_app: 'CloudArc App',
      };
      const data = await customerApi.placeOrder(cart.restaurantId, payload, token);
      clearCart();
      onNavigate('success', { orderId: data.order_number || data.id });
    } catch (err) {
      setError(err.message || 'Failed to place order. Try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('cart', {})}><FiChevronLeft /> Back</button>
        <div className="page-title">Confirm Order</div>
        <div className="page-subtitle">Quick &amp; Secure Checkout</div>
      </div>

      <div style={{ padding: '20px' }}>
        {error && (
          <div style={{ marginBottom: 16, padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, letterSpacing: 0.5 }}>Delivering To</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,173,181,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMapPin size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{user.address || 'Go to profile to set address'}</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, letterSpacing: 0.5 }}>Contact Info</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,173,181,0.1)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiSmartphone size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{user.phone || 'No phone set'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{user.email}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(0,173,181,0.05)', borderRadius: 16, border: '1px solid rgba(0,173,181,0.1)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 14, color: 'var(--muted)' }}>Total Amount</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>₹{total}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Payment Mode: Cash on Delivery</div>
        </div>

        <button className="primary-btn" onClick={handleOrder} disabled={loading} style={{ width: '100%', margin: 0 }}>
          {loading ? 'Processing...' : <><FiCheckCircle style={{ marginRight: 8 }} /> Confirm &amp; Place Order</>}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
