import { useState, useEffect, useCallback, useRef } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiDollarSign, FiClock, FiX, FiRefreshCw, FiAlertCircle, FiStar, FiUploadCloud, FiImage } from 'react-icons/fi';
import { IoLeaf, IoFlame, IoFastFoodOutline } from 'react-icons/io5';
import { menuApi } from '../../services/api';
import '../../styles/MenuManagement.css';

const PLATFORM_OPTIONS = ['Zomato', 'Swiggy', 'Uber Eats', 'Direct', 'CloudArc App'];
const BLANK_FORM = { name: '', category: '', price: '', description: '', prepTime: '', veg: true, bestseller: false, platforms: [], imageUrl: '' };

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

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

  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'nonveg' | 'bestseller'

  const filteredItems = menuItems.filter(item => {
    const q = searchTerm.toLowerCase();
    const matchCat    = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = !q || [
      item.name, item.description, item.category,
    ].some(s => (s || '').toLowerCase().includes(q));
    const matchVeg = vegFilter === 'all' ? true
      : vegFilter === 'veg' ? item.veg
      : vegFilter === 'nonveg' ? !item.veg
      : item.bestseller; // 'bestseller'
    return matchCat && matchSearch && matchVeg;
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
    setFormData({ name: item.name, category: item.category, price: item.price, description: item.description, prepTime: item.prepTime, veg: item.veg, bestseller: item.bestseller, platforms: item.platforms, imageUrl: item.image || '' });
    setImagePreview(item.image || '');
    setImageFile(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      let imageUrl = formData.imageUrl || '';

      // Upload new image if one was selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadRes = await menuApi.uploadImage(imageFile);
          imageUrl = uploadRes.url || imageUrl;
        } catch (uploadErr) {
          throw new Error('Image upload failed: ' + (uploadErr.message || 'Unknown error'));
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
        prep_time: Number(formData.prepTime),
        is_veg: formData.veg,
        is_bestseller: formData.bestseller,
        platforms: formData.platforms,
        is_available: editingItem ? editingItem.available : true,
        image_url: imageUrl,
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
    setImageFile(null);
    setImagePreview('');
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform) ? prev.platforms.filter(p => p !== platform) : [...prev.platforms, platform]
    }));
  };

  const handleImageFileChange = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
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
          <input
            type="text"
            placeholder="Search dish or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="kds-search-clear"
            >
              <FiX size={14} />
            </button>
          )}
        </div>
        <div className="category-filters">
          {categories.map(cat => (
            <button key={cat} className={`category-btn ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>{cat}</button>
          ))}
        </div>
        <div className="category-filters" style={{ marginTop: 6 }}>
          {[
            ['all','All'],
            ['veg', <><IoLeaf style={{ color: '#10B981', marginRight: 4 }} /> Veg</>],
            ['nonveg', <><IoFastFoodOutline style={{ color: '#EF4444', marginRight: 4 }} /> Non-veg</>],
            ['bestseller', <><FiStar style={{ color: '#F59E0B', marginRight: 4 }} /> Bestseller</>]
          ].map(([value, label]) => (
            <button key={value} className={`category-btn ${vegFilter === value ? 'active' : ''}`} onClick={() => setVegFilter(value)}>{label}</button>
          ))}
          {(searchTerm || selectedCategory !== 'All' || vegFilter !== 'all') && (
            <span style={{ fontSize: 12, color: '#00ADB5', fontWeight: 700, padding: '4px 10px', background: 'rgba(0,173,181,0.08)', borderRadius: 20 }}>
              {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
            </span>
          )}
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
              {item.bestseller && (
                <div className="bestseller-badge">
                  <IoFlame style={{ marginRight: 3 }} /> Bestseller
                </div>
              )}
              <div className="veg-badge" style={{ background: item.veg ? '#10B981' : '#EF4444' }}>
                {item.veg ? <IoLeaf size={12} /> : <IoFastFoodOutline size={12} />}
              </div>
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

      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
              <button className="close-btn" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
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
                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows="3" placeholder="Describe your dish..." />
                  </div>
                  <div className="form-group full-width">
                    <label>Item Image</label>
                    <div
                      className="image-upload-zone"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFileChange(f); }}
                    >
                      {imagePreview ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={imagePreview} alt="preview" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                          <button
                            type="button"
                            style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(''); setFormData(f => ({ ...f, imageUrl: '' })); }}
                          ><FiX size={12} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#94a3b8' }}>
                          <FiUploadCloud size={32} style={{ color: '#00ADB5' }} />
                          <span style={{ fontWeight: 600, fontSize: 14 }}>Click or drag &amp; drop an image</span>
                          <span style={{ fontSize: 12 }}>PNG, JPG, WEBP — max 5 MB</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleImageFileChange(e.target.files[0])}
                    />
                    {/* Fallback URL input */}
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setImagePreview(e.target.value); setImageFile(null); }}
                      placeholder="Or paste an image URL"
                      style={{ marginTop: 8, padding: '0.6rem 0.9rem', border: '1px solid rgba(0,173,181,0.2)', borderRadius: 8, fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>
                  <div className="form-group full-width">
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
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving || uploadingImage}>{saving || uploadingImage ? (uploadingImage ? 'Uploading…' : 'Saving...') : editingItem ? 'Update Item' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
