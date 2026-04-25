/* ─────────────────────────────────────────────────────────────
   CloudArc Customer App — Global Styles
   Extracted from App.jsx for maintainability
───────────────────────────────────────────────────────────────── */
export const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal: #00ADB5;
    --orange: #FF5722;
    --dark: #0F172A;
    --darker: #0A0E1A;
    --card: #1A2235;
    --border: rgba(255,255,255,0.07);
    --text: #F1F5F9;
    --muted: #94A3B8;
    --success: #10B981;
  }

  body { font-family: 'Manrope', sans-serif; background: #0A0E1A; color: var(--text); -webkit-font-smoothing: antialiased; }

  .app-stage {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 20% 50%, rgba(0,173,181,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(255,87,34,0.10) 0%, transparent 50%),
                #060914;
    padding: 24px;
  }

  .phone-outer {
    width: 390px;
    height: 844px;
    background: #111827;
    border-radius: 52px;
    padding: 14px;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.08),
      0 30px 80px rgba(0,0,0,0.8),
      0 0 60px rgba(0,173,181,0.12),
      inset 0 1px 0 rgba(255,255,255,0.12);
    position: relative;
    flex-shrink: 0;
  }

  .phone-notch {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    width: 120px; height: 32px; background: #0A0A0A; border-radius: 0 0 20px 20px;
    z-index: 100; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .notch-cam { width: 10px; height: 10px; background: #222; border-radius: 50%; border: 2px solid #333; }
  .notch-speaker { width: 48px; height: 4px; background: #222; border-radius: 4px; }

  .phone-screen {
    width: 100%; height: 100%; background: var(--darker); border-radius: 40px;
    overflow: hidden; position: relative; display: flex; flex-direction: column;
  }

  .screen-content { flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; padding-top: 104px; }
  .screen-content::-webkit-scrollbar { display: none; }

  .status-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 48px;
    padding: 12px 20px 0; display: flex; justify-content: space-between; align-items: center;
    z-index: 50; background: linear-gradient(to bottom, var(--darker) 70%, transparent);
    font-size: 12px; font-weight: 600;
  }
  .status-icons { display: flex; gap: 4px; align-items: center; }

  .bottom-nav {
    display: flex; border-top: 1px solid var(--border);
    background: rgba(10,14,26,0.95); backdrop-filter: blur(12px);
    padding: 8px 0 16px; flex-shrink: 0;
  }
  .nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 6px; cursor: pointer; background: none; border: none;
    color: var(--muted); font-size: 10px; font-family: 'Manrope', sans-serif;
    transition: color 0.2s; position: relative;
  }
  .nav-item.active { color: var(--teal); }
  .nav-item svg { width: 22px; height: 22px; }

  .cart-badge {
    position: absolute; top: 2px; right: calc(50% - 16px);
    width: 16px; height: 16px; background: var(--orange); border-radius: 50%;
    font-size: 9px; font-weight: 700; display: flex; align-items: center;
    justify-content: center; color: white;
  }

  .page-header { padding: 16px 20px 12px; background: var(--darker); position: sticky; top: 0; z-index: 30; }
  .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--text); }
  .page-subtitle { font-size: 13px; color: var(--muted); margin-top: 2px; }

  .home-hero {
    padding: 20px;
    background: linear-gradient(135deg, rgba(0,173,181,0.15) 0%, rgba(255,87,34,0.08) 100%);
    border-bottom: 1px solid var(--border);
  }
  .hero-greeting { font-size: 13px; color: var(--teal); font-weight: 600; letter-spacing: 0.5px; margin-bottom: 4px; }
  .hero-heading { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; line-height: 1.2; margin-bottom: 16px; }
  .hero-heading span { color: var(--teal); }

  .search-bar {
    display: flex; gap: 8px; align-items: center;
    background: rgba(255,255,255,0.05); border: 1.5px solid var(--border);
    border-radius: 14px; padding: 12px 16px; transition: border-color 0.2s;
  }
  .search-bar:focus-within { border-color: var(--teal); }
  .search-bar svg { color: var(--muted); flex-shrink: 0; width: 18px; height: 18px; }
  .search-bar input { flex: 1; background: none; border: none; outline: none; color: var(--text); font-size: 14px; font-family: 'Manrope', sans-serif; }
  .search-bar input::placeholder { color: var(--muted); }
  .search-btn { background: var(--teal); color: white; border: none; border-radius: 10px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; font-family: 'Manrope', sans-serif; transition: opacity 0.2s; }
  .search-btn:hover { opacity: 0.88; }
  .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); padding: 0 20px; margin: 20px 0 12px; }
  .pill-scroll { display: flex; gap: 8px; padding: 0 20px; overflow-x: auto; scrollbar-width: none; margin-bottom: 4px; }
  .pill-scroll::-webkit-scrollbar { display: none; }
  .cuisine-pill { flex-shrink: 0; padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--card); color: var(--muted); font-family: 'Manrope', sans-serif; transition: all 0.18s; }
  .cuisine-pill.active { border-color: var(--teal); background: rgba(0,173,181,0.15); color: var(--teal); }

  .restaurant-list { padding: 12px 20px 20px; display: flex; flex-direction: column; gap: 14px; }
  .restaurant-card { background: var(--card); border-radius: 18px; border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; }
  .restaurant-card:active { transform: scale(0.97); }
  .restaurant-card:hover { box-shadow: 0 8px 30px rgba(0,173,181,0.12); border-color: rgba(0,173,181,0.25); }

  .r-img { width: 100%; height: 140px; object-fit: cover; background: linear-gradient(135deg, #1a2235, #0f172a); display: flex; align-items: center; justify-content: center; font-size: 40px; }
  .r-img img { width: 100%; height: 100%; object-fit: cover; }
  .r-body { padding: 14px; }
  .r-name { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .r-meta { font-size: 12px; color: var(--muted); display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
  .r-meta span { display: flex; align-items: center; gap: 3px; }
  .r-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .r-tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: rgba(0,173,181,0.12); color: var(--teal); border: 1px solid rgba(0,173,181,0.2); }
  .r-tag.orange { background: rgba(255,87,34,0.12); color: var(--orange); border-color: rgba(255,87,34,0.2); }
  .open-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
  .open-badge.open { background: rgba(16,185,129,0.15); color: #10B981; }
  .open-badge.closed { background: rgba(239,68,68,0.15); color: #EF4444; }
  .bestseller-badge { background: linear-gradient(135deg, #FF5722, #FF9800); color: white; font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: inline-block; }

  .detail-header { padding: 16px 20px 12px; border-bottom: 1px solid var(--border); }
  .back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--teal); font-size: 14px; font-weight: 600; cursor: pointer; padding: 0; margin-bottom: 12px; font-family: 'Manrope', sans-serif; }
  .detail-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 6px; }
  .detail-meta { font-size: 13px; color: var(--muted); display: flex; gap: 14px; }

  .menu-category { padding: 18px 20px 4px; }
  .menu-category-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--teal); margin-bottom: 10px; }
  .menu-item { display: flex; gap: 12px; padding: 14px; margin-bottom: 10px; background: var(--card); border-radius: 14px; border: 1px solid var(--border); align-items: flex-start; }
  .menu-item-img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: var(--dark); display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .menu-item-img img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
  .menu-item-body { flex: 1; min-width: 0; }
  .menu-item-name { font-weight: 700; font-size: 14px; margin-bottom: 3px; }
  .menu-item-desc { font-size: 12px; color: var(--muted); margin-bottom: 8px; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .menu-item-footer { display: flex; align-items: center; justify-content: space-between; }
  .menu-item-price { font-weight: 800; font-size: 15px; color: var(--teal); }

  .add-btn { width: 32px; height: 32px; background: var(--teal); color: white; border: none; border-radius: 10px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.18s; line-height: 1; }
  .add-btn:hover { background: #009AA0; }
  .qty-ctrl { display: flex; align-items: center; gap: 8px; background: rgba(0,173,181,0.1); border: 1px solid rgba(0,173,181,0.3); border-radius: 10px; padding: 2px 10px; }
  .qty-btn { background: none; border: none; color: var(--teal); font-size: 18px; font-weight: 700; cursor: pointer; padding: 2px 4px; line-height: 1; }
  .qty-num { font-weight: 700; font-size: 14px; min-width: 16px; text-align: center; }

  .veg-dot { width: 12px; height: 12px; border-radius: 2px; border: 2px solid; display: inline-flex; align-items: center; justify-content: center; margin-right: 4px; flex-shrink: 0; }
  .veg-dot::after { content: ''; width: 5px; height: 5px; border-radius: 50%; display: block; }
  .veg-dot.veg { border-color: #10B981; }
  .veg-dot.veg::after { background: #10B981; }
  .veg-dot.nonveg { border-color: #EF4444; }
  .veg-dot.nonveg::after { background: #EF4444; }

  .cart-bar { position: sticky; bottom: 0; background: linear-gradient(135deg, var(--teal), #008a91); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; z-index: 40; box-shadow: 0 -4px 20px rgba(0,173,181,0.3); }
  .cart-bar-left { font-size: 13px; font-weight: 600; }
  .cart-bar-total { font-size: 16px; font-weight: 800; }

  .cart-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .cart-item-name { flex: 1; font-weight: 600; font-size: 14px; }
  .cart-item-price { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .cart-total-section { padding: 16px 20px; border-top: 1px solid var(--border); background: var(--card); margin: 0 20px; border-radius: 14px; }
  .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .total-row.grand { font-weight: 800; font-size: 16px; border-top: 1px solid var(--border); padding-top: 12px; margin-top: 6px; color: var(--teal); }

  .form-field { padding: 0 20px; margin-bottom: 16px; }
  .form-field label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 6px; }
  .form-field input, .form-field textarea { width: 100%; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 12px 14px; color: var(--text); font-size: 14px; font-family: 'Manrope', sans-serif; outline: none; transition: border-color 0.2s; resize: none; }
  .form-field input:focus, .form-field textarea:focus { border-color: var(--teal); }

  .primary-btn { width: calc(100% - 40px); margin: 0 20px; padding: 16px; background: linear-gradient(135deg, var(--teal), #008a91); color: white; border: none; border-radius: 14px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: opacity 0.18s, transform 0.1s; letter-spacing: 0.3px; }
  .primary-btn:active { transform: scale(0.97); }
  .primary-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .success-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80%; padding: 32px 20px; text-align: center; }
  .success-icon { width: 80px; height: 80px; background: linear-gradient(135deg, rgba(0,173,181,0.2), rgba(16,185,129,0.2)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px; animation: bounceIn 0.5s ease; }
  @keyframes bounceIn { 0% { transform: scale(0); opacity:0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity:1; } }
  .success-title { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 10px; }
  .success-subtitle { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 8px; }
  .order-id-display { font-size: 20px; font-weight: 800; color: var(--teal); font-family: 'Space Grotesk', sans-serif; background: rgba(0,173,181,0.1); padding: 8px 20px; border-radius: 10px; margin: 12px 0; }

  .center-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; color: var(--muted); text-align: center; gap: 12px; }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--teal); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-icon { font-size: 40px; margin-bottom: 8px; }
  .empty-title { font-weight: 700; font-size: 16px; margin-bottom: 4px; }
  .empty-desc { font-size: 13px; }

  .menu-page-body { padding-bottom: 80px; }
`;
