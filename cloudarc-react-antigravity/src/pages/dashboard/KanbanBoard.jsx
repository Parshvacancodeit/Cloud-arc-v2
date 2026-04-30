import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiRefreshCw, FiCheck, FiAlertCircle, FiCheckCircle,
  FiVolume2, FiVolumeX, FiSend, FiClock, FiSearch, FiX,
  FiFilter, FiAlertTriangle, FiUser, FiMessageSquare,
  FiChevronRight, FiZap, FiEye,
} from 'react-icons/fi';
import { ordersApi, teamApi } from '../../services/api';
import '../../styles/KanbanBoard.css';

const COLUMNS = [
  { key: 'received',    label: 'New Orders', color: '#00ADB5' },
  { key: 'preparing',  label: 'Preparing',   color: '#3b82f6' },
  { key: 'ready',      label: 'Ready',       color: '#10B981' },
  { key: 'dispatched', label: 'Dispatched',  color: '#8b5cf6' },
];

const NEXT_ACTION = {
  received:   { label: 'Accept & Prepare', next: 'preparing',  cls: 'accept' },
  preparing:  { label: 'Mark Ready',       next: 'ready',      cls: 'ready' },
  ready:      { label: 'Dispatch',         next: 'dispatched', cls: 'dispatch' },
  dispatched: { label: 'Mark Delivered',   next: 'completed',  cls: 'complete' },
};

// ─── UTC-safe date parser ──────────────────────────────────────
// Handles both "2026-04-14T06:32:00Z" and old "2026-04-14 06:32:00" (no TZ)
const parseUTC = (str) => {
  if (!str) return new Date(0);
  // Already has Z or +offset — parse as-is
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(str)) return new Date(str);
  // SQLite format without TZ — append Z to treat as UTC
  return new Date(str.replace(' ', 'T') + 'Z');
};

// ─── Prep Timer Ring ──────────────────────────────────────────
const PrepTimerRing = ({ acceptedAt, prepMins, currentTime }) => {
  if (!acceptedAt) return null;
  const elapsed = (currentTime - parseUTC(acceptedAt).getTime()) / 1000;
  const totalSecs = prepMins * 60;
  const pct = Math.min(elapsed / totalSecs, 1);
  const isOver = elapsed >= totalSecs;
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const display = mins > 0 ? `${mins}m ${secs.toString().padStart(2, '0')}s` : `${secs}s`;

  const R = 18;
  const circumference = 2 * Math.PI * R;
  const dash = pct * circumference;
  const color = isOver ? '#ef4444' : pct >= 0.75 ? '#f59e0b' : '#3b82f6';

  return (
    <div className={`kds-prep-ring-wrap ${isOver ? 'kds-ring-over' : ''}`} title={`${prepMins}min target · ${display} elapsed`}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={R} fill="none" stroke="#e2e8f0" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={R}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
        />
        <text x="22" y="26" textAnchor="middle" fontSize="7.5" fontWeight="700"
          fill={color} fontFamily="Space Grotesk, sans-serif">
          {display}
        </text>
        <text x="22" y="35.5" textAnchor="middle" fontSize="5.5" fill="#94a3b8" fontFamily="Space Grotesk, sans-serif">
          /{prepMins}m
        </text>
      </svg>
      {isOver && (
        <div className="kds-ring-surge-dot" title="Exceeded prep time!" />
      )}
    </div>
  );
};

