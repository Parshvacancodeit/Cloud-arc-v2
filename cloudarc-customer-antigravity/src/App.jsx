import { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, FiShoppingBag, FiUser, FiClock, FiStar, FiChevronLeft, 
  FiMapPin, FiCheckCircle, FiZap, FiSmartphone, FiCoffee, FiAlertTriangle, 
  FiTrendingUp, FiShoppingBag as CartIcon, FiHome as HomeIcon, 
  FiActivity as HistoryIcon, FiUser as UserIcon, FiImage, FiPlus, FiMinus,
  FiArrowRight, FiCheck, FiInfo, FiPackage, FiTruck, FiLogOut
} from 'react-icons/fi';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { customerApi } from './services/api';

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal: #00ADB5;
    --orange: #FF5722;
    --dark: #0F172A;
    --darker: #0A0E1A;
    --card: #1A2235;
    --border: rgba(255,255,255,0.07);
    --text: #F1F5F9;
    --muted: #94A3B8;
    --success: #10B981;
  }

  body { font-family: 'Manrope', sans-serif; background: #0A0E1A; color: var(--text); -webkit-font-smoothing: antialiased; }

  /* Phone frame wrapper */
  .app-stage {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 20% 50%, rgba(0,173,181,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(255,87,34,0.10) 0%, transparent 50%),
                #060914;
    padding: 24px;
  }

  .phone-outer {
    width: 390px;
    height: 844px;
    background: #111827;
    border-radius: 52px;
    padding: 14px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 30px 80px rgba(0,0,0,0.8),
      0 0 60px rgba(0,173,181,0.12),
      inset 0 1px 0 rgba(255,255,255,0.12);
    position: relative;
    flex-shrink: 0;
  }

  .phone-notch {
    position: absolute;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 32px;
    background: #0A0A0A;
    border-radius: 0 0 20px 20px;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .notch-cam {
    width: 10px; height: 10px;
    background: #222;
    border-radius: 50%;
    border: 2px solid #333;
  }

  .notch-speaker {
    width: 48px; height: 4px;
    background: #222;
    border-radius: 4px;
  }

  .phone-screen {
    width: 100%;
    height: 100%;
    background: var(--darker);
    border-radius: 40px;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .screen-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    padding-top: 104px; /* Space for status bar (48) + profile bar (56) */
  }
  .screen-content::-webkit-scrollbar { display: none; }

  /* Status bar */
  .status-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    padding: 12px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50;
    background: linear-gradient(to bottom, var(--darker) 70%, transparent);
    font-size: 12px;
    font-weight: 600;
  }

  .status-icons { display: flex; gap: 4px; align-items: center; }
  .status-dot { width: 4px; height: 14px; background: white; border-radius: 2px; }
  .status-dot.half { height: 10px; opacity: 0.5; }
  .status-dot.quarter { height: 7px; opacity: 0.3; }

  /* Bottom nav */
  .bottom-nav {
    display: flex;
    border-top: 1px solid var(--border);
    background: rgba(10,14,26,0.95);
    backdrop-filter: blur(12px);
    padding: 8px 0 16px;
    flex-shrink: 0;
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px;
    cursor: pointer;
    background: none;
    border: none;
    color: var(--muted);
    font-size: 10px;
    font-family: 'Manrope', sans-serif;
    transition: color 0.2s;
    position: relative;
  }
  .nav-item.active { color: var(--teal); }
  .nav-item svg { width: 22px; height: 22px; }

  .cart-badge {
    position: absolute;
    top: 2px;
    right: calc(50% - 16px);
    width: 16px; height: 16px;
    background: var(--orange);
    border-radius: 50%;
    font-size: 9px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  /* Page header */
  .page-header {
    padding: 16px 20px 12px;
    background: var(--darker);
    position: sticky;
    top: 0;
    z-index: 30;
  }

  .page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--text);
  }

  .page-subtitle { font-size: 13px; color: var(--muted); margin-top: 2px; }

  /* Home hero */
  .home-hero {
    padding: 20px;
    background: linear-gradient(135deg, rgba(0,173,181,0.15) 0%, rgba(255,87,34,0.08) 100%);
    border-bottom: 1px solid var(--border);
  }

  .hero-greeting { font-size: 13px; color: var(--teal); font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
  .hero-heading { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
  .hero-heading span { color: var(--teal); }

  .search-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 12px 16px;
    transition: border-color 0.2s;
  }
  .search-bar:focus-within { border-color: var(--teal); }
  .search-bar svg { color: var(--muted); flex-shrink: 0; width: 18px; height: 18px; }
  .search-bar input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 14px;
    font-family: 'Manrope', sans-serif;
  }
  .search-bar input::placeholder { color: var(--muted); }
  .search-btn {
    background: var(--teal);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: 'Manrope', sans-serif;
    transition: opacity 0.2s;
  }
  .search-btn:hover { opacity: 0.88; }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Cuisine pills */
  .section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    padding: 0 20px;
    margin: 20px 0 12px;
  }

  .pill-scroll {
    display: flex;
    gap: 8px;
    padding: 0 20px;
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 4px;
  }
  .pill-scroll::-webkit-scrollbar { display: none; }

  .cuisine-pill {
    flex-shrink: 0;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--muted);
    font-family: 'Manrope', sans-serif;
    transition: all 0.18s;
  }
  .cuisine-pill.active {
    border-color: var(--teal);
    background: rgba(0,173,181,0.15);
    color: var(--teal);
  }

  /* Restaurant cards */
  .restaurant-list { padding: 12px 20px 20px; display: flex; flex-direction: column; gap: 14px; }

  .restaurant-card {
    background: var(--card);
    border-radius: 18px;
    border: 1px solid var(--border);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .restaurant-card:active { transform: scale(0.97); }
  .restaurant-card:hover { box-shadow: 0 8px 30px rgba(0,173,181,0.12); border-color: rgba(0,173,181,0.25); }

  .r-img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    background: linear-gradient(135deg, #1a2235, #0f172a);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
  }
  .r-img img { width: 100%; height: 100%; object-fit: cover; }

  .r-body { padding: 14px; }
  .r-name { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .r-meta { font-size: 12px; color: var(--muted); display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  .r-meta span { display: flex; align-items: center; gap: 3px; }

  .r-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .r-tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(0,173,181,0.12); color: var(--teal); border: 1px solid rgba(0,173,181,0.2); }
  .r-tag.orange { background: rgba(255,87,34,0.12); color: var(--orange); border-color: rgba(255,87,34,0.2); }
  .r-tag.gold { background: rgba(255,215,0,0.12); color: #FFD700; border-color: rgba(255,215,0,0.3); }

  .bestseller-badge {
    background: linear-gradient(135deg, #FF5722, #FF9800);
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    display: inline-block;
  }

  .open-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
  .open-badge.open { background: rgba(16,185,129,0.15); color: #10B981; }
  .open-badge.closed { background: rgba(239,68,68,0.15); color: #EF4444; }

  /* Restaurant Detail */
  .detail-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
    background: var(--card);
  }

  .detail-header { padding: 16px 20px 12px; border-bottom: 1px solid var(--border); }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--teal);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 12px;
    font-family: 'Manrope', sans-serif;
  }

  .detail-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .detail-meta { font-size: 13px; color: var(--muted); display: flex; gap: 14px; }

  .menu-category { padding: 18px 20px 4px; }
  .menu-category-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--teal); margin-bottom: 10px; }

  .menu-item {
    display: flex;
    gap: 12px;
    padding: 14px;
    margin-bottom: 10px;
    background: var(--card);
    border-radius: 14px;
    border: 1px solid var(--border);
    align-items: flex-start;
  }

  .menu-item-img {
    width: 72px; height: 72px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
  .menu-item-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }

  .menu-item-body { flex: 1; min-width: 0; }
  .menu-item-name { font-weight: 700; font-size: 14px; margin-bottom: 3px; }
  .menu-item-desc { font-size: 12px; color: var(--muted); margin-bottom: 8px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .menu-item-footer { display: flex; align-items: center; justify-content: space-between; }
  .menu-item-price { font-weight: 800; font-size: 15px; color: var(--teal); }

  .add-btn {
    width: 32px; height: 32px;
    background: var(--teal);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.18s;
    line-height: 1;
  }
  .add-btn:hover { background: #009AA0; }

  .qty-ctrl {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,173,181,0.1);
    border: 1px solid rgba(0,173,181,0.3);
    border-radius: 10px;
    padding: 2px 10px;
  }
  .qty-btn {
    background: none;
    border: none;
    color: var(--teal);
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }
  .qty-num { font-weight: 700; font-size: 14px; min-width: 16px; text-align: center; }

  .veg-dot {
    width: 12px; height: 12px;
    border-radius: 2px;
    border: 2px solid;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
    flex-shrink: 0;
  }
  .veg-dot::after { content: ''; width: 5px; height: 5px; border-radius: 50%; display: block; }
  .veg-dot.veg { border-color: #10B981; }
  .veg-dot.veg::after { background: #10B981; }
  .veg-dot.nonveg { border-color: #EF4444; }
  .veg-dot.nonveg::after { background: #EF4444; }

  /* Cart bar */
  .cart-bar {
    position: sticky;
    bottom: 0;
    background: linear-gradient(135deg, var(--teal), #008a91);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    z-index: 40;
    box-shadow: 0 -4px 20px rgba(0,173,181,0.3);
  }
  .cart-bar-left { font-size: 13px; font-weight: 600; }
  .cart-bar-items { font-size: 11px; opacity: 0.8; }
  .cart-bar-total { font-size: 16px; font-weight: 800; }

  /* Cart page */
  .cart-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
  }
  .cart-item-name { flex: 1; font-weight: 600; font-size: 14px; }
  .cart-item-price { font-size: 13px; color: var(--muted); margin-top: 2px; }

  .cart-total-section {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    background: var(--card);
    margin: 0 20px;
    border-radius: 14px;
  }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total-row.grand { font-weight: 800; font-size: 16px; border-top: 1px solid var(--border); padding-top: 12px; margin-top: 6px; color: var(--teal); }

  /* Checkout */
  .form-field { padding: 0 20px; margin-bottom: 16px; }
  .form-field label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 6px; }
  .form-field input, .form-field textarea {
    width: 100%;
    background: var(--card);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    color: var(--text);
    font-size: 14px;
    font-family: 'Manrope', sans-serif;
    outline: none;
    transition: border-color 0.2s;
    resize: none;
  }
  .form-field input:focus, .form-field textarea:focus { border-color: var(--teal); }

  /* Primary button */
  .primary-btn {
    width: calc(100% - 40px);
    margin: 0 20px;
    padding: 16px;
    background: linear-gradient(135deg, var(--teal), #008a91);
    color: white;
    border: none;
    border-radius: 14px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: opacity 0.18s, transform 0.1s;
    letter-spacing: 0.3px;
  }
  .primary-btn:active { transform: scale(0.97); }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Success page */
  .success-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80%;
    padding: 32px 20px;
    text-align: center;
  }
  .success-icon {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, rgba(0,173,181,0.2), rgba(16,185,129,0.2));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin-bottom: 20px;
    animation: bounceIn 0.5s ease;
  }
  @keyframes bounceIn { 0% { transform: scale(0); opacity:0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity:1; } }
  .success-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 10px; }
  .success-subtitle { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 8px; }
  .order-id-display { font-size: 20px; font-weight: 800; color: var(--teal); font-family: 'Space Grotesk', sans-serif; background: rgba(0,173,181,0.1); padding: 8px 20px; border-radius: 10px; margin: 12px 0; }

  /* Loading / empty states */
  .center-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; color: var(--muted); text-align: center; gap: 12px; }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--teal); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-icon { font-size: 40px; margin-bottom: 8px; }
  .empty-title { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
  .empty-desc { font-size: 13px; }

  /* Scrollable menu page body */
  .menu-page-body { padding-bottom: 80px; }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─────────────────────────────────────────────────────────────
// UI COMPONENTS & HELPERS
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// PAGE: SUCCESS
// ─────────────────────────────────────────────────────────────
const SuccessPage = ({ orderId, onNavigate }) => {
  return (
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
};

// ─────────────────────────────────────────────────────────────
// PAGE: HOME
// ─────────────────────────────────────────────────────────────
const HomePage = ({ onNavigate }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const CUISINES = ['Pizza', 'Burgers', 'Chinese', 'Indian', 'Healthy', 'Mexican', 'Thai'];

  const handleSearch = async () => {
    if (!pincode.trim() || pincode.length < 6) return;
    setLoading(true);
    setTimeout(() => { onNavigate('list', { pincode }); setLoading(false); }, 200);
  };

  const STEPS = [
    { icon: <FiSearch />, title: 'Search by Pincode', desc: 'Find all cloud kitchens near you' },
    { icon: <FiCoffee />, title: 'Browse Menus', desc: 'Explore dishes from your favourite kitchen' },
    { icon: <FiSmartphone />, title: 'Place Order', desc: 'Your order goes live on the kitchen dashboard' }
  ];

  return (
    <div>
      <div className="home-hero">
        <div className="hero-greeting"><FiZap style={{ verticalAlign: 'middle', marginRight: 4 }} /> CLOUDARC EATS</div>
        <div className="hero-heading">Order food from your<br/><span>cloud kitchen</span></div>
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Enter your pincode..."
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch} disabled={loading || pincode.length < 6}>
            {loading ? '...' : 'Find'}
          </button>
        </div>
      </div>

      <div className="section-label">Explore Cuisines</div>
      <div className="pill-scroll">
        {CUISINES.map(c => (
          <div key={c} className="cuisine-pill" onClick={() => {}}>{c}</div>
        ))}
      </div>

      <div className="section-label">How it works</div>
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map(({ icon, title, desc }) => (
          <div key={title} style={{ display: 'flex', gap: 14, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: 'var(--teal)', fontSize: 20 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: RESTAURANT LIST
// ─────────────────────────────────────────────────────────────
const RestaurantListPage = ({ pincode, onNavigate }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    customerApi.getRestaurantsByPincode(pincode)
      .then(data => setRestaurants(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [pincode]);

  const allCuisines = ['All', ...new Set(restaurants.flatMap(r => r.cuisine_types || []))];
  const filtered = filter === 'All' ? restaurants : restaurants.filter(r => (r.cuisine_types || []).includes(filter));

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => onNavigate('home', {})}><FiChevronLeft /> Back</button>
        <div className="page-title">Near {pincode}</div>
        <div className="page-subtitle">{restaurants.length} restaurants found</div>
      </div>

      <div className="pill-scroll" style={{ padding: '12px 20px 0' }}>
        {allCuisines.map(c => (
          <div key={c} className={`cuisine-pill ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</div>
        ))}
      </div>

      {loading && <div className="center-state"><div className="spinner"/><span>Finding restaurants...</span></div>}
      {error && <div className="center-state"><div className="empty-icon"><FiAlertTriangle /></div><div className="empty-title">Could not load</div><div className="empty-desc">{error}</div></div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="center-state"><div className="empty-icon"><FiSearch /></div><div className="empty-title">No restaurants found</div><div className="empty-desc">Try a different pincode or cuisine filter</div></div>
      )}

      <div className="restaurant-list">
        {filtered.map(r => (
          <div key={r.id} className="restaurant-card" onClick={() => onNavigate('detail', { restaurantId: r.id })}>
            <div className="r-img">
              {r.logo_url ? <img src={r.logo_url} alt={r.name} onError={(e) => { e.target.parentNode.innerHTML = '<div style="color: var(--muted); opacity: 0.3"><FiImage size={40}/></div>'; }} /> : <FiImage size={40} style={{ color: 'var(--muted)', opacity: 0.3 }} />}
            </div>
            <div className="r-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div className="r-name">{r.name}</div>
                <span className={`open-badge ${r.is_active ? 'open' : 'closed'}`}>{r.is_active ? 'Open' : 'Closed'}</span>
              </div>
              <div className="r-meta">
                <span><FiStar /> {r.rating || '4.0'}</span>
                <span><FiClock /> {r.avg_prep_time || 25} min</span>
                <span><FiMapPin /> {r.city}</span>
              </div>
              <div className="r-tags">
                {(r.cuisine_types || []).slice(0, 3).map(c => <span key={c} className="r-tag">{c}</span>)}
                {r.avg_prep_time <= 20 && <span className="r-tag orange">⚡ Quick</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: RESTAURANT DETAIL + MENU
// ─────────────────────────────────────────────────────────────
const RestaurantDetailPage = ({ restaurantId, onNavigate }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const { cart, addItem, removeItem, totalItems, totalPrice } = useCart();

  useEffect(() => {
    Promise.all([customerApi.getRestaurant(restaurantId), customerApi.getMenu(restaurantId)])
      .then(([rData, mData]) => {
        setRestaurant(rData);
        setMenuItems(mData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image_url,
          isVeg: item.is_veg,
          isBestseller: item.is_bestseller,
          prepTime: item.prep_time,
        })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  const getQty = (itemId) => {
    const found = cart.items.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) return <div style={{ paddingTop: 48 }}><div className="center-state"><div className="spinner"/><span>Loading menu...</span></div></div>;
  if (error || !restaurant) return <div style={{ paddingTop: 48 }}><div className="center-state"><div className="empty-icon">⚠️</div><div className="empty-title">Could not load</div><div className="empty-desc">{error}</div><button className="primary-btn" style={{ marginTop: 16 }} onClick={() => onNavigate('home', {})}>Go Home</button></div></div>;

  const grouped = {};
  filteredMenu.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div className="menu-page-body">
      <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, rgba(0,173,181,0.2), rgba(10,14,26,0.8))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', opacity: 0.5 }}>
          {restaurant.logo_url ? <img src={restaurant.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} /> : <FiImage size={60} />}
        </div>
        <button className="back-btn" style={{ position: 'absolute', top: 12, left: 16, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 12, backdropFilter: 'blur(12px)', color: 'white' }} onClick={() => onNavigate('list', { pincode: restaurant.pincode })}>
          <FiChevronLeft size={18} /> Back
        </button>
      </div>
      </div>

      <div className="detail-header">
        <div className="detail-name">{restaurant.name}</div>
        <div className="detail-meta">
          <span><FiStar /> {restaurant.rating || '4.0'}</span>
          <span><FiClock /> {restaurant.avg_prep_time || 25} min</span>
          <span><FiMapPin /> {restaurant.city}</span>
        </div>
        <div className="r-tags" style={{ marginTop: 8 }}>
          {(restaurant.cuisine_types || []).map(c => <span key={c} className="r-tag">{c}</span>)}
        </div>
      </div>

      <div className="pill-scroll" style={{ padding: '12px 20px' }}>
        {categories.map(c => (
          <div key={c} className={`cuisine-pill ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</div>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="menu-category">
            <div className="menu-category-name">{category}</div>
            {items.map(item => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-img">
                    {item.image ? <img src={item.image} alt={item.name} onError={(e) => { e.target.parentNode.innerHTML = '<div style="color: var(--muted); opacity: 0.3"><FiCoffee size={32}/></div>'; }} /> : <FiCoffee size={32} style={{ color: 'var(--muted)', opacity: 0.3 }} />}
                  </div>
                  <div className="menu-item-body">
                    {item.isBestseller && <div className="bestseller-badge"><FiStar style={{ marginRight: 4 }} /> Bestseller</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`}></div>
                      <div className="menu-item-name">{item.name}</div>
                    </div>
                    {item.description && <div className="menu-item-desc">{item.description}</div>}
                    <div className="menu-item-footer">
                      <div className="menu-item-price">₹{item.price}</div>
                      {qty === 0 ? (
                        <button className="add-btn" onClick={() => addItem(restaurant.id, restaurant.name, item)}><FiPlus size={18}/></button>
                      ) : (
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => removeItem(item.id)}><FiMinus size={14}/></button>
                          <span className="qty-num">{qty}</span>
                          <button className="qty-btn" onClick={() => addItem(restaurant.id, restaurant.name, item)}><FiPlus size={14}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="cart-bar" onClick={() => onNavigate('cart', {})}>
          <div className="cart-bar-left">
            <div className="cart-bar-items"><FiShoppingBag style={{ marginRight: 6, verticalAlign: 'middle' }} /> {totalItems} item{totalItems > 1 ? 's' : ''}</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>View Cart <FiArrowRight /></div>
          <div className="cart-bar-total">₹{totalPrice}</div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: CART
// ─────────────────────────────────────────────────────────────
const CartPage = ({ onNavigate }) => {
  const { cart, addItem, removeItem, totalItems, totalPrice } = useCart();

  if (totalItems === 0) return (
    <div>
      <div className="page-header"><div className="page-title">Your Cart</div></div>
      <div className="center-state">
        <div className="empty-icon"><FiShoppingBag size={48} /></div>
        <div className="empty-title">Cart is empty</div>
        <div className="empty-desc">Add items from a restaurant menu</div>
      </div>
      <button className="primary-btn" style={{ marginTop: 24 }} onClick={() => onNavigate('home', {})}>
        <HomeIcon style={{ marginRight: 8 }} /> Browse Restaurants
      </button>
    </div>
  );

  const delivery = 30;
  const taxes = Math.round(totalPrice * 0.05);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Your Cart</div>
        <div className="page-subtitle">{cart.restaurantName}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <div style={{ flex: 1 }}>
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price} each</div>
            </div>
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => removeItem(item.id)}><FiMinus size={14}/></button>
              <span className="qty-num">{item.quantity}</span>
              <button className="qty-btn" onClick={() => addItem(cart.restaurantId, cart.restaurantName, item)}><FiPlus size={14}/></button>
            </div>
            <div style={{ minWidth: 56, textAlign: 'right', fontWeight: 700, fontSize: 14 }}>₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="cart-total-section" style={{ marginBottom: 16 }}>
        <div className="total-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
        <div className="total-row"><span>Delivery</span><span>₹{delivery}</span></div>
        <div className="total-row"><span>GST (5%)</span><span>₹{taxes}</span></div>
        <div className="total-row grand"><span>Total</span><span>₹{totalPrice + delivery + taxes}</span></div>
      </div>

      <button className="primary-btn" onClick={() => onNavigate('checkout', { total: totalPrice + delivery + taxes })}>
        Proceed to Checkout <FiArrowRight style={{ marginLeft: 8 }} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: CHECKOUT
// ─────────────────────────────────────────────────────────────
const CheckoutPage = ({ total, onNavigate }) => {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Protect the checkout page
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
        source_app: 'CloudArc App' // This tells the backend which app is ordering
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
        <div className="page-subtitle">Quick & Secure Checkout</div>
      </div>

      <div style={{ padding: '20px' }}>
        {error && <div style={{ marginBottom: 16, padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, fontSize: 13, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8 }}><FiAlertTriangle /> {error}</div>}

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
          {loading ? 'Processing...' : <><FiCheckCircle style={{ marginRight: 8 }} /> Confirm & Place Order</>}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: LOGIN
// ─────────────────────────────────────────────────────────────
const LoginPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await customerApi.login(form.email, form.password);
      login(res.customer, res.token);
      onNavigate('home', {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="hero-heading">Welcome<br/><span>back!</span></div>
      <div style={{ marginTop: 24 }}>
        {error && <div style={{ color: '#EF4444', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-field" style={{ padding: 0 }}>
          <label>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="rahul@example.com" />
        </div>
        <div className="form-field" style={{ padding: 0 }}>
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
        </div>
        <button className="primary-btn" style={{ margin: '24px 0 0', width: '100%' }} onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login Now'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#94A3B8' }}>
          Don't have an account? <span style={{ color: '#00ADB5', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('register', {})}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: REGISTER
// ─────────────────────────────────────────────────────────────
const RegisterPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    try {
      const res = await customerApi.register(form);
      login(res.customer, res.token);
      onNavigate('home', {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px' }}>
      <div className="hero-heading">Create<br/><span>Account</span></div>
      <div style={{ marginTop: 24 }}>
        {error && <div style={{ color: '#EF4444', marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div className="form-field" style={{ padding: 0 }}>
          <label>Full Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Rahul Sharma" />
        </div>
        <div className="form-field" style={{ padding: 0 }}>
          <label>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="rahul@example.com" />
        </div>
        <div className="form-field" style={{ padding: 0 }}>
          <label>Password</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 6 characters" />
        </div>
        <button className="primary-btn" style={{ margin: '24px 0 0', width: '100%' }} onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#94A3B8' }}>
          Already have an account? <span style={{ color: '#00ADB5', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('login', {})}>Login</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PAGE: ORDER HISTORY
// ─────────────────────────────────────────────────────────────
const OrderHistoryPage = ({ onNavigate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    customerApi.getOrderHistory(token)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return (
    <div className="center-state" style={{ height: '70%' }}>
      <div className="empty-icon"><FiActivity size={48} /></div>
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
            <div key={o.id} style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{o.restaurant_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Order {o.order_number}</div>
                </div>
                <div className={`open-badge ${(o.status === 'dispatched' || o.status === 'completed') ? 'open' : ''}`} style={{ alignSelf: 'flex-start', background: 'rgba(0,173,181,0.1)', color: 'var(--teal)' }}>
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

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
const AppContent = () => {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});
  const { totalItems } = useCart();
  const { user, token, logout } = useAuth();

  const navigate = (p, ps) => { setPage(p); setParams(ps); };

  const navItems = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'orders', label: 'Orders', Icon: HistoryIcon },
    { id: 'cart', label: 'Cart', Icon: CartIcon, badge: totalItems },
    { id: user ? 'profile' : 'login', label: user ? 'Me' : 'Login', Icon: UserIcon },
  ];

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage onNavigate={navigate} />;
      case 'list': return <RestaurantListPage pincode={params.pincode} onNavigate={navigate} />;
      case 'detail': return <RestaurantDetailPage restaurantId={params.restaurantId} onNavigate={navigate} />;
      case 'cart': return <CartPage onNavigate={navigate} />;
      case 'checkout': return <CheckoutPage total={params.total} onNavigate={navigate} />;
      case 'success': return <SuccessPage orderId={params.orderId} onNavigate={navigate} />;
      case 'login': return <LoginPage onNavigate={navigate} />;
      case 'register': return <RegisterPage onNavigate={navigate} />;
      case 'orders': return <OrderHistoryPage onNavigate={navigate} />;
      case 'profile': return (
        <div style={{ padding: 20 }}>
          <div className="page-header"><div className="page-title">My Profile</div></div>
          <div className="center-state">
            <div className="success-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--teal)' }}><FiUser size={40} /></div>
            <div className="success-title">{user?.name}</div>
            <div className="success-subtitle">{user?.email}</div>
            <button className="primary-btn" style={{ marginTop: 40, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => { logout(); navigate('home', {}); }}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      );
      default: return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <>
      <style>{globalStyle}</style>
      <div className="app-stage">
        <div className="phone-outer">
          <div className="phone-notch">
            <div className="notch-speaker" />
            <div className="notch-cam" />
          </div>
          <div className="phone-screen">
            {/* Status bar */}
            <div className="status-bar">
              <span style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700 }}>9:41</span>
              <div className="status-icons">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><rect x="0" y="4" width="3" height="8" rx="1"/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1"/><rect x="9" y="0.5" width="3" height="11.5" rx="1"/><rect x="13.5" y="0" width="2" height="12" rx="1" opacity="0.3"/></svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><path d="M8 2.5C10.2 2.5 12.2 3.4 13.7 4.9L15 3.6C13.2 1.8 10.7 0.8 8 0.8C5.3 0.8 2.8 1.8 1 3.6L2.3 4.9C3.8 3.4 5.8 2.5 8 2.5Z" opacity="0.4"/><path d="M8 5C9.5 5 10.9 5.6 12 6.6L13.3 5.3C11.9 4 10 3.2 8 3.2C6 3.2 4.1 4 2.7 5.3L4 6.6C5.1 5.6 6.5 5 8 5Z" opacity="0.7"/><circle cx="8" cy="9" r="1.8"/></svg>
                <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="white" strokeOpacity="0.35"/><rect x="1.5" y="1.5" width="17" height="9" rx="2.5" fill="white"/><path d="M23.5 4v4a2 2 0 000-4z" fill="white" opacity="0.4"/></svg>
              </div>
            </div>

            {/* Top Profile Bar */}
            <div style={{ 
              position: 'absolute', 
              top: 48, 
              left: 0, 
              right: 0, 
              padding: '12px 20px', 
              background: 'rgba(10,14,26,0.85)', 
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ 
                  width: 32, height: 32, 
                  background: 'linear-gradient(135deg, var(--teal), #008a91)', 
                  borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: 'white'
                }}>
                  {user ? user.name[0].toUpperCase() : <UserIcon />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {user ? `Hey, ${user.name.split(' ')[0]}` : 'Welcome Guest'}
                </div>
              </div>
              {!user && (
                <button 
                  onClick={() => navigate('login', {})} 
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Screen content */}
            <div className="screen-content">
              {renderPage()}
            </div>

            {/* Bottom nav */}
            {!['checkout', 'success'].includes(page) && (
              <div className="bottom-nav">
                {navItems.map(({ id, label, Icon, badge }) => (
                  <button key={id} className={`nav-item ${(page === id || (page === 'home' && id === 'home')) ? 'active' : ''}`} onClick={() => navigate(id, {})}>
                    {badge > 0 && <span className="cart-badge">{badge}</span>}
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side info — visible on wider screens */}
        <div style={{ marginLeft: 48, maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
              CloudArc <span style={{ color: 'var(--teal)' }}>Customer</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Discover cloud kitchens in your area. Browse menus and place orders that go live on the kitchen's POS dashboard instantly.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: <FiSearch />, t: 'Search by Pincode', d: 'Finds all restaurants registered on CloudArc POS in that area' },
              { icon: <FiCoffee />, t: 'Browse & Order', d: 'Orders appear live on the Kanban board in POS dashboard' },
              { icon: <FiZap />, t: 'Real-time Sync', d: 'Same Flask API, same database — one unified backend' }
            ].map(({ icon, t, d }) => (
              <div key={t} style={{ display: 'flex', gap: 14, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: 'var(--teal)', fontSize: 20 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, color: 'var(--text)' }}>{t}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '16px', background: 'rgba(0,173,181,0.05)', borderRadius: 14, border: '1px solid rgba(0,173,181,0.15)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <FiInfo size={18} style={{ color: 'var(--teal)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--teal)', display: 'block', marginBottom: 4 }}>API Configuration</strong>
              Add your Flask URL to <code>.env</code> as <code>VITE_API_URL</code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function CustomerApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
