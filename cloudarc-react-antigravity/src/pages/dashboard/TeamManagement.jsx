import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiClock, FiX, FiUser, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { teamApi } from '../../services/api';
import '../../styles/TeamManagement.css';

const ROLES = ['Head Chef', 'Sous Chef', 'Line Cook', 'Manager', 'Delivery', 'Cashier'];
const SHIFTS = ['Morning', 'Evening', 'Night', 'Full Day'];
const STATIONS = ['Station 1', 'Station 2', 'Station 3', 'Station 4', 'All'];
const PERMISSIONS = [
  { id: 'orders', label: 'Order Management' },
  { id: 'menu', label: 'Menu Management' },
  { id: 'team', label: 'Team Management' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];
const BLANK_FORM = { name: '', role: '', email: '', phone: '', station: '', shift: 'Morning', permissions: [] };

const TeamManagement = () => {
  const restaurantId = localStorage.getItem('restaurant_id');

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(BLANK_FORM);
  const [formError, setFormError] = useState('');

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamApi.getAll(restaurantId);
      // Normalise snake_case from API
      setTeamMembers(data.map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        email: m.email,
        phone: m.phone,
        station: m.station,
        shift: m.shift,
        status: m.status,
        joinedDate: m.joined_date,
        permissions: m.permissions || [],
      })));
    } catch (err) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const filteredMembers = teamMembers.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'All' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, role: member.role, email: member.email, phone: member.phone, station: member.station, shift: member.shift, permissions: member.permissions });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    try {
      await teamApi.delete(id);
    } catch (err) {
      fetchTeam();
      alert('Failed to remove: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        station: formData.station,
        shift: formData.shift,
        permissions: formData.permissions,
      };
      if (editingMember) {
        await teamApi.update(editingMember.id, payload);
      } else {
        await teamApi.create(restaurantId, payload);
      }
      await fetchTeam();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingMember(null);
    setFormData(BLANK_FORM);
    setFormError('');
  };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm]
    }));
  };

  const getShiftColor = (shift) => ({ Morning: '#10B981', Evening: '#FF5722', Night: '#8B5CF6', 'Full Day': '#00ADB5' }[shift] || '#64748B');

  if (loading) return (
    <div className="team-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading team...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="team-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ color: '#64748B', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchTeam} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="team-container">
      <div className="team-header">
        <div><h1>Team Management</h1><p>Manage your kitchen staff and permissions</p></div>
        <button className="btn-primary" onClick={() => { setEditingMember(null); setFormData(BLANK_FORM); setShowAddModal(true); }}>
          <FiPlus /><span>Add Member</span>
        </button>
      </div>

      <div className="team-controls">
        <div className="search-box">
          <FiSearch />
          <input type="text" placeholder="Search team members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="role-filters">
          {['All', ...ROLES].map(role => (
            <button key={role} className={`filter-btn ${filterRole === role ? 'active' : ''}`} onClick={() => setFilterRole(role)}>{role}</button>
          ))}
        </div>
      </div>

      <div className="team-stats">
        <div className="stat-card"><span className="stat-label">Total Members</span><span className="stat-value">{teamMembers.length}</span></div>
        <div className="stat-card"><span className="stat-label">Active</span><span className="stat-value">{teamMembers.filter(m => m.status === 'active').length}</span></div>
        <div className="stat-card"><span className="stat-label">Morning Shift</span><span className="stat-value">{teamMembers.filter(m => m.shift === 'Morning').length}</span></div>
        <div className="stat-card"><span className="stat-label">Evening Shift</span><span className="stat-value">{teamMembers.filter(m => m.shift === 'Evening').length}</span></div>
      </div>

      <div className="team-grid">
        {filteredMembers.map(member => (
          <div key={member.id} className="member-card">
            <div className="member-header">
              <div className="member-avatar"><FiUser /></div>
              <div className="member-info"><h3>{member.name}</h3><span className="member-role">{member.role}</span></div>
              <div className="shift-badge" style={{ background: `${getShiftColor(member.shift)}20`, color: getShiftColor(member.shift) }}>{member.shift}</div>
            </div>
            <div className="member-details">
              <div className="detail-row"><FiMail /><span>{member.email}</span></div>
              <div className="detail-row"><FiPhone /><span>{member.phone}</span></div>
              <div className="detail-row"><FiClock /><span>{member.station}</span></div>
            </div>
            <div className="permissions-section">
              <span className="permissions-label">Permissions:</span>
              <div className="permissions-tags">
                {(member.permissions || []).map(perm => <span key={perm} className="permission-tag">{perm}</span>)}
              </div>
            </div>
            <div className="member-actions">
              <button className="action-btn edit" onClick={() => handleEdit(member)}><FiEdit2 /> Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(member.id)}><FiTrash2 /> Remove</button>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="empty-state"><FiUser /><h3>No team members found</h3><p>Add your first team member to get started</p></div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button className="close-btn" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {formError && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>⚠ {formError}</div>}
              <div className="form-grid">
                <div className="form-group"><label>Full Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" /></div>
                <div className="form-group">
                  <label>Role *</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                    <option value="">Select Role</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="john@example.com" /></div>
                <div className="form-group"><label>Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="+91 98765 43210" /></div>
                <div className="form-group">
                  <label>Station *</label>
                  <select value={formData.station} onChange={(e) => setFormData({ ...formData, station: e.target.value })} required>
                    <option value="">Select Station</option>
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Shift *</label>
                  <select value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} required>
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {PERMISSIONS.map(perm => (
                    <label key={perm.id} className="checkbox-label">
                      <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingMember ? 'Update Member' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
