import { useState } from 'react';
import { FiSearch, FiZap, FiCoffee, FiSmartphone } from 'react-icons/fi';

const CUISINES = ['Pizza', 'Burgers', 'Chinese', 'Indian', 'Healthy', 'Mexican', 'Thai'];

const STEPS = [
  { icon: <FiSearch />, title: 'Search by Pincode', desc: 'Find all cloud kitchens near you' },
  { icon: <FiCoffee />, title: 'Browse Menus', desc: 'Explore dishes from your favourite kitchen' },
  { icon: <FiSmartphone />, title: 'Place Order', desc: 'Your order goes live on the kitchen dashboard' },
];

const HomePage = ({ onNavigate }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!pincode.trim() || pincode.length < 6) return;
    setLoading(true);
    setTimeout(() => { onNavigate('list', { pincode }); setLoading(false); }, 200);
  };

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

export default HomePage;
