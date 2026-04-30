import { useState, useEffect, useCallback } from 'react';
import { 
  FiUser, FiLock, FiBell, FiMapPin, FiGlobe, FiSave, 
  FiAlertCircle, FiRefreshCw, FiCheckCircle, FiX, 
  FiShield, FiDatabase, FiCode, FiArrowRight 
} from 'react-icons/fi';
import { settingsApi, authApi } from '../../services/api';
import '../../styles/Settings.css';

const DEFAULT_HOURS = {
  monday: { open: '09:00', close: '22:00', closed: false },
  tuesday: { open: '09:00', close: '22:00', closed: false },
  wednesday: { open: '09:00', close: '22:00', closed: false },
  thursday: { open: '09:00', close: '22:00', closed: false },
  friday: { open: '09:00', close: '23:00', closed: false },
  saturday: { open: '09:00', close: '23:00', closed: false },
  sunday: { open: '10:00', close: '22:00', closed: false },
};

const Settings = () => {
  const restaurantId = localStorage.getItem('restaurant_id');
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Security Modals
  const [showPassModal, setShowPassModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.get(restaurantId);
      setSettings({
        kitchenName: data.name || '',
        ownerName: data.owner_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        cuisineTypes: data.cuisine_types || [],
        gstNumber: data.gst_number || '',
        fssaiLicense: data.fssai_license || '',
        avgPrepTime: data.avg_prep_time || 18,
        minOrderValue: data.min_order_value || 0,
        deliveryRadius: data.delivery_radius || 5,
        orderNotifications: data.order_notifications ?? true,
        emailNotifications: data.email_notifications ?? true,
        smsNotifications: data.sms_notifications ?? false,
        lowStockAlerts: data.low_stock_alerts ?? true,
        peakHourReminders: data.peak_hour_reminders ?? true,
        zomatoConnected: data.zomato_connected ?? false,
        swiggyConnected: data.swiggy_connected ?? false,
        uberEatsConnected: data.uber_eats_connected ?? false,
        operatingHours: data.operating_hours || DEFAULT_HOURS,
        isTwoFactorEnabled: data.two_factor_enabled ?? false,
      });
      if (data.avg_prep_time) {
        localStorage.setItem('avg_prep_time', String(data.avg_prep_time));
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      operatingHours: { ...prev.operatingHours, [day]: { ...prev.operatingHours[day], [field]: value } }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: settings.kitchenName,
        owner_name: settings.ownerName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        pincode: settings.pincode,
        cuisine_types: settings.cuisineTypes,
        gst_number: settings.gstNumber,
        fssai_license: settings.fssaiLicense,
        avg_prep_time: settings.avgPrepTime,
        min_order_value: settings.minOrderValue,
        delivery_radius: settings.deliveryRadius,
        order_notifications: settings.orderNotifications,
        email_notifications: settings.emailNotifications,
        sms_notifications: settings.smsNotifications,
        low_stock_alerts: settings.lowStockAlerts,
        peak_hour_reminders: settings.peakHourReminders,
        operating_hours: settings.operatingHours,
        zomato_connected: settings.zomatoConnected,
        swiggy_connected: settings.swiggyConnected,
        uber_eats_connected: settings.uberEatsConnected,
      };
      await settingsApi.update(restaurantId, payload);
      localStorage.setItem('kitchen_name', settings.kitchenName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePassChange = async () => {
    if (!oldPass || !newPass) return alert('Both fields required');
    setPassSaving(true);
    try {
      await authApi.changePassword(oldPass, newPass);
      alert('Password updated successfully!');
      setShowPassModal(false);
      setOldPass(''); setNewPass('');
    } catch (err) {
      alert(err.message || 'Failed to update password');
    } finally {
      setPassSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    const newVal = !settings.isTwoFactorEnabled;
    try {
      await authApi.toggle2FA(newVal);
      setSettings(prev => ({ ...prev, isTwoFactorEnabled: newVal }));
    } catch (err) {
      alert('Failed to toggle 2FA');
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'business', label: 'Business', icon: FiMapPin },
    { id: 'integrations', label: 'Integrations', icon: FiGlobe },
    { id: 'hours', label: 'Operating Hours', icon: FiAlertCircle },
    { id: 'security', label: 'Security', icon: FiLock },
  ];

  if (loading) return (
    <div className="settings-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div><h1>Settings</h1><p>Manage your kitchen preferences and configurations</p></div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <FiSave /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {showSuccess && <div className="success-banner"><FiCheckCircle /><span>Settings saved successfully!</span></div>}

      <div className="settings-layout">
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <tab.icon /><span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Kitchen Profile</h2>
              <p className="section-description">Update your kitchen information visible to customers</p>
              <div className="form-grid">
                {[
                  ['kitchenName', 'Kitchen Name', 'text'],
                  ['ownerName', 'Owner Name', 'text'],
                  ['email', 'Email', 'email'],
                  ['phone', 'Phone', 'tel']
                ].map(([field, label, type]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <input type={type} value={settings[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
                  </div>
                ))}
                <div className="form-group full-width"><label>Address</label><input type="text" value={settings.address} onChange={(e) => handleInputChange('address', e.target.value)} /></div>
                {[['city', 'City'], ['state', 'State'], ['pincode', 'PIN Code']].map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <input type="text" value={settings[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="settings-section">
              <h2>Business Settings</h2>
              <p className="section-description">Configure your business details and operational capacity</p>
              <div className="form-grid">
                <div className="form-group"><label>GST Number</label><input type="text" value={settings.gstNumber} onChange={(e) => handleInputChange('gstNumber', e.target.value)} /></div>
                <div className="form-group"><label>FSSAI License</label><input type="text" value={settings.fssaiLicense} onChange={(e) => handleInputChange('fssaiLicense', e.target.value)} /></div>
                <div className="form-group"><label>Avg Prep Time (min)</label><input type="number" value={settings.avgPrepTime} onChange={(e) => handleInputChange('avgPrepTime', e.target.value)} /></div>
                <div className="form-group"><label>Min Order Value (₹)</label><input type="number" value={settings.minOrderValue} onChange={(e) => handleInputChange('minOrderValue', e.target.value)} /></div>
                <div className="form-group"><label>Delivery Radius (km)</label><input type="number" value={settings.deliveryRadius} onChange={(e) => handleInputChange('deliveryRadius', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Platform Integrations</h2>
              <p className="section-description">Manage your delivery platform connections</p>
              
              <div className="integration-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  ['zomatoConnected', 'Zomato', 'Sync orders from Zomato', '#E23744', 'Z'],
                  ['swiggyConnected', 'Swiggy', 'Sync orders from Swiggy', '#FC8019', 'S'],
                ].map(([field, name, desc, color, letter]) => (
                  <div key={field} className="integration-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(0,173,181,0.1)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{letter}</div>
                      <div>
                        <h4 style={{ margin: 0, fontWeight: 700 }}>{name}</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{desc}</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings[field]} onChange={(e) => handleInputChange(field, e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Technical API Mapping Panel */}
              <div className="mapping-panel">
                <div className="mapping-header">
                  <FiCode /> <span>CloudArc API Normalization Engine</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  The CloudArc Integrator standardizes payloads from various sources into a unified structure. 
                  This allows your kitchen to handle orders from Zomato, Swiggy, and direct apps using a single, consistent API.
                </p>
                <table className="mapping-table">
                  <thead>
                    <tr>
                      <th>Source Parameter</th>
                      <th></th>
                      <th>Standard CloudArc Key</th>
                      <th>Origin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="source-param">order_id</td>
                      <td><FiArrowRight size={10}/></td>
                      <td className="standard-param">order_number</td>
                      <td><span className="app-badge">Zomato</span></td>
                    </tr>
                    <tr>
                      <td className="source-param">order_reference</td>
                      <td><FiArrowRight size={10}/></td>
                      <td className="standard-param">order_number</td>
                      <td><span className="app-badge">Swiggy</span></td>
                    </tr>
                    <tr>
                      <td className="source-param">customer_full_name</td>
                      <td><FiArrowRight size={10}/></td>
                      <td className="standard-param">customer_name</td>
                      <td><span className="app-badge">Zomato</span></td>
                    </tr>
                    <tr>
                      <td className="source-param">cart_items_json</td>
                      <td><FiArrowRight size={10}/></td>
                      <td className="standard-param">items</td>
                      <td><span className="app-badge">Unified</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="settings-section">
              <h2>Operating Hours</h2>
              <p className="section-description">Manage your weekly kitchen availability</p>
              <div className="hours-grid">
                {days.map(day => (
                  <div key={day} className={`hour-card ${settings.operatingHours[day]?.closed ? 'closed' : ''}`}>
                    <div className="hour-card-header">
                      <span className="day-name">{day}</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={!settings.operatingHours[day]?.closed} onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    {!settings.operatingHours[day]?.closed ? (
                      <div className="time-inputs-group">
                        <div className="time-row">
                          <label>Open</label>
                          <input type="time" value={settings.operatingHours[day]?.open || '09:00'} onChange={(e) => handleHoursChange(day, 'open', e.target.value)} />
                        </div>
                        <div className="time-row">
                          <label>Close</label>
                          <input type="time" value={settings.operatingHours[day]?.close || '22:00'} onChange={(e) => handleHoursChange(day, 'close', e.target.value)} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1rem 0', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Closed for the day</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">Manage your account security and authentication</p>
              <div className="security-options">
                <div className="security-card">
                  <FiLock className="security-icon" />
                  <h4>Change Password</h4>
                  <p>Regularly update your password to keep your kitchen data safe.</p>
                  <button className="btn-secondary" onClick={() => setShowPassModal(true)}>Update Password</button>
                </div>
                <div className="security-card">
                  <FiShield className="security-icon" />
                  <div className={`status-indicator ${settings.isTwoFactorEnabled ? 'active' : 'inactive'}`}>
                    {settings.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  <h4>Two-Factor Auth</h4>
                  <p>Add an extra layer of security to your login process.</p>
                  <button className={settings.isTwoFactorEnabled ? 'btn-secondary' : 'btn-primary'} onClick={handleToggle2FA}>
                    {settings.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPassModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Password</h3>
              <button className="icon-btn" onClick={() => setShowPassModal(false)}><FiX /></button>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Current Password</label>
              <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>New Password</label>
              <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
            </div>
            <button className="btn-primary full-width" style={{ width: '100%' }} onClick={handlePassChange} disabled={passSaving}>
              {passSaving ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
