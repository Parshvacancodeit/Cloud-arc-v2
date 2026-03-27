import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDownload, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { analyticsApi } from '../../services/api';
import '../../styles/Analytics.css';

const PERIOD_MAP = { Today: 'today', Week: '7d', Month: '30d', Year: '365d' };

const Analytics = () => {
  const restaurantId = localStorage.getItem('restaurant_id');
  const [timeRange, setTimeRange] = useState('Week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getData(restaurantId, PERIOD_MAP[timeRange]);
      setAnalyticsData(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, timeRange]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString()}`;

  if (loading) return (
    <div className="analytics-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center', color: '#64748B' }}>
        <FiRefreshCw style={{ width: 32, height: 32, animation: 'spin 1s linear infinite', marginBottom: 12 }} />
        <p>Loading analytics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="analytics-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{ textAlign: 'center' }}>
        <FiAlertCircle style={{ width: 32, height: 32, color: '#FF5722', marginBottom: 12 }} />
        <p style={{ color: '#64748B', marginBottom: 16 }}>{error}</p>
        <button onClick={fetchAnalytics} style={{ padding: '8px 20px', background: '#00ADB5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  );

  const summary = analyticsData?.summary || {};
  const revenueChart = analyticsData?.revenue_chart || [];
  const platformData = analyticsData?.orders_by_platform || [];
  const topItems = analyticsData?.top_items || [];
  const hourlyData = analyticsData?.orders_by_hour || [];
  const performance = analyticsData?.performance || {};

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue || 0), 1);
  const maxHourly = Math.max(...hourlyData.map(d => d.count || 0), 1);
  const totalPlatformOrders = platformData.reduce((sum, p) => sum + (p.count || 0), 0);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Analytics & Insights</h1>
          <p>Track your kitchen's performance metrics</p>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            {Object.keys(PERIOD_MAP).map(range => (
              <button key={range} className={`range-btn ${timeRange === range ? 'active' : ''}`} onClick={() => setTimeRange(range)}>{range}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={fetchAnalytics}>
            <FiRefreshCw /><span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card large">
          <div className="metric-header">
            <span className="metric-label">Total Revenue</span>
            <FiTrendingUp className="trend-icon up" />
          </div>
          <div className="metric-value">{fmt(summary.total_revenue)}</div>
          <div className="metric-chart">
            {revenueChart.map((item, idx) => (
              <div key={idx} className="chart-bar" style={{ height: `${(item.revenue / maxRevenue) * 100}%`, background: '#00ADB5' }} title={`${item.date}: ${fmt(item.revenue)}`} />
            ))}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Total Orders</span><FiTrendingUp className="trend-icon up" /></div>
          <div className="metric-value">{summary.total_orders ?? '—'}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Avg Order Value</span><FiTrendingUp className="trend-icon up" /></div>
          <div className="metric-value">{fmt(summary.avg_order_value)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Avg Prep Time</span><FiTrendingDown className="trend-icon up" /></div>
          <div className="metric-value">{summary.avg_prep_time ?? '—'} min</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Hourly Orders */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Orders by Hour</h3>
            <span className="chart-subtitle">Peak hours analysis</span>
          </div>
          <div className="hourly-chart">
            {hourlyData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>No hourly data available</p>
            ) : hourlyData.map((item, idx) => (
              <div key={idx} className="hour-column">
                <div className="hour-bar" style={{ height: `${(item.count / maxHourly) * 100}%`, background: item.count > maxHourly * 0.7 ? '#FF5722' : '#00ADB5' }} title={`${item.hour}: ${item.count} orders`} />
                <span className="hour-label">{String(item.hour).split(':')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Platform Distribution</h3>
            <span className="chart-subtitle">Revenue by source</span>
          </div>
          <div className="platform-chart">
            {platformData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>No platform data available</p>
            ) : platformData.map((platform, idx) => {
              const pct = totalPlatformOrders > 0 ? ((platform.count / totalPlatformOrders) * 100).toFixed(1) : 0;
              const colors = ['#E23744', '#FC8019', '#06C167', '#00ADB5', '#8B5CF6'];
              const color = colors[idx % colors.length];
              return (
                <div key={idx} className="platform-row">
                  <div className="platform-info">
                    <div className="platform-color" style={{ background: color }} />
                    <span className="platform-name">{platform.platform}</span>
                  </div>
                  <div className="platform-bar-container">
                    <div className="platform-bar" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="platform-stats">
                    <span className="platform-percentage">{pct}%</span>
                    <span className="platform-revenue">{fmt(platform.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Items & Performance */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-header"><h3>Top Selling Items</h3></div>
          <div className="items-list">
            {topItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>No data yet</p>
            ) : topItems.map((item, idx) => (
              <div key={idx} className="item-row">
                <div className="item-rank">{idx + 1}</div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-orders">{item.orders} orders</span>
                </div>
                <div className="item-revenue">{fmt(item.revenue)}</div>
                <div className={`item-trend ${item.trend || 'stable'}`}>
                  {item.trend === 'up' && <FiTrendingUp />}
                  {item.trend === 'down' && <FiTrendingDown />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header"><h3>Performance Metrics</h3></div>
          <div className="performance-stats">
            {[
              { label: 'Order Acceptance Rate', value: performance.acceptance_rate ?? 94, color: '#10B981', display: `${performance.acceptance_rate ?? 94}%` },
              { label: 'On-Time Delivery', value: performance.on_time_rate ?? 87, color: '#00ADB5', display: `${performance.on_time_rate ?? 87}%` },
              { label: 'Customer Rating', value: ((performance.rating ?? 4.6) / 5) * 100, color: '#FF5722', display: `${performance.rating ?? 4.6}/5` },
              { label: 'Order Accuracy', value: performance.accuracy_rate ?? 96, color: '#10B981', display: `${performance.accuracy_rate ?? 96}%` },
            ].map((item, idx) => (
              <div key={idx} className="performance-item">
                <span className="performance-label">{item.label}</span>
                <div className="performance-bar-container">
                  <div className="performance-bar" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
                <span className="performance-value">{item.display}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
