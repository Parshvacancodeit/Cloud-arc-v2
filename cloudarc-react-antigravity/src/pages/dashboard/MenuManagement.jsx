import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiDollarSign, FiClock, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { menuApi } from '../../services/api';
import '../../styles/MenuManagement.css';

const PLATFORM_OPTIONS = ['Zomato', 'Swiggy', 'Uber Eats', 'Direct', 'CloudArc App'];
const BLANK_FORM = { name: '', category: '', price: '', description: '', prepTime: '', veg: true, bestseller: false, platforms: [] };

const MenuManagement = () => {
  const restaurantId = localStorage.getItem('restaurant_id');

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [formError, setFormError] = useState('');

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuApi.getAll(restaurantId);
      // Normalise field names (API uses snake_case)
      setMenuItems(data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        prepTime: item.prep_time,
        available: item.is_available,
        image: item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        platforms: item.platforms || [],
        veg: item.is_veg,
        bestseller: item.is_bestseller,
      })));
    } catch (err) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const categories = ['All', ...new Set(menuItems.map(i => i.category).filter(Boolean))];

  const filteredItems = menuItems.filter(item => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleAvailability = async (item) => {
    const newVal = !item.available;
    setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: newVal } : i));
    try {
      await menuApi.toggleAvailability(item.id, newVal);
    } catch {
      setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, available: item.available } : i));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    setMenuItems(prev => prev.filter(i => i.id !== id));
    try {
      await menuApi.delete(id);
    } catch (err) {
      fetchMenu();
      alert('Failed to delete: ' + err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, category: item.category, price: item.price, description: item.description, prepTime: item.prepTime, veg: item.veg, bestseller: item.bestseller, platforms: item.platforms });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
        prep_time: Number(formData.prepTime),
        is_veg: formData.veg,
        is_bestseller: formData.bestseller,
        platforms: formData.platforms,
      };

      if (editingItem) {
        await menuApi.update(editingItem.id, payload);
      } else {
        await menuApi.create(restaurantId, payload);
      }
      await fetchMenu();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setFormData(BLANK_FORM);
    setFormError('');
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform) ? prev.platforms.filter(p => p !== platform) : [...prev.platforms, platform]
    }));
  };

  if (loading) return (
    <div className="menu-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading menu...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="menu-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ color: '#64748B', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchMenu} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="menu-container">
      <div className="menu-header">
        <div>
          <h1>Menu Management</h1>
          <p>Manage your menu items and availability</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingItem(null); setFormData(BLANK_FORM); setShowAddModal(true); }}>
          <FiPlus /><span>Add Item</span>
        </button>
      </div>

      <div className="menu-controls">
        <div className="search-box">
          <FiSearch />
          <input type="text" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="category-filters">
          {categories.map(cat => (
            <button key={cat} className={`category-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="menu-stats">
        <div className="stat-item"><span className="stat-label">Total Items</span><span className="stat-value">{menuItems.length}</span></div>
        <div className="stat-item"><span className="stat-label">Available</span><span className="stat-value">{menuItems.filter(i => i.available).length}</span></div>
        <div className="stat-item"><span className="stat-label">Categories</span><span className="stat-value">{categories.length - 1}</span></div>
        <div className="stat-item"><span className="stat-label">Bestsellers</span><span className="stat-value">{menuItems.filter(i => i.bestseller).length}</span></div>
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
            <div className="menu-card-image">
              <img src={item.image} alt={item.name} onError={(e) => { e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'; }} />
              {item.bestseller && <div className="bestseller-badge">Bestseller</div>}
              <div className="veg-badge" style={{ background: item.veg ? '#10B981' : '#EF4444' }}>{item.veg ? '●' : '▲'}</div>
            </div>
            <div className="menu-card-content">
              <div className="menu-card-header">
                <h3>{item.name}</h3>
                <button className={`availability-toggle ${item.available ? 'active' : ''}`} onClick={() => toggleAvailability(item)} title={item.available ? 'Click to disable' : 'Click to enable'}>
                  {item.available ? <FiToggleRight /> : <FiToggleLeft />}
                </button>
              </div>
              <p className="menu-card-description">{item.description}</p>
              <div className="menu-card-meta">
                <span className="price"><FiDollarSign />₹{item.price}</span>
                <span className="prep-time"><FiClock />{item.prepTime} min</span>
              </div>
              <div className="platform-badges">
                {(item.platforms || []).map(p => <span key={p} className="platform-badge">{p}</span>)}
              </div>
              <div className="menu-card-actions">
                <button className="action-btn edit" onClick={() => handleEdit(item)}><FiEdit2 /> Edit</button>
                <button className="action-btn delete" onClick={() => handleDelete(item.id)}><FiTrash2 /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="empty-state"><FiSearch /><h3>No items found</h3><p>Try adjusting your search or add a new item</p></div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
              <button className="close-btn" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {formError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>⚠ {formError}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Margherita Pizza" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required placeholder="e.g., Pizza, Burgers" />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required placeholder="299" min="0" />
                </div>
                <div className="form-group">
                  <label>Prep Time (minutes) *</label>
                  <input type="number" value={formData.prepTime} onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })} required placeholder="15" min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows="3" placeholder="Describe your dish..." />
              </div>
              <div className="form-group">
                <label>Available on Platforms</label>
                <div className="platform-checkboxes">
                  {PLATFORM_OPTIONS.map(p => (
                    <label key={p} className="checkbox-label">
                      <input type="checkbox" checked={formData.platforms.includes(p)} onChange={() => handlePlatformToggle(p)} />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.veg} onChange={(e) => setFormData({ ...formData, veg: e.target.checked })} />
                  <span>Vegetarian</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={formData.bestseller} onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })} />
                  <span>Mark as Bestseller</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
