import { useState, useEffect } from 'react';
import { FiChevronLeft, FiStar, FiClock, FiMapPin, FiSearch, FiAlertTriangle, FiImage } from 'react-icons/fi';
import { customerApi } from '../services/api';

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

  const isRestaurantOpen = (operatingHours) => {
    try {
      if (!operatingHours || Object.keys(operatingHours).length === 0) return true;
      const now = new Date();
      // Get lowercase day name (e.g., 'monday')
      const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const config = operatingHours[day];
      
      if (!config || config.closed) return false;
      if (!config.open || !config.close) return true; // Default to open if times are missing but not marked closed

      const [nowH, nowM] = [now.getHours(), now.getMinutes()];
      
      const openParts = config.open.split(':');
      const closeParts = config.close.split(':');
      
      if (openParts.length < 2 || closeParts.length < 2) return true;

      const openH = parseInt(openParts[0], 10);
      const openM = parseInt(openParts[1], 10);
      const closeH = parseInt(closeParts[0], 10);
      const closeM = parseInt(closeParts[1], 10);

      const nowTotal = nowH * 60 + nowM;
      const openTotal = openH * 60 + openM;
      const closeTotal = closeH * 60 + closeM;

      if (closeTotal < openTotal) { // Handles overnight hours e.g., 6 PM - 2 AM
        return nowTotal >= openTotal || nowTotal < closeTotal;
      }
      return nowTotal >= openTotal && nowTotal < closeTotal;
    } catch (err) {
      console.error("Error checking restaurant status:", err);
      return true; // Fallback to open on error to avoid blank page
    }
  };

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
        {filtered.map(r => {
          const isOpen = isRestaurantOpen(r.operating_hours);
          return (
            <div key={r.id} className="restaurant-card" onClick={() => onNavigate('detail', { restaurantId: r.id })}>
              <div className="r-img">
                {r.logo_url
                  ? <img src={r.logo_url} alt={r.name} onError={(e) => { e.target.parentNode.innerHTML = '<div style="color: var(--muted); opacity: 0.3"><svg/></div>'; }} />
                  : <FiImage size={40} style={{ color: 'var(--muted)', opacity: 0.3 }} />}
              </div>
              <div className="r-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="r-name">{r.name}</div>
                  <span className={`open-badge ${isOpen ? 'open' : 'closed'}`}>{isOpen ? 'Open Now' : 'Closed'}</span>
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
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantListPage;
