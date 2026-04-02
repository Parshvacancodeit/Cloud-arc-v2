import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiGrid, FiBook, FiUsers, FiBarChart2, FiSettings, 
  FiLogOut, FiChevronLeft, FiChevronRight, FiToggleLeft, FiToggleRight,
  FiCloud, FiCloudOff
} from 'react-icons/fi';
import { settingsApi } from '../../services/api';
import '../../styles/Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const restaurantId = localStorage.getItem('restaurant_id');

  useEffect(() => {
    const fetchStatus = async () => {
      if (!restaurantId) return;
      try {
        const data = await settingsApi.get(restaurantId);
        setIsOnline(data.is_active);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      } finally {
        setLoadingStatus(false);
      }
    };
    fetchStatus();
  }, [restaurantId]);

  const handleToggleStatus = async () => {
    try {
      const resp = await settingsApi.toggleStatus(restaurantId, !isOnline);
      setIsOnline(resp.is_active);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Overview', exact: true },
    { path: '/dashboard/orders', icon: FiGrid, label: 'Orders' },
    { path: '/dashboard/menu', icon: FiBook, label: 'Menu' },
    { path: '/dashboard/team', icon: FiUsers, label: 'Team' },
    { path: '/dashboard/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/dashboard/settings', icon: FiSettings, label: 'Settings' }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant_id');
    window.location.href = '/login';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          {!collapsed && <span>CloudArc</span>}
          {collapsed && <span className="logo-mini">CA</span>}
        </Link>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path}
                className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className={`status-section ${isOnline ? 'online' : 'offline'} ${collapsed ? 'collapsed' : ''}`}>
          <button className="status-toggle-btn" onClick={handleToggleStatus} disabled={loadingStatus}>
            <div className="status-icon-wrap">
              {isOnline ? <FiCloud className="status-icon" /> : <FiCloudOff className="status-icon" />}
            </div>
            {!collapsed && (
              <div className="status-info">
                <span className="status-text">{isOnline ? 'Online' : 'Paused'}</span>
                <span className="status-subtext">{isOnline ? 'Store is open' : 'Offline'}</span>
              </div>
            )}
            <div className="status-toggle-icon">
              {isOnline ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
            </div>
          </button>
        </div>

        <button 
          className="logout-btn"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : ''}
        >
          <FiLogOut className="nav-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
