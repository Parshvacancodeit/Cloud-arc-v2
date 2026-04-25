import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiX,
  FiUser, FiRefreshCw, FiAlertCircle, FiClock, FiGrid, FiList,
  FiShield, FiCheck, FiSun, FiMoon, FiStar,
} from 'react-icons/fi';
import { teamApi } from '../../services/api';
import '../../styles/TeamManagement.css';

const ROLES     = ['Head Chef', 'Sous Chef', 'Line Cook', 'Manager', 'Delivery', 'Cashier'];
const SHIFTS    = ['Morning', 'Evening', 'Night', 'Full Day'];
const STATIONS  = ['Grill', 'Fry', 'Cold', 'Dessert', 'Packaging', 'All Stations'];
const PERMISSIONS = [
  { id: 'orders',    label: 'Order Management' },
  { id: 'menu',      label: 'Menu Management' },
  { id: 'team',      label: 'Team Management' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings',  label: 'Settings' },
];
const BLANK = { name: '', role: '', email: '', phone: '', station: '', shift: 'Morning', permissions: [] };

/* ─── Helpers ──────────────────────────────────────────────── */
const SHIFT_META = {
  Morning:  { color: '#10B981', label: 'Morning', sub: '6 AM – 2 PM',  Icon: FiSun  },
  Evening:  { color: '#FF5722', label: 'Evening', sub: '2 PM – 10 PM', Icon: FiSun  },
  Night:    { color: '#8B5CF6', label: 'Night',   sub: '10 PM – 6 AM', Icon: FiMoon },
  'Full Day':{ color: '#00ADB5',label: 'Full Day',sub: '8 AM – 8 PM',  Icon: FiStar },
};

/* ─── Current shift helper ─────────────────────────────────── */
const getCurrentShift = () => {
  const h = new Date().getHours();
  if (h >= 6 && h < 14)  return 'Morning';
  if (h >= 14 && h < 22) return 'Evening';
  return 'Night';
};

/* ─── Shift Schedule strip ──────────────────────────────────── */
const ShiftSchedule = ({ members }) => {
  const shifts = ['Morning', 'Evening', 'Night', 'Full Day'];
  return (
    <div className="shift-schedule-grid">
      {shifts.map(shift => {
        const m = SHIFT_META[shift];
        const inShift = members.filter(mb => mb.shift === shift && mb.status === 'active');
        const isNow = getCurrentShift() === shift || shift === 'Full Day';
        return (
          <div key={shift} className={`shift-block ${isNow ? 'shift-current' : ''}`}>
            <div className="shift-block-header" style={{ borderColor: m.color }}>
              <m.Icon size={14} style={{ color: m.color }} />
              <span className="shift-block-title" style={{ color: m.color }}>{m.label}</span>
              <span className="shift-block-sub">{m.sub}</span>
              {isNow && <span className="shift-now-badge">NOW</span>}
            </div>
            <div className="shift-block-members">
              {inShift.length === 0
                ? <div className="shift-empty">No staff scheduled</div>
                : inShift.map(mb => (
                  <div key={mb.id} className="shift-member-chip">
                    <div className="shift-avatar">{mb.name[0]}</div>
                    <div>
                      <div className="shift-member-name">{mb.name}</div>
                      <div className="shift-member-role">{mb.role} · {mb.station}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── Station Load Bar ──────────────────────────────────────── */
const StationLoad = ({ members }) => {
  const byStation = {};
  members.filter(m => m.status === 'active').forEach(m => {
    const s = m.station || 'Unassigned';
    byStation[s] = (byStation[s] || []);
    byStation[s].push(m);
  });
  const total = members.filter(m => m.status === 'active').length || 1;
  return (
    <div className="station-load-section">
      <h3 className="station-load-title">Station Load</h3>
      <div className="station-bars">
        {Object.entries(byStation).map(([station, mbs]) => (
          <div key={station} className="station-bar-row">
            <span className="station-bar-label">{station}</span>
            <div className="station-bar-track">
              <div
                className="station-bar-fill"
                style={{ width: `${Math.round((mbs.length / total) * 100)}%` }}
              />
            </div>
            <span className="station-bar-count">{mbs.length}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────── */
const TeamManagement = () => {
  const restaurantId = localStorage.getItem('restaurant_id');

  const [teamMembers, setTeamMembers]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [saving, setSaving]             = useState(false);
  const [view, setView]                 = useState('cards'); // 'cards' | 'schedule'

  const [searchTerm, setSearchTerm]     = useState('');
  const [filterRole, setFilterRole]     = useState('All');
  const [filterShift, setFilterShift]   = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData]         = useState(BLANK);
  const [formError, setFormError]       = useState('');

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teamApi.getAll(restaurantId);
      setTeamMembers(data.map(m => ({
        id: m.id, name: m.name, role: m.role, email: m.email,
        phone: m.phone, station: m.station, shift: m.shift,
        status: m.status, joinedDate: m.joined_date,
        permissions: m.permissions || [],
      })));
    } catch (err) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  /* ── Filtering ─────────────────────────────────────────────── */
  const filteredMembers = teamMembers.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || [m.name, m.email, m.role, m.station]
      .some(s => (s || '').toLowerCase().includes(q));
    const matchRole  = filterRole  === 'All' || m.role === filterRole;
    const matchShift = filterShift === 'All' || m.shift === filterShift;
    return matchSearch && matchRole && matchShift;
  });

  /* ── CRUD ──────────────────────────────────────────────────── */
  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, role: member.role, email: member.email,
      phone: member.phone, station: member.station, shift: member.shift,
      permissions: member.permissions });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member?')) return;
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    try { await teamApi.delete(id); }
    catch (err) { fetchTeam(); alert('Failed to remove: ' + err.message); }
  };

  const handleToggleStatus = async (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setTeamMembers(prev => prev.map(m => m.id === member.id ? { ...m, status: newStatus } : m));
    try { await teamApi.update(member.id, { ...member, status: newStatus }); }
    catch { fetchTeam(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); setSaving(true);
    try {
      const payload = { ...formData };
      if (editingMember) {
        await teamApi.update(editingMember.id, payload);
      } else {
        await teamApi.create(restaurantId, payload);
      }
      await fetchTeam();
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Failed to save member');
    } finally { setSaving(false); }
  };

  const resetForm = () => { setShowAddModal(false); setEditingMember(null); setFormData(BLANK); setFormError(''); };

  const togglePermission = (perm) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm],
    }));
  };

  /* ── Stats ─────────────────────────────────────────────────── */
  const active    = teamMembers.filter(m => m.status === 'active').length;
  const onShift   = teamMembers.filter(m => m.shift === getCurrentShift() && m.status === 'active').length;
  const uniqueRoles = new Set(teamMembers.map(m => m.role).filter(Boolean)).size;
  const isFiltering = searchTerm || filterRole !== 'All' || filterShift !== 'All';

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

      {/* ── Header ── */}
      <div className="team-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage shift schedules, stations and staff permissions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn-secondary ${view === 'schedule' ? 'active' : ''}`}
            onClick={() => setView(view === 'cards' ? 'schedule' : 'cards')}
            title="Toggle schedule view"
          >
            {view === 'schedule' ? <><FiList /> Cards</> : <><FiGrid /> Schedule</>}
          </button>
          <button className="btn-primary" onClick={() => { setEditingMember(null); setFormData(BLANK); setShowAddModal(true); }}>
            <FiPlus /><span>Add Member</span>
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="team-stats">
        <div className="stat-card">
          <span className="stat-label">Total Members</span>
          <span className="stat-value">{teamMembers.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value" style={{ color: '#10B981' }}>{active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">On Shift Now</span>
          <span className="stat-value" style={{ color: '#00ADB5' }}>{onShift}</span>
          <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{getCurrentShift()} shift</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Roles</span>
          <span className="stat-value">{uniqueRoles}</span>
        </div>
      </div>

      {/* ── Schedule / Station Load view ── */}
      {view === 'schedule' ? (
        <div>
          <ShiftSchedule members={teamMembers} />
          <StationLoad members={teamMembers} />
        </div>
      ) : (
        <>
          {/* ── Search + Filters ── */}
          <div className="team-controls">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search staff or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="kds-search-clear"
                  title="Clear search"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            <div className="role-filters">
              {['All', ...ROLES].map(role => (
                <button key={role} className={`filter-btn ${filterRole === role ? 'active' : ''}`} onClick={() => setFilterRole(role)}>{role}</button>
              ))}
            </div>
            <div className="role-filters" style={{ marginTop: 6 }}>
              {['All', ...SHIFTS].map(shift => {
                const meta = SHIFT_META[shift];
                return (
                  <button
                    key={shift}
                    className={`filter-btn ${filterShift === shift ? 'active' : ''}`}
                    onClick={() => setFilterShift(shift)}
                    style={filterShift === shift && meta ? { background: meta.color, borderColor: meta.color, color: 'white' } : {}}
                  >
                    {shift === 'All' ? 'All Shifts' : shift}
                    {shift !== 'All' && getCurrentShift() === shift && (
                      <span style={{ marginLeft: 4, fontSize: 9, background: 'rgba(255,255,255,0.3)', padding: '1px 5px', borderRadius: 8 }}>NOW</span>
                    )}
                  </button>
                );
              })}
              {isFiltering && (
                <span style={{ fontSize: 12, color: '#00ADB5', fontWeight: 700, padding: '4px 10px', background: 'rgba(0,173,181,0.08)', borderRadius: 20 }}>
                  {filteredMembers.length} result{filteredMembers.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* ── Member Cards ── */}
          <div className="team-grid">
            {filteredMembers.map(member => {
              const meta = SHIFT_META[member.shift] || SHIFT_META.Morning;
              const isOnNow = getCurrentShift() === member.shift || member.shift === 'Full Day';
              return (
                <div key={member.id} className={`member-card ${member.status !== 'active' ? 'inactive' : ''}`}>
                  {/* Active/Inactive indicator stripe */}
                  <div className="member-status-stripe" style={{ background: member.status === 'active' ? '#10B981' : '#e2e8f0' }} />

                  <div className="member-header">
                    <div className="member-avatar" style={{ background: member.status === 'active' ? `${meta.color}20` : '#f1f5f9', color: meta.color }}>
                      {member.name[0]?.toUpperCase()}
                    </div>
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      <span className="member-role">{member.role}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div className="shift-badge" style={{ background: `${meta.color}18`, color: meta.color }}>
                        <meta.Icon size={11} style={{ marginRight: 3 }} />{member.shift}
                      </div>
                      {isOnNow && member.status === 'active' && (
                        <span className="on-shift-indicator">● On Shift</span>
                      )}
                    </div>
                  </div>

                  <div className="member-details">
                    <div className="detail-row"><FiMail size={13} /><span>{member.email || '—'}</span></div>
                    <div className="detail-row"><FiPhone size={13} /><span>{member.phone || '—'}</span></div>
                    <div className="detail-row"><FiGrid size={13} /><span>Station: <strong>{member.station || 'Not assigned'}</strong></span></div>
                    <div className="detail-row"><FiClock size={13} /><span>Joined {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>
                  </div>

                  {member.permissions && member.permissions.length > 0 && (
                    <div className="permissions-section">
                      <span className="permissions-label"><FiShield size={11} /> Permissions:</span>
                      <div className="permissions-tags">
                        {member.permissions.map(perm => (
                          <span key={perm} className="permission-tag">{perm}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="member-actions">
                    <button
                      className={`action-btn ${member.status === 'active' ? 'status-active' : 'status-inactive'}`}
                      onClick={() => handleToggleStatus(member)}
                      title={member.status === 'active' ? 'Mark as inactive' : 'Mark as active'}
                    >
                      <FiCheck size={13} />
                      {member.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                    <button className="action-btn edit" onClick={() => handleEdit(member)}>
                      <FiEdit2 size={13} /> Edit
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(member.id)}>
                      <FiTrash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="empty-state">
              <FiUser />
              <h3>{isFiltering ? 'No matches found' : 'No team members yet'}</h3>
              <p>{isFiltering ? 'Try adjusting your filters' : 'Add your first staff member to get started'}</p>
              {!isFiltering && (
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditingMember(null); setFormData(BLANK); setShowAddModal(true); }}>
                  <FiPlus /> Add First Member
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Add/Edit Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button className="close-btn" onClick={resetForm}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>
                    ⚠ {formError}
                  </div>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Ravi Kumar" />
                  </div>
                  <div className="form-group">
                    <label>Role *</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                      <option value="">Select Role</option>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="ravi@kitchen.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                  </div>
                  <div className="form-group">
                    <label>Assigned Station *</label>
                    <select value={formData.station} onChange={(e) => setFormData({ ...formData, station: e.target.value })} required>
                      <option value="">Select Station</option>
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shift *</label>
                    <select value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} required>
                      {SHIFTS.map(s => <option key={s} value={s}>{s} ({SHIFT_META[s]?.sub})</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label><FiShield size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Permissions</label>
                  <div className="permissions-grid">
                    {PERMISSIONS.map(perm => (
                      <label key={perm.id} className="checkbox-label">
                        <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => togglePermission(perm.id)} />
                        <span>{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editingMember ? 'Update Member' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
