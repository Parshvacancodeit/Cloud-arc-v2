import { useState, useEffect } from 'react';
import { FiChevronLeft, FiStar, FiClock, FiMapPin, FiCoffee, FiImage, FiPlus, FiMinus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { customerApi } from '../services/api';
import { useCart } from '../context/CartContext';

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

  const getQty = (itemId) => {
    const found = cart.items.find(i => i.id === itemId);
    return found ? found.quantity : 0;
  };

  if (loading) return <div style={{ paddingTop: 48 }}><div className="center-state"><div className="spinner"/><span>Loading menu...</span></div></div>;
  if (error || !restaurant) return (
    <div style={{ paddingTop: 48 }}>
      <div className="center-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-title">Could not load</div>
        <div className="empty-desc">{error}</div>
        <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => onNavigate('home', {})}>Go Home</button>
      </div>
    </div>
  );

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);
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
            {restaurant.logo_url
              ? <img src={restaurant.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
              : <FiImage size={60} />}
          </div>
          <button className="back-btn" style={{ position: 'absolute', top: 12, left: 16, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 12, backdropFilter: 'blur(12px)', color: 'white' }}
            onClick={() => onNavigate('list', { pincode: restaurant.pincode })}>
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
                    {item.image
                      ? <img src={item.image} alt={item.name} onError={(e) => { e.target.parentNode.innerHTML = '<div style="color:var(--muted);opacity:0.3"></div>'; }} />
                      : <FiCoffee size={32} style={{ color: 'var(--muted)', opacity: 0.3 }} />}
                  </div>
                  <div className="menu-item-body">
                    {item.isBestseller && <div className="bestseller-badge">⭐ Bestseller</div>}
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
            <div style={{ fontSize: 11, opacity: 0.8 }}><FiShoppingBag style={{ marginRight: 6, verticalAlign: 'middle' }} /> {totalItems} item{totalItems > 1 ? 's' : ''}</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>View Cart <FiArrowRight /></div>
          <div className="cart-bar-total">₹{totalPrice}</div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
