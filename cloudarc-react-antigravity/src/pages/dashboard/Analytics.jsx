import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw, FiAlertCircle, FiPackage, FiXCircle, FiClock, FiZap } from 'react-icons/fi';
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
    setLoading(true); setError(null);
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
  const pct = (n) => `${n ?? 0}%`;

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

  const summary     = analyticsData?.summary || {};
  const revenueChart = analyticsData?.revenue_chart || [];
  const platformData = analyticsData?.orders_by_platform || [];
  const topItems    = analyticsData?.top_items || [];
  const hourlyData  = analyticsData?.orders_by_hour || [];
  const perf        = analyticsData?.performance || {};

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue || 0), 1);
  const maxHourly  = Math.max(...hourlyData.map(d => d.count || 0), 1);
  const totalPlatformOrders = platformData.reduce((sum, p) => sum + (p.count || 0), 0);

  const peakHour = perf.peak_hour ?? null;
  const peakLabel = peakHour
    ? (() => {
        const h = parseInt(peakHour);
        const fmt12 = (n) => { const ampm = n >= 12 ? 'PM' : 'AM'; const h12 = n % 12 || 12; return `${h12}:00 ${ampm}`; };
        return `${fmt12(h)} – ${fmt12(h + 1)}`;
      })()
    : null;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1>Analytics & Insights</h1>
          <p>Live performance data for {timeRange === 'Today' ? 'today' : `the last ${PERIOD_MAP[timeRange]}`}</p>
        </div>
        <div className="header-actions">
          <div className="time-range-selector">
            {Object.keys(PERIOD_MAP).map(range => (
              <button key={range} className={`range-btn ${timeRange === range ? 'active' : ''}`} onClick={() => setTimeRange(range)}>{range}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={fetchAnalytics}><FiRefreshCw /><span>Refresh</span></button>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="metrics-grid">
        {/* Revenue — large card with mini bar chart */}
        <div className="metric-card large">
          <div className="metric-header">
            <span className="metric-label">Total Revenue</span>
            <FiTrendingUp className="trend-icon up" />
          </div>
          <div className="metric-value">{fmt(summary.total_revenue)}</div>
          <div className="metric-chart">
            {revenueChart.length === 0
              ? <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 8 }}>No revenue data for this period</p>
              : revenueChart.map((item, idx) => (
                  <div key={idx} className="chart-bar"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%`, background: '#00ADB5' }}
                    title={`${item.date}: ${fmt(item.revenue)}`} />
                ))}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Total Orders</span><FiTrendingUp className="trend-icon up" /></div>
          <div className="metric-value">{summary.total_orders ?? '—'}</div>
          <div className="metric-sub">Fulfilled: {pct(perf.fulfillment_rate)}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Avg Order Value</span><FiTrendingUp className="trend-icon up" /></div>
          <div className="metric-value">{fmt(summary.avg_order_value)}</div>
          <div className="metric-sub">{perf.avg_items_per_order ?? '—'} items avg per order</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><span className="metric-label">Avg Prep Time</span><FiClock className="trend-icon" style={{ color: '#f59e0b' }} /></div>
          <div className="metric-value">{summary.avg_prep_time ?? '—'} <span style={{ fontSize: '1rem', fontWeight: 500 }}>min</span></div>
          <div className="metric-sub">Configured target</div>
        </div>

        {/* Extra operational metrics */}
        <div className="metric-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="metric-header"><span className="metric-label">Cancelled Orders</span><FiXCircle className="trend-icon" style={{ color: '#ef4444' }} /></div>
          <div className="metric-value" style={{ color: '#ef4444' }}>{perf.cancelled_count ?? 0}</div>
          <div className="metric-sub">{pct(perf.fulfillment_rate)} fulfillment rate</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid #10B981' }}>
          <div className="metric-header"><span className="metric-label">Items Sold</span><FiPackage className="trend-icon" style={{ color: '#10B981' }} /></div>
          <div className="metric-value" style={{ color: '#10B981' }}>{perf.total_items_sold ?? 0}</div>
          <div className="metric-sub">Across all orders</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="metric-header"><span className="metric-label">Completed</span><FiTrendingUp className="trend-icon up" /></div>
          <div className="metric-value">{pct(perf.completion_rate)}</div>
          <div className="metric-sub">Order completion rate</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid #8b5cf6' }}>
          <div className="metric-header"><span className="metric-label">Peak Hour</span><FiZap className="trend-icon" style={{ color: '#8b5cf6' }} /></div>
          {peakLabel
            ? <div className="metric-value" style={{ fontSize: '1.4rem' }}>{peakLabel}</div>
            : <div className="metric-value" style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>No data yet</div>
          }
          <div className="metric-sub">{peakLabel ? 'Busiest ordering window' : 'Place some orders to see peak'}</div>
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Orders by Hour</h3>
            <span className="chart-subtitle">Peak hour: <strong>{peakLabel ?? '—'}</strong></span>
          </div>
          <div className="hourly-chart">
            {hourlyData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>No hourly data for this period</p>
            ) : hourlyData.map((item, idx) => (
              <div key={idx} className="hour-column">
                <div className="hour-bar"
                  style={{
                    height: `${(item.count / maxHourly) * 100}%`,
                    background: item.count >= maxHourly * 0.8 ? '#FF5722' : item.count >= maxHourly * 0.5 ? '#f59e0b' : '#00ADB5'
                  }}
                  title={`${item.hour}: ${item.count} orders`}
                />
                <span className="hour-label">{String(item.hour).split(':')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Platform Distribution</h3>
            <span className="chart-subtitle">{totalPlatformOrders} total orders</span>
          </div>
          <div className="platform-chart">
            {platformData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>No platform data for this period</p>
            ) : platformData.map((platform, idx) => {
              const p = totalPlatformOrders > 0 ? ((platform.count / totalPlatformOrders) * 100).toFixed(1) : 0;
              const colors = ['#E23744', '#FC8019', '#06C167', '#00ADB5', '#8B5CF6'];
              return (
                <div key={idx} className="platform-row">
                  <div className="platform-info">
                    <div className="platform-color" style={{ background: colors[idx % colors.length] }} />
                    <span className="platform-name">{platform.platform}</span>
                  </div>
                  <div className="platform-bar-container">
                    <div className="platform-bar" style={{ width: `${p}%`, background: colors[idx % colors.length] }} />
                  </div>
                  <div className="platform-stats">
                    <span className="platform-percentage">{p}%</span>
                    <span className="platform-revenue">{fmt(platform.revenue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top Items & Performance ── */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-header"><h3>Top Selling Items</h3></div>
          <div className="items-list">
            {topItems.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                No orders in this period yet. Items will appear here as orders come in.
              </p>
            ) : topItems.map((item, idx) => (
              <div key={idx} className="item-row">
                <div className="item-rank">{idx + 1}</div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-orders">{item.orders} sold</span>
                </div>
                <div className="item-revenue">{fmt(item.revenue)}</div>
                <div className="item-trend up"><FiTrendingUp /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header"><h3>Performance Breakdown</h3></div>
          <div className="performance-stats">
            {[
              { label: 'Order Completion Rate', value: perf.completion_rate ?? 0,   color: '#10B981', display: pct(perf.completion_rate)   },
              { label: 'Fulfillment Rate',       value: perf.fulfillment_rate ?? 0,  color: '#00ADB5', display: pct(perf.fulfillment_rate)  },
              { label: 'Cancellation Rate',      value: perf.cancelled_count && summary.total_orders ? ((perf.cancelled_count / summary.total_orders) * 100) : 0, color: '#ef4444', display: summary.total_orders ? `${((perf.cancelled_count / summary.total_orders) * 100).toFixed(1)}%` : '0%' },
              { label: 'Avg Items per Order',    value: Math.min((perf.avg_items_per_order / 10) * 100, 100), color: '#8b5cf6', display: String(perf.avg_items_per_order ?? 0) },
            ].map((item, idx) => (
              <div key={idx} className="performance-item">
                <span className="performance-label">{item.label}</span>
                <div className="performance-bar-container">
                  <div className="performance-bar" style={{ width: `${Math.min(item.value, 100)}%`, background: item.color }} />
                </div>
                <span className="performance-value">{item.display}</span>
              </div>
            ))}
          </div>

          {/* Insight callout */}
          {peakLabel && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(0,173,181,0.05)', borderRadius: 10, border: '1px solid rgba(0,173,181,0.12)', fontSize: '12px', color: '#64748b' }}>
              <strong style={{ color: 'var(--cyan)' }}>💡 Insight</strong><br />
              Your kitchen is busiest around <strong>{peakLabel}</strong>. Consider scheduling extra staff during this window.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
