import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const SuccessPage = ({ orderId, onNavigate }) => (
  <div className="success-page">
    <div className="success-icon">
      <FiCheckCircle size={48} color="var(--success)" />
    </div>
    <h1 className="success-title">Order Placed!</h1>
    <p className="success-subtitle">Your kitchen has received the order and will start preparing it soon.</p>
    <div className="order-id-display">
      <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Order Number</span>
      {orderId}
    </div>
    <button className="primary-btn" onClick={() => onNavigate('home', {})}>Back to Home</button>
    <button className="nav-item" style={{ marginTop: 20, color: 'var(--teal)', fontWeight: 700, fontSize: 13 }} onClick={() => onNavigate('orders', {})}>
      Track in My Orders <FiArrowRight style={{ marginLeft: 4, verticalAlign: 'middle' }} />
    </button>
  </div>
);

export default SuccessPage;
