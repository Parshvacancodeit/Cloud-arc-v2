import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiBook, FiUsers, FiBarChart2, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../../styles/Sidebar.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

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
    // Clear any auth tokens
    localStorage.removeItem('authToken');
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