// ─── Search Bar ───────────────────────────────────────────────
const KanbanSearchBar = ({ value, onChange, platformFilter, onPlatformChange, stationFilter, onStationChange, orderCount }) => {
  const platforms = ['All', 'Direct', 'CloudArc App', 'Zomato', 'Swiggy', 'Partner App'];
  const stations = ['All', 'Grill', 'Fry', 'Cold', 'Dessert', 'Packaging'];

  return (
    <div className="kds-search-row">
      <div className="kds-search-box">
        <FiSearch size={15} className="kds-search-icon" />
        <input
          type="text"
          className="kds-search-input"
          placeholder="Search by order #, customer name or item..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && (
          <button className="kds-search-clear" onClick={() => onChange('')}>
            <FiX size={13} />
          </button>
        )}
      </div>
      <div className="kds-filter-pills">
        <FiFilter size={13} style={{ color: 'var(--text-gray)', marginRight: 4, flexShrink: 0 }} />
        <div className="kds-filter-group">
          <span className="kds-filter-label">PLATFORM</span>
          {platforms.map(p => (
            <button key={p} className={`kds-filter-pill ${platformFilter === p ? 'active' : ''}`} onClick={() => onPlatformChange(p)}>{p}</button>
          ))}
        </div>
        <div className="kds-ops-divider" style={{ height: 20, margin: '0 4px' }} />
        <div className="kds-filter-group">
          <span className="kds-filter-label">STATION</span>
          {stations.map(s => (
            <button key={s} className={`kds-filter-pill ${stationFilter === s ? 'active' : ''}`} onClick={() => onStationChange(s)}>{s}</button>
          ))}
        </div>
      </div>
      {(value || platformFilter !== 'All') && (
        <span className="kds-result-count">{orderCount} result{orderCount !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────
const KanbanBoard = () => {
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [loading, setLoading]               = useState(true);
  const [currentTime, setCurrentTime]       = useState(Date.now());
  const [soundEnabled, setSoundEnabled]     = useState(true);
  const [showCompleted, setShowCompleted]   = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [stationFilter, setStationFilter]   = useState('All');
  const [notifiedOrders, setNotifiedOrders] = useState({});
  const [surgeToast, setSurgeToast]         = useState(null);
  const [expandedCard, setExpandedCard]     = useState(null);
  const [checkedItems, setCheckedItems]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('kds_checks') || '{}'); }
    catch { return {}; }
  });
  const [teamMembers, setTeamMembers]     = useState([]);
  const [opsStats, setOpsStats]           = useState({ avgWait: 0, longestWait: 0, itemsPrep: 0 });
  const surgeNotifiedRef = useRef({});
  const prevReceivedCount = useRef(0);
  const teamFetchedRef = useRef(false);

  // Tick every second for timers
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    localStorage.setItem('kds_checks', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (orderId, idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), [idx]: !(prev[orderId]?.[idx]) },
    }));
  };

  const restaurantId = localStorage.getItem('restaurant_id');
  const globalFallbackMins = parseInt(localStorage.getItem('avg_prep_time') || '20', 10);

  const getOrderPrepTarget = useCallback((order) => {
    const items = order.items || [];
    const times = items.map(i => Number(i.prep_time || i.prepTime || 0)).filter(t => t > 0);
    if (times.length === 0) return globalFallbackMins;
    return Math.max(...times);
  }, [globalFallbackMins]);

  // ── Audio system ────────────────────────────────────────────
  // New Order: bright double-ding (G5 → C6)
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.4, now + i * 0.15 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.35);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.35);
      });
    } catch {}
  }, [soundEnabled]);

  // Accept: rising 3-note melody (C4 → E4 → G4)
  const playAcceptChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [261.63, 329.63, 392.00].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.25);
      });
    } catch {}
  }, [soundEnabled]);

  // Surge: three urgent pulses (low E)
  const playSurgeChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      [0, 0.22, 0.44].forEach(offset => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(164.81, now + offset);
        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {}
  }, [soundEnabled]);

  // Ready: bright high ding (C6)
  const playReadyChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(1046.50, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    } catch {}
  }, [soundEnabled]);

  // ── Fetch orders ────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await ordersApi.getAll(restaurantId);
      if (data) {
        setOrdersByStatus(data);
        const newCount = (data.received || []).length;
        if (prevReceivedCount.current > 0 && newCount > prevReceivedCount.current) playChime();
        prevReceivedCount.current = newCount;
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, playChime]);

  const fetchTeam = useCallback(async () => {
    try {
      const data = await teamApi.getAll(restaurantId);
      setTeamMembers(data.filter(m => m.status === 'active'));
    } catch (err) { console.error('Team fetch error:', err); }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    if (!teamFetchedRef.current) {
      fetchTeam();
      teamFetchedRef.current = true;
    }
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders, fetchTeam]);

  // ─── Ops Stats Calculation ──────────────────────────────────
  useEffect(() => {
    const preparing = ordersByStatus.preparing || [];
    const received = ordersByStatus.received || [];
    const allActive = [...received, ...preparing, ...(ordersByStatus.ready || [])];
    
    if (allActive.length === 0) {
      setOpsStats({ avgWait: 0, longestWait: 0, itemsPrep: 0 });
      return;
    }

    const now = Date.now();
    let totalWaitMs = 0;
    let maxWaitMs = 0;
    let itemsCount = 0;

    allActive.forEach(o => {
      const wait = now - parseUTC(o.created_at).getTime();
      totalWaitMs += wait;
      if (wait > maxWaitMs) maxWaitMs = wait;
    });

    preparing.forEach(o => {
      itemsCount += (o.items || []).reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
    });

    setOpsStats({
      avgWait: Math.round(totalWaitMs / allActive.length / 60000),
      longestWait: Math.round(maxWaitMs / 60000),
      itemsPrep: itemsCount
    });
  }, [ordersByStatus, currentTime]);

  // ── Surge detection ─────────────────────────────────────────
  useEffect(() => {
    (ordersByStatus.preparing || []).forEach(order => {
      if (!order.accepted_at) return;
      const target = getOrderPrepTarget(order);
      const elapsedMins = (currentTime - parseUTC(order.accepted_at).getTime()) / 60000;
      if (elapsedMins >= target && !surgeNotifiedRef.current[order.id]) {
        surgeNotifiedRef.current[order.id] = true;
        playSurgeChime();
        setSurgeToast({ orderId: order.id, orderNum: order.order_number || order.id });
        setTimeout(() => setSurgeToast(null), 6000);
      }
    });
  }, [currentTime, ordersByStatus, getOrderPrepTarget, playSurgeChime]);

  // ── Status change ───────────────────────────────────────────
  const handleStatusUpdate = async (order, newStatus) => {
    try {
      if (newStatus === 'preparing') playAcceptChime();
      if (newStatus === 'ready')     playReadyChime();
      setOrdersByStatus(prev => {
        const u = { ...prev };
        u[order.status] = (u[order.status] || []).filter(o => o.id !== order.id);
        u[newStatus] = [...(u[newStatus] || []), { ...order, status: newStatus }];
        return u;
      });
      if (newStatus === 'completed') {
        setCheckedItems(prev => { const n = { ...prev }; delete n[order.id]; return n; });
        delete surgeNotifiedRef.current[order.id];
        setExpandedCard(null);
      }
      await ordersApi.updateStatus(order.id, newStatus);
      fetchOrders();
    } catch {
      fetchOrders();
    }
  };

  const handleNotifyCustomer = async (orderId, reason) => {
    try {
      const msg = reason === 'surge'
        ? "Surge Alert: We're extra busy today! Your order might take a little longer. ⚠️"
        : "Order is taking slightly longer than expected. Thanks for your patience! 🙏";
      setNotifiedOrders(prev => ({ ...prev, [orderId]: true }));
      await ordersApi.updateStatus(orderId, 'preparing', null, msg);
      fetchOrders();
    } catch (err) {
      console.error('Failed to notify customer:', err);
    }
  };

  // ── Time helpers ────────────────────────────────────────────
  const formatElapsed = (createdAtStr) => {
    const ms = currentTime - parseUTC(createdAtStr).getTime();
    if (ms < 0) return { display: 'now', level: 'normal' };
    const secs = Math.floor(ms / 1000);
    const hrs  = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s    = secs % 60;
    let display;
    if (hrs > 0) display = `${hrs}h ${mins}m`;
    else if (mins > 0) display = `${mins}m ${s}s`;
    else display = `${s}s`;
    const level = (hrs > 0 || mins >= 20) ? 'late' : mins >= 10 ? 'warn' : 'normal';
    return { display, level };
  };

  // Convert UTC db string → local time display
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return parseUTC(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // ── Search + filter ─────────────────────────────────────────
  const matchesSearch = (order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (order.order_number || '').toLowerCase().includes(q)
      || (order.customer_name || '').toLowerCase().includes(q)
      || (order.items || []).map(i => (i.name || i.item_name || '').toLowerCase()).join(' ').includes(q);
  };
  const matchesPlatform = (order) =>
    platformFilter === 'All' || (order.platform || '').toLowerCase() === platformFilter.toLowerCase();
  const matchesStation = (order) => {
    if (stationFilter === 'All') return true;
    // Check if any item in the order matches the station
    return (order.items || []).some(i => (i.station || '').toLowerCase() === stationFilter.toLowerCase());
  };
  const filterOrders = (orders) => orders.filter(o => matchesSearch(o) && matchesPlatform(o) && matchesStation(o));

  const activeCount = ['received', 'preparing', 'ready', 'dispatched']
    .reduce((sum, k) => sum + (ordersByStatus[k]?.length || 0), 0);
  const filteredActiveCount = ['received', 'preparing', 'ready', 'dispatched']
    .reduce((sum, k) => sum + filterOrders(ordersByStatus[k] || []).length, 0);
  const completedOrders = (ordersByStatus.completed || [])
    .sort((a, b) => parseUTC(b.created_at) - parseUTC(a.created_at))
    .slice(0, 10);

  const getOrderPriority = (order) => {
    if (order.status !== 'preparing' || !order.accepted_at) return null;
    const target = getOrderPrepTarget(order);
    const elapsedMins = (currentTime - parseUTC(order.accepted_at).getTime()) / 60000;
    if (elapsedMins >= target * 1.5) return 'critical';
    if (elapsedMins >= target)       return 'surge';
    if (elapsedMins >= target * 0.75) return 'warn';
    return null;
  };

  // ── Checklist completion percentage ────────────────────────
  const getCheckProgress = (order) => {
    const total = (order.items || []).length;
    if (total === 0) return 100;
    const done = Object.values(checkedItems[order.id] || {}).filter(Boolean).length;
    return Math.round((done / total) * 100);
  };

  // ── Card render ─────────────────────────────────────────────
  const renderCard = (order) => {
    const { level } = formatElapsed(order.created_at);
    const items     = order.items || [];
    const action    = NEXT_ACTION[order.status];
    const priority  = getOrderPriority(order);
    const isDelayed = priority === 'surge' || priority === 'critical';
    const hasNotified = notifiedOrders[order.id] || (order.customer_message?.includes('Surge'));
    const isExpanded = expandedCard === order.id;
    const checkPct  = getCheckProgress(order);

    const platformMap = {
      swiggy: { label: 'Swiggy', cls: 'swiggy' },
      zomato: { label: 'Zomato', cls: 'zomato' },
      'partner app': { label: 'Partner', cls: 'partner' },
    };
    const pKey = (order.platform || '').toLowerCase();
    const { label: platformLabel, cls: platformCls } = platformMap[pKey] || { label: 'Direct', cls: 'direct' };

    const cardClass = [
      'kds-card',
      `time-${level}`,
      priority === 'critical' ? 'priority-critical' : '',
      priority === 'surge' ? 'priority-surge' : '',
      priority === 'warn' ? 'priority-warn' : '',
      isExpanded ? 'kds-card-expanded' : '',
    ].filter(Boolean).join(' ');

    return (
      <div key={order.id} className={cardClass}>
        {priority && <div className={`kds-priority-stripe priority-${priority}`} />}

        {/* ── TOP ROW ── */}
        <div className="kds-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="kds-order-id">#{order.order_number || order.id}</span>
            {priority === 'critical' && <span className="kds-badge priority-badge critical">🔥 CRITICAL</span>}
            {priority === 'surge'    && <span className="kds-badge priority-badge surge">⚡ SURGE</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {order.assigned_to && (
              <span className="kds-chef-badge">
                <FiUser size={9} /> {order.assigned_to.split(' ')[0]}
              </span>
            )}
            <span className={`kds-source-tag ${platformCls}`}>{platformLabel}</span>
            <button
              className="kds-expand-btn"
              onClick={() => setExpandedCard(isExpanded ? null : order.id)}
              title={isExpanded ? 'Collapse' : 'Expand controls'}
            >
              <FiEye size={11} />
            </button>
          </div>
        </div>

        {/* ── TIMER ROW ── */}
        <div className="kds-card-timer-row">
          <div className="kds-received-at">
            <FiClock size={11} style={{ marginRight: 3 }} />
            Recv: {formatTime(order.created_at)}
          </div>
          {order.status === 'preparing' && order.accepted_at && (
            <PrepTimerRing
              acceptedAt={order.accepted_at}
              prepMins={getOrderPrepTarget(order)}
              currentTime={currentTime}
            />
          )}
          {order.status === 'received' && (
            <div className="kds-waiting-badge">
              <FiClock size={10} style={{ marginRight: 3 }} />
              {formatElapsed(order.created_at).display} waiting
            </div>
          )}
          {order.status === 'ready' && order.ready_at && (
            <div className="kds-ready-since" style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>
              Ready since {formatTime(order.ready_at)}
            </div>
          )}
        </div>

        {/* ── CUSTOMER ── */}
        <div className="kds-card-customer">
          <FiUser size={11} style={{ marginRight: 4, color: '#94a3b8' }} />
          <span className="kds-cust-name">{order.customer_name}</span>
          {order.customer_phone && (
            <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 4 }}>· {order.customer_phone}</span>
          )}
        </div>

        {order.customer_address && (
          <div className="kds-address-snippet" title={order.customer_address}>
            📍 {order.customer_address.length > 32
              ? order.customer_address.substring(0, 32) + '…'
              : order.customer_address}
          </div>
        )}

        {/* ── ITEMS CHECKLIST ── */}
        <div className="kds-items-section">
          {order.status === 'preparing' && items.length > 0 && (
            <div className="kds-progress-bar-wrap">
              <div className="kds-progress-bar" style={{ width: `${checkPct}%` }} />
            </div>
          )}
          {items.map((item, idx) => {
            const done = checkedItems[order.id]?.[idx];
            return (
              <div key={idx} className={`kds-item-row ${done ? 'done' : ''}`} onClick={() => toggleCheck(order.id, idx)}>
                <div className={`kds-checkbox ${done ? 'checked' : ''}`}>
                  {done && <FiCheck size={11} />}
                </div>
                <span className="kds-item-qty">{item.qty || item.quantity}×</span>
                <span className="kds-item-name">{item.name || item.item_name}</span>
                {item.prep_time && (
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: 'auto' }}>{item.prep_time}m</span>
                )}
              </div>
            );
          })}
        </div>

        {order.notes && (
          <div className="kds-notes-prominent">
            <div className="kds-notes-label"><FiAlertCircle size={10} /> SPECIAL INSTRUCTIONS</div>
            <div className="kds-notes-content">{order.notes}</div>
          </div>
        )}

        {/* ── EXPANDED CONTROLS PANEL ── */}
        {isExpanded && (
          <div className="kds-controls-panel">
            {/* Order amount */}
            <div className="kds-control-row kds-amount-row">
              <span style={{ color: '#64748b', fontSize: '12px' }}>Order Total</span>
              <span style={{ fontWeight: 700, color: '#1a1a2e' }}>₹{order.total_amount}</span>
            </div>

            {/* Notify customer row */}
            {order.status === 'preparing' && (
              <div className="kds-control-row">
                <button
                  className={`kds-control-btn notify ${hasNotified ? 'sent' : ''}`}
                  onClick={() => !hasNotified && handleNotifyCustomer(order.id, 'delay')}
                  disabled={hasNotified}
                >
                  {hasNotified
                    ? <><FiCheckCircle size={12} /> Customer Notified</>
                    : <><FiMessageSquare size={12} /> Notify Delay</>}
                </button>
                {isDelayed && !hasNotified && (
                  <button
                    className="kds-control-btn surge-notify"
                    onClick={() => handleNotifyCustomer(order.id, 'surge')}
                  >
                    <FiZap size={12} /> Surge Alert
                  </button>
                )}
              </div>
            )}

            {/* Assign chef row (received / preparing) */}
            {(order.status === 'received' || order.status === 'preparing') && (
              <div className="kds-control-row">
                <div className="kds-assign-wrapper">
                  <FiUser size={12} className="kds-assign-icon" />
                  <select
                    className="kds-assign-select"
                    value={order.assigned_to || ''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setOrdersByStatus(prev => {
                        const u = { ...prev };
                        u[order.status] = u[order.status].map(o => o.id === order.id ? { ...o, assigned_to: val } : o);
                        return u;
                      });
                      await ordersApi.updateStatus(order.id, order.status, val);
                    }}
                  >
                    <option value="">Assign to Chef...</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Customer message preview */}
            {order.customer_message && (
              <div className="kds-control-row kds-msg-preview">
                <FiMessageSquare size={11} style={{ flexShrink: 0, color: '#3b82f6' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  "{order.customer_message}"
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── SURGE NOTIFY (collapsed, when delayed) ── */}
        {!isExpanded && isDelayed && (
          <button
            className={`kds-notify-btn ${hasNotified ? 'sent' : ''}`}
            onClick={() => !hasNotified && handleNotifyCustomer(order.id, 'surge')}
            disabled={hasNotified}
          >
            {hasNotified
              ? <><FiCheckCircle size={12} /> Customer Notified</>
              : <><FiSend size={12} /> Notify Delay</>}
          </button>
        )}

        {/* ── ACTION BUTTONS ── */}
        <div className="kds-card-actions">
          {order.status === 'received' && (
            <button
              className="kds-reject-btn"
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order, 'cancelled'); }}
            >
              Reject
            </button>
          )}
          {action && (
            <button
              className={`kds-action-btn status-${order.status} action-${action.cls}`}
              onClick={() => handleStatusUpdate(order, action.next)}
            >
              {action.label} <FiChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="kds-loading-state">Loading kitchen orders...</div>;

  return (
    <div className="kds-page">

      {/* ── Surge Toast ── */}
      {surgeToast && (
        <div className="kds-surge-toast">
          <FiAlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>⏱ Order #{surgeToast.orderNum} exceeded prep time!</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: 2 }}>Consider notifying the customer about the delay.</div>
          </div>
          <button onClick={() => setSurgeToast(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto' }}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="kds-page-header">
        <div>
          <h1 className="kds-page-title">Kitchen Display</h1>
          <p className="kds-page-sub">
            {activeCount} active order{activeCount !== 1 ? 's' : ''}
            {' · '}
            {new Date(currentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
        </div>
        <div className="kds-header-actions">
          <button
            className="kds-icon-btn"
            onClick={playChime}
            title="Test Sound"
            style={{ color: '#00ADB5', fontSize: '11px', flexDirection: 'column', gap: 2 }}
          >
            <FiVolume2 size={14} />
            <span style={{ fontSize: '9px', fontWeight: 700 }}>TEST</span>
          </button>
          <button
            className={`kds-icon-btn ${soundEnabled ? '' : 'muted'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute alerts' : 'Unmute alerts'}
          >
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          </button>
          <button className="kds-icon-btn" onClick={fetchOrders} title="Refresh">
            <FiRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── Live Ops Stats Bar ── */}
      <div className="kds-ops-bar">
        <div className="kds-ops-item">
          <span className="label">ACTIVE ORDERS</span>
          <span className="value">{activeCount}</span>
        </div>
        <div className="kds-ops-divider" />
        <div className="kds-ops-item">
          <span className="label">AVG WAIT TIME</span>
          <span className="value">{opsStats.avgWait}m</span>
        </div>
        <div className="kds-ops-divider" />
        <div className="kds-ops-item">
          <span className="label">LONGEST WAIT</span>
          <span className="value" style={{ color: opsStats.longestWait > 20 ? '#ef4444' : 'inherit' }}>
            {opsStats.longestWait}m
          </span>
        </div>
        <div className="kds-ops-divider" />
        <div className="kds-ops-item">
          <span className="label">ITEMS IN PREP</span>
          <span className="value">{opsStats.itemsPrep}</span>
        </div>
        <div className="kds-ops-live">
          <div className="pulse-dot" /> LIVE OPS
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <KanbanSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        platformFilter={platformFilter}
        onPlatformChange={setPlatformFilter}
        stationFilter={stationFilter}
        onStationChange={setStationFilter}
        orderCount={filteredActiveCount}
      />

      {/* ── Kanban Columns ── */}
      <div className="kds-kanban">
        {COLUMNS.map(col => {
          const allColOrders = (ordersByStatus[col.key] || [])
            .sort((a, b) => {
              const pa = getOrderPriority(a) === 'critical' ? 3 : getOrderPriority(a) === 'surge' ? 2 : getOrderPriority(a) === 'warn' ? 1 : 0;
              const pb = getOrderPriority(b) === 'critical' ? 3 : getOrderPriority(b) === 'surge' ? 2 : getOrderPriority(b) === 'warn' ? 1 : 0;
              if (pb !== pa) return pb - pa;
              return parseUTC(a.created_at) - parseUTC(b.created_at);
            });
          const colOrders = filterOrders(allColOrders);
          const surgeCount = allColOrders.filter(o => getOrderPriority(o) !== null).length;

          return (
            <div key={col.key} className="kds-column">
              <div className="kds-col-header">
                <div className="kds-col-dot" style={{ background: col.color }} />
                <span className="kds-col-title">{col.label}</span>
                <span className="kds-col-count">{colOrders.length}</span>
                {surgeCount > 0 && col.key === 'preparing' && (
                  <span className="kds-col-surge-badge">
                    <FiAlertTriangle size={11} /> {surgeCount}
                  </span>
                )}
              </div>
              <div className="kds-col-body">
                {colOrders.length === 0 ? (
                  <div className="kds-col-empty">
                    {searchQuery || platformFilter !== 'All' ? 'No matches' : 'No orders'}
                  </div>
                ) : (
                  colOrders.map(renderCard)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Completed Section ── */}
      <div className="kds-completed-section">
        <button className="kds-completed-toggle" onClick={() => setShowCompleted(!showCompleted)}>
          <FiCheckCircle size={16} />
          Recently Completed ({completedOrders.length})
          <span className="kds-toggle-arrow">{showCompleted ? '▲' : '▼'}</span>
        </button>
        {showCompleted && (
          <div className="kds-completed-list">
            {completedOrders.length === 0 ? (
              <p className="kds-completed-empty">No completed orders yet</p>
            ) : completedOrders.map(order => (
              <div key={order.id} className="kds-completed-row">
                <span className="kds-completed-id">#{order.order_number || order.id}</span>
                <span className="kds-completed-customer">{order.customer_name}</span>
                <span className={`kds-source ${(order.platform || '').toLowerCase().includes('swiggy') ? 'swiggy' : 'direct'}`}>
                  {(order.platform || '').toLowerCase().includes('swiggy') ? 'Swiggy' : order.platform || 'Direct'}
                </span>
                <span className="kds-completed-time">{formatTime(order.created_at)}</span>
                <span className="kds-completed-amount">₹{order.total_amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
