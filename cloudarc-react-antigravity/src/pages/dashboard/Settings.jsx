import { useState, useEffect, useCallback } from 'react';
import { FiUser, FiLock, FiBell, FiMapPin, FiGlobe, FiSave, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { settingsApi } from '../../services/api';
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

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsApi.get(restaurantId);
      // Map API (snake_case) to local state
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
      });
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
      };
      await settingsApi.update(restaurantId, payload);
      // Update localStorage kitchen name
      localStorage.setItem('kitchen_name', settings.kitchenName);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'business', label: 'Business', icon: FiMapPin },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
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

  if (error || !settings) return (
    <div className="settings-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ color: '#64748B', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchSettings} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
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

      {showSuccess && (
        <div className="success-banner">
          <FiAlertCircle /><span>Settings saved successfully!</span>
        </div>
      )}

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
                {[['kitchenName', 'Kitchen Name', 'text'], ['ownerName', 'Owner Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([field, label, type]) => (
                  <div key={field} className="form-group">
                    <label>{label}</label>
                    <input type={type} value={settings[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
                  </div>
                ))}
                <div className="form-group full-width"><label>Address</label><input type="text" value={settings.address} onChange={(e) => handleInputChange('address', e.target.value)} /></div>
                {[['city', 'City'], ['state', 'State'], ['pincode', 'PIN Code']].map(([field, label]) => (
                  <div key={field} className="form-group">
                    <label>{label}{field === 'pincode' && <span style={{ fontSize: '11px', color: '#00ADB5', fontWeight: 400, marginLeft: 4 }}>— used by customer app</span>}</label>
                    <input type="text" value={settings[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="settings-section">
              <h2>Business Settings</h2>
              <p className="section-description">Configure your business details</p>
              <div className="form-grid">
                <div className="form-group"><label>GST Number</label><input type="text" value={settings.gstNumber} onChange={(e) => handleInputChange('gstNumber', e.target.value)} /></div>
                <div className="form-group"><label>FSSAI License</label><input type="text" value={settings.fssaiLicense} onChange={(e) => handleInputChange('fssaiLicense', e.target.value)} /></div>
                <div className="form-group"><label>Avg Prep Time (min)</label><input type="number" value={settings.avgPrepTime} onChange={(e) => handleInputChange('avgPrepTime', e.target.value)} /></div>
                <div className="form-group"><label>Min Order Value (₹)</label><input type="number" value={settings.minOrderValue} onChange={(e) => handleInputChange('minOrderValue', e.target.value)} /></div>
                <div className="form-group"><label>Delivery Radius (km)</label><input type="number" value={settings.deliveryRadius} onChange={(e) => handleInputChange('deliveryRadius', e.target.value)} /></div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notifications</h2>
              <p className="section-description">Control how you receive alerts</p>
              <div className="toggle-list">
                {[
                  ['orderNotifications', 'Order Notifications', 'Get notified for new orders'],
                  ['emailNotifications', 'Email Notifications', 'Receive updates via email'],
                  ['smsNotifications', 'SMS Notifications', 'Get SMS alerts for critical updates'],
                  ['lowStockAlerts', 'Low Stock Alerts', 'Alert when inventory is running low'],
                  ['peakHourReminders', 'Peak Hour Reminders', 'Get notified before peak hours'],
                ].map(([field, title, desc]) => (
                  <div key={field} className="toggle-item">
                    <div><h4>{title}</h4><p>{desc}</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings[field]} onChange={(e) => handleInputChange(field, e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="settings-section">
              <h2>Platform Integrations</h2>
              <p className="section-description">Manage your delivery platform connections</p>
              <div className="integration-list">
                {[
                  ['zomatoConnected', 'Zomato', 'Sync menu and orders from Zomato', '#E23744', 'Z'],
                  ['swiggyConnected', 'Swiggy', 'Sync menu and orders from Swiggy', '#FC8019', 'S'],
                  ['uberEatsConnected', 'Uber Eats', 'Sync menu and orders from Uber Eats', '#06C167', 'U'],
                ].map(([field, name, desc, color, letter]) => (
                  <div key={field} className="integration-card">
                    <div className="integration-info">
                      <div className="integration-icon" style={{ background: color }}>{letter}</div>
                      <div><h4>{name}</h4><p>{desc}</p></div>
                    </div>
                    <div className="integration-status">
                      {settings[field] ? (
                        <><span className="status-badge connected">Connected</span><button className="btn-secondary small">Configure</button></>
                      ) : (
                        <button className="btn-primary small" onClick={() => handleInputChange(field, true)}>Connect</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="settings-section">
              <h2>Operating Hours</h2>
              <p className="section-description">Set your kitchen working hours</p>
              <div className="hours-list">
                {days.map(day => (
                  <div key={day} className="hours-item">
                    <div className="day-label">
                      <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                      <label className="checkbox-label">
                        <input type="checkbox" checked={!settings.operatingHours[day]?.closed} onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)} />
                        <span>Open</span>
                      </label>
                    </div>
                    {!settings.operatingHours[day]?.closed ? (
                      <div className="time-inputs">
                        <input type="time" value={settings.operatingHours[day]?.open || '09:00'} onChange={(e) => handleHoursChange(day, 'open', e.target.value)} />
                        <span>to</span>
                        <input type="time" value={settings.operatingHours[day]?.close || '22:00'} onChange={(e) => handleHoursChange(day, 'close', e.target.value)} />
                      </div>
                    ) : <span className="closed-badge">Closed</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">Manage your account security</p>
              <div className="security-options">
                <div className="security-card">
                  <FiLock className="security-icon" />
                  <h4>Change Password</h4>
                  <p>Update your account password</p>
                  <button className="btn-secondary">Change Password</button>
                </div>
                <div className="security-card">
                  <FiAlertCircle className="security-icon" />
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security</p>
                  <button className="btn-primary">Enable 2FA</button>
                </div>
                <div className="security-card">
                  <FiUser className="security-icon" />
                  <h4>Active Sessions</h4>
                  <p>Manage your active login sessions</p>
                  <button className="btn-secondary">View Sessions</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
