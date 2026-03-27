import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiBook, FiUsers, FiBarChart2, FiTrendingUp, FiClock, FiPackage, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { dashboardApi } from '../../services/api';
import '../../styles/DashboardHome.css';

const DashboardHome = () => {
  const navigate = useNavigate();
  const restaurantId = localStorage.getItem('restaurant_id');
  const kitchenName = localStorage.getItem('kitchen_name') || 'Your Kitchen';

  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, platformData, ordersData, alertsData] = await Promise.all([
        dashboardApi.getStats(restaurantId),
        dashboardApi.getPlatformStats(restaurantId),
        dashboardApi.getRecentOrders(restaurantId, 5),
        dashboardApi.getAlerts(restaurantId),
      ]);
      setStats(statsData);
      setPlatformStats(platformData);
      setRecentOrders(ordersData);
      setAlerts(alertsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [restaurantId]);

  const getStatusColor = (status) => ({
    received: '#3B82F6', preparing: '#FF5722', ready: '#10B981', dispatched: '#8B5CF6'
  }[status] || '#64748B');

  const getAlertClass = (type) => ({ warning: 'warning', info: 'info', success: 'success' }[type] || 'info');

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const quickActions = [
    { title: 'Order Management', description: 'View and manage all orders in real-time', icon: FiGrid, color: '#00ADB5', path: '/dashboard/orders', stats: stats ? `${stats.active_orders} active` : '...' },
    { title: 'Menu Control', description: 'Update menu items and pricing', icon: FiBook, color: '#FF5722', path: '/dashboard/menu', stats: stats ? `${stats.menu_items_count} items` : '...' },
    { title: 'Team Management', description: 'Manage staff and permissions', icon: FiUsers, color: '#00ADB5', path: '/dashboard/team', stats: stats ? `${stats.team_members_count} members` : '...' },
    { title: 'Analytics', description: 'View detailed performance metrics', icon: FiBarChart2, color: '#FF5722', path: '/dashboard/analytics', stats: 'View insights' },
  ];

  if (loading) return (
    <div className="dashboard-home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-home" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ marginBottom: 16 }}>{error}</p>
        <button onClick={fetchAll} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h1>Welcome Back, {kitchenName}!</h1>
          <p>Here's what's happening with your kitchen today</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchAll}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
          <button className="btn-primary" onClick={() => navigate('/dashboard/orders')}>
            <FiPackage />
            <span>View Orders</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 173, 181, 0.1)' }}>
            <FiPackage style={{ color: '#00ADB5' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Orders</span>
            <span className="stat-value">{stats?.today_orders ?? '—'}</span>
            {stats?.order_trend_percent != null && (
              <span className="stat-change positive">
                <FiTrendingUp /> {stats.order_trend_percent > 0 ? '+' : ''}{stats.order_trend_percent}% from yesterday
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 87, 34, 0.1)' }}>
            <FiGrid style={{ color: '#FF5722' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Orders</span>
            <span className="stat-value">{stats?.active_orders ?? '—'}</span>
            <span className="stat-change neutral">In progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 173, 181, 0.1)' }}>
            <FiClock style={{ color: '#00ADB5' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Avg. Prep Time</span>
            <span className="stat-value">{stats?.avg_prep_time ?? '—'}min</span>
            {stats?.prep_time_change != null && (
              <span className="stat-change positive">
                <FiTrendingUp /> {stats.prep_time_change} min faster
              </span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 87, 34, 0.1)' }}>
            <FiBarChart2 style={{ color: '#FF5722' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Revenue Today</span>
            <span className="stat-value">₹{stats?.today_revenue?.toLocaleString() ?? '—'}</span>
            {stats?.revenue_trend_percent != null && (
              <span className="stat-change positive">
                <FiTrendingUp /> +{stats.revenue_trend_percent}% from avg
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2>Quick Actions</h2>
        <p>Navigate to key sections</p>
      </div>

      <div className="quick-actions-grid">
        {quickActions.map((action, index) => (
          <div key={index} className="action-card" onClick={() => navigate(action.path)} style={{ '--accent-color': action.color }}>
            <div className="action-header">
              <div className="action-icon"><action.icon /></div>
              <span className="action-stats">{action.stats}</span>
            </div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <div className="action-arrow">→</div>
          </div>
        ))}
      </div>

      {/* App Source Distribution */}
      <div className="section-header" style={{ marginTop: '24px' }}>
        <h2>App Source Distribution</h2>
        <p>Orders coming from different customer applications</p>
      </div>

      <div className="platform-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {platformStats.length === 0 ? (
          <div className="stat-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            <FiPackage size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No orders recorded yet today</p>
          </div>
        ) : platformStats.map((p, idx) => (
          <div key={idx} className="stat-card" style={{ borderLeft: `4px solid ${p.platform.includes('Partner') ? '#8B5CF6' : '#00ADB5'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="stat-label" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.platform}</span>
                <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '8px', color: 'white' }}>{p.count} <span style={{ fontSize: '14px', fontWeight: '500', color: '#94A3B8' }}>orders</span></div>
              </div>
              <div style={{ padding: '8px 12px', background: `${p.platform.includes('Partner') ? '#8B5CF6' : '#00ADB5'}20`, color: p.platform.includes('Partner') ? '#8B5CF6' : '#00ADB5', borderRadius: '8px', fontWeight: '700', fontSize: '14px' }}>
                ₹{p.revenue.toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(p.count / platformStats.reduce((acc, curr) => acc + curr.count, 0)) * 100}%`, 
                  background: p.platform.includes('Partner') ? '#8B5CF6' : '#00ADB5',
                  boxShadow: `0 0 10px ${p.platform.includes('Partner') ? '#8B5CF6' : '#00ADB5'}60`
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>
                <span>{Math.round((p.count / platformStats.reduce((acc, curr) => acc + curr.count, 0)) * 100)}% share</span>
                <span>Today's Metric</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-grid">
        <div className="activity-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <button className="view-all-btn" onClick={() => navigate('/dashboard/orders')}>View All</button>
          </div>
          <div className="orders-list">
            {recentOrders.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                <FiPackage style={{ width: 24, height: 24, marginBottom: 8 }} />
                <p>No recent orders</p>
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-id-section">
                  <span className="order-id">{order.order_number || `#${order.id}`}</span>
                  <span className="order-status" style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <span className="order-platform">{order.platform}</span>
                  <span className="order-items">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="order-time">{formatTime(order.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="alerts-section">
          <div className="section-header"><h2>Alerts</h2></div>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
                <FiAlertCircle style={{ width: 24, height: 24, marginBottom: 8 }} />
                <p>No alerts right now</p>
              </div>
            ) : alerts.map((alert, idx) => (
              <div key={idx} className={`alert-item ${getAlertClass(alert.type)}`}>
                <FiAlertCircle className="alert-icon" />
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <span className="alert-time">{formatTime(alert.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
