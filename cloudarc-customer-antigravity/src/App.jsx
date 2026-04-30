/**
 * CloudArc Customer App — App.jsx
 *
 * This file is now a LEAN shell (~80 lines) that:
 *  1. Sets up global styles
 *  2. Provides the phone-frame UI chrome (status bar, bottom nav, profile bar)
 *  3. Routes between pages using a simple state machine
 *
 * All page logic lives in src/pages/
 * All styles live in src/styles/globalStyles.js
 * All context lives in src/context/
 * All API calls live in src/services/api.js
 */

import { FiSearch, FiShoppingBag, FiUser, FiZap, FiCoffee, FiInfo, FiLogOut } from 'react-icons/fi';
import { FiShoppingBag as CartIcon } from 'react-icons/fi';
import { FiHome as HomeIcon } from 'react-icons/fi';
import { FiActivity as HistoryIcon } from 'react-icons/fi';
import { FiUser as UserIcon } from 'react-icons/fi';

import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { globalStyle } from './styles/globalStyles';

// Pages
import HomePage from './pages/HomePage';
import RestaurantListPage from './pages/RestaurantListPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// PROFILE PAGE (inline — simple enough to stay here)
// ─────────────────────────────────────────────────────────────
const ProfilePage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <div className="page-header"><div className="page-title">My Profile</div></div>
      <div className="center-state">
        <div className="success-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--teal)' }}><UserIcon size={40} /></div>
        <div className="success-title">{user?.name}</div>
        <div className="success-subtitle">{user?.email}</div>
        {user?.phone && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{user.phone}</div>}
        {user?.address && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{user.address}</div>}
        <button className="primary-btn" style={{ marginTop: 40, background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => { logout(); onNavigate('home', {}); }}>
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN CONTENT (inside providers)
// ─────────────────────────────────────────────────────────────
const AppContent = () => {
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});
  const { totalItems } = useCart();
  const { user, token } = useAuth();

  const navigate = (p, ps) => { setPage(p); setParams(ps); };

  const navItems = [
    { id: 'home',   label: 'Home',   Icon: HomeIcon },
    { id: 'orders', label: 'Orders', Icon: HistoryIcon },
    { id: 'cart',   label: 'Cart',   Icon: CartIcon, badge: totalItems },
    { id: user ? 'profile' : 'login', label: user ? 'Me' : 'Login', Icon: UserIcon },
  ];

  const renderPage = () => {
    switch (page) {
      case 'home':     return <HomePage onNavigate={navigate} />;
      case 'list':     return <RestaurantListPage pincode={params.pincode} onNavigate={navigate} />;
      case 'detail':   return <RestaurantDetailPage restaurantId={params.restaurantId} onNavigate={navigate} />;
      case 'cart':     return <CartPage onNavigate={navigate} />;
      case 'checkout': return <CheckoutPage total={params.total} onNavigate={navigate} />;
      case 'success':  return <SuccessPage orderId={params.orderId} onNavigate={navigate} />;
      case 'login':    return <LoginPage onNavigate={navigate} />;
      case 'register': return <RegisterPage onNavigate={navigate} />;
      case 'orders':   return <OrderHistoryPage onNavigate={navigate} />;
      case 'profile':  return <ProfilePage onNavigate={navigate} />;
      default:         return <HomePage onNavigate={navigate} />;
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

            {/* Top profile bar */}
            <div style={{ position: 'absolute', top: 48, left: 0, right: 0, padding: '12px 20px', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--teal), #008a91)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white' }}>
                  {user ? user.name[0].toUpperCase() : <UserIcon />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {user ? `Hey, ${user.name.split(' ')[0]}` : 'Welcome Guest'}
                </div>
              </div>
              {!user && (
                <button onClick={() => navigate('login', {})} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Sign In
                </button>
              )}
            </div>

            {/* Main content */}
            <div className="screen-content">
              {renderPage()}
            </div>

            {/* Bottom nav */}
            {!['checkout', 'success'].includes(page) && (
              <div className="bottom-nav">
                {navItems.map(({ id, label, Icon, badge }) => (
                  <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id, {})}>
                    {badge > 0 && <span className="cart-badge">{badge}</span>}
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────
export default function CustomerApp() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
