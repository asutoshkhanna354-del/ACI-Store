import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = '/api';

function resellerFetch(url, options = {}) {
  const token = localStorage.getItem('ff_reseller_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_BASE}${url}`, { ...options, headers }).then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  });
}

const tabIcons = [
  { id: 'keygen', label: 'Key Gen', gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
  )},
  { id: 'balance-tx', label: 'Balance', gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
  )},
  { id: 'key-history', label: 'History', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
  { id: 'today', label: 'Today', gradient: 'linear-gradient(135deg,#ec4899,#db2777)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
  )},
  { id: 'stats', label: 'Stats', gradient: 'linear-gradient(135deg,#f97316,#ea580c)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  )},
  { id: 'add-balance', label: 'Top Up', gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
];

export default function ResellerDashboard() {
  const navigate = useNavigate();
  const [reseller, setReseller] = useState(null);
  const [panels, setPanels] = useState([]);
  const [activeTab, setActiveTab] = useState('keygen');
  const [packages, setPackages] = useState([]);
  const [keyOrders, setKeyOrders] = useState([]);
  const [topups, setTopups] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState({});

  const [selectedPanel, setSelectedPanel] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [utrInput, setUtrInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [searchDate, setSearchDate] = useState('');
  const [purchaseResult, setPurchaseResult] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ff_reseller_token');
    if (!token) { navigate('/reseller-login'); return; }
    loadAll();
  }, []);

  const loadAll = () => {
    resellerFetch('/reseller/me').then(setReseller).catch(() => { localStorage.removeItem('ff_reseller_token'); navigate('/reseller-login'); });
    resellerFetch('/reseller/panels').then(setPanels).catch(() => {});
    resellerFetch('/reseller/packages').then(setPackages).catch(() => {});
    resellerFetch('/reseller/key-orders').then(setKeyOrders).catch(() => {});
    resellerFetch('/reseller/topups').then(setTopups).catch(() => {});
    resellerFetch('/reseller/payment-info').then(setPaymentInfo).catch(() => {});
  };

  const handleLogout = () => {
    localStorage.removeItem('ff_reseller_token');
    localStorage.removeItem('ff_reseller');
    navigate('/reseller-login');
  };

  const getPanelDurations = (panel) => {
    const durations = [];
    const fixedDays = [
      { days: 1, priceField: 'price_1day', resellerField: 'reseller_price_1day' },
      { days: 7, priceField: 'price_7day', resellerField: 'reseller_price_7day' },
      { days: 30, priceField: 'price_30day', resellerField: 'reseller_price_30day' },
      { days: 60, priceField: 'price_60day', resellerField: 'reseller_price_60day' },
    ];
    const avail = panel.key_availability || {};
    fixedDays.forEach(fd => {
      const rp = parseFloat(panel[fd.resellerField]);
      const cp = parseFloat(panel[fd.priceField]);
      const price = (rp && rp > 0) ? rp : cp;
      if (price > 0) durations.push({ days: fd.days, price, stock: avail[fd.days] || 0 });
    });
    const customPrices = panel.custom_prices || {};
    Object.entries(customPrices).forEach(([days, data]) => {
      const rp = parseFloat(data.reseller_price);
      const cp = parseFloat(data.price);
      const price = (rp && rp > 0) ? rp : cp;
      if (price > 0) durations.push({ days: parseInt(days), price, stock: avail[parseInt(days)] || 0 });
    });
    durations.sort((a, b) => a.days - b.days);
    return durations;
  };

  const currentPanel = panels.find(p => p.id === parseInt(selectedPanel));
  const currentDurations = currentPanel ? getPanelDurations(currentPanel) : [];
  const currentDur = currentDurations.find(d => String(d.days) === selectedDuration);
  const maxQty = currentDur ? currentDur.stock : 0;

  const handleGenerate = () => {
    if (!currentPanel || !currentDur) return toast.error('Select product and validity');
    if (currentDur.stock <= 0) return toast.error('Out of stock for this duration');
    if (quantity > maxQty) return toast.error(`Only ${maxQty} key${maxQty !== 1 ? 's' : ''} available`);
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setGenerating(true);
    setShowConfirm(false);
    const results = [];
    let lastBalance = reseller?.wallet_balance || 0;
    let failedAt = null;
    try {
      for (let i = 0; i < quantity; i++) {
        const data = await resellerFetch('/reseller/buy-key', {
          method: 'POST',
          body: JSON.stringify({ panel_id: currentPanel.id, duration_days: currentDur.days })
        });
        results.push(data);
        if (data.new_balance !== undefined) {
          lastBalance = data.new_balance;
          setReseller(prev => ({ ...prev, wallet_balance: data.new_balance }));
        }
      }
    } catch (err) {
      failedAt = err.message;
    }
    if (results.length > 0) {
      setPurchaseResult({
        panelName: currentPanel.name,
        platform: currentPanel.platform?.toUpperCase() || '',
        duration: currentDur.days,
        quantity: results.length,
        totalPaid: results.reduce((sum, r) => sum + parseFloat(r.order?.price_usd || 0), 0),
        newBalance: lastBalance,
        keys: results.map(r => r.order?.key_value).filter(Boolean),
        partial: failedAt ? `${results.length}/${quantity} purchased. Error: ${failedAt}` : null
      });
      loadAll();
    } else if (failedAt) {
      toast.error(failedAt);
    }
    setGenerating(false);
  };

  const handleBuyBalance = (pkg) => {
    setSelectedPackage(pkg);
    setPaymentMethod('upi');
    setUtrInput('');
    setShowTopupModal(true);
  };

  const handleSubmitTopup = async () => {
    if (!utrInput.trim()) return toast.error('Please enter UTR/TxHash');
    setSubmitting(true);
    try {
      await resellerFetch('/reseller/topup', {
        method: 'POST',
        body: JSON.stringify({ package_id: selectedPackage.id, payment_method: paymentMethod, utr_number: utrInput.trim() })
      });
      toast.success('Top-up request submitted! Awaiting admin approval.');
      setShowTopupModal(false);
      loadAll();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const downloadCSV = (rows, filename) => {
    if (!rows.length) return toast.error('No data to export');
    const headers = ['Key', 'Product', 'Days', 'Price', 'Date'];
    const csv = [headers.join(','), ...rows.map(o =>
      [o.key_value, getPanelName(o.panel_id), o.duration_days, `$${parseFloat(o.price_usd).toFixed(2)}`, new Date(o.created_at).toLocaleString()].join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const getPanelName = (panelId) => {
    const p = panels.find(x => x.id === panelId);
    return p ? `${p.name} ${p.platform}` : `Panel #${panelId}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = keyOrders.filter(o => o.created_at && new Date(o.created_at).toISOString().split('T')[0] === todayStr);
  const searchOrders = searchDate ? keyOrders.filter(o => o.created_at && new Date(o.created_at).toISOString().split('T')[0] === searchDate) : [];

  const todaySummary = {};
  todayOrders.forEach(o => {
    const name = `${getPanelName(o.panel_id)} ${o.duration_days}DAY`;
    todaySummary[name] = (todaySummary[name] || 0) + 1;
  });

  const allTimeSummary = {};
  keyOrders.forEach(o => {
    const name = `${getPanelName(o.panel_id)} ${o.duration_days} Day${o.duration_days > 1 ? 's' : ''}`;
    allTimeSummary[name] = (allTimeSummary[name] || 0) + 1;
  });

  if (!reseller) return (
    <div className="rd-container">
      <div className="rd-loading">Loading...</div>
    </div>
  );

  const totalCost = currentDur ? (currentDur.price * quantity) : 0;

  return (
    <div className="rd-container">
      <div className="rd-header">
        <h1 className="rd-title">Reseller Dashboard</h1>
        <p className="rd-welcome">Welcome, <span className="rd-name">{reseller.display_name || reseller.username}</span></p>
        <div className="rd-balance-card">
          <span className="rd-balance-label">Balance:</span>
          <span className="rd-balance-amount">${parseFloat(reseller.wallet_balance).toFixed(2)}</span>
        </div>
      </div>

      <div className="rd-tabs">
        {tabIcons.map(tab => (
          <button
            key={tab.id}
            className={`rd-tab ${activeTab === tab.id ? 'active' : ''}`}
            style={{ background: tab.gradient }}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="rd-content">
        {activeTab === 'keygen' && (
          <div className="rd-section">
            <h2 className="rd-section-title">Key Generator</h2>

            <div className="rd-field">
              <label className="rd-label">Product Type:</label>
              <select className="rd-select" value={selectedPanel} onChange={e => { setSelectedPanel(e.target.value); setSelectedDuration(''); setQuantity(1); }}>
                <option value="">-- Choose Product --</option>
                {panels.map(p => {
                  const keyCount = parseInt(p.key_count) || 0;
                  return <option key={p.id} value={p.id} disabled={keyCount === 0} style={keyCount === 0 ? { color: '#666' } : {}}>{p.name} {p.platform?.toUpperCase()} {keyCount === 0 ? '(Out of Stock)' : `(${keyCount} keys)`}</option>;
                })}
              </select>
            </div>

            {currentPanel && (
              <div className="rd-field">
                <label className="rd-label">Validity:</label>
                <select className="rd-select" value={selectedDuration} onChange={e => { setSelectedDuration(e.target.value); setQuantity(1); }}>
                  <option value="">-- Choose Duration --</option>
                  {currentDurations.map(d => (
                    <option key={d.days} value={String(d.days)} disabled={d.stock <= 0} style={d.stock <= 0 ? { color: '#666' } : {}}>
                      {d.days} Day{d.days > 1 ? 's' : ''} - ${d.price.toFixed(2)} {d.stock > 0 ? `(${d.stock} available)` : '(Out of Stock)'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {currentDur && (
              <div className="rd-field">
                <label className="rd-label">Available: <span style={{ color: currentDur.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{currentDur.stock} key{currentDur.stock !== 1 ? 's' : ''}</span></label>
              </div>
            )}

            {currentDur && currentDur.stock > 0 && (
              <div className="rd-field">
                <label className="rd-label">Quantity: <span style={{ fontSize: '11px', color: '#94a3b8' }}>(max {maxQty})</span></label>
                <div className="rd-quantity">
                  <button className="rd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <span className="rd-qty-value">{quantity}</span>
                  <button className="rd-qty-btn" onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}>+</button>
                </div>
              </div>
            )}

            <button
              className="rd-generate-btn"
              disabled={!currentDur || generating || maxQty <= 0}
              onClick={handleGenerate}
            >
              {generating ? 'Generating...' : maxQty <= 0 && currentDur ? 'OUT OF STOCK' : 'GENERATE KEYS'}
            </button>
          </div>
        )}

        {activeTab === 'balance-tx' && (
          <div className="rd-section">
            <h2 className="rd-section-title">Balance Transactions</h2>
            {topups.length === 0 ? (
              <div className="rd-empty">No transactions yet</div>
            ) : (
              <div className="rd-table-wrap">
                <table className="rd-table">
                  <thead>
                    <tr><th>DATE & TIME</th><th>TYPE</th><th>AMOUNT</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {topups.map(t => (
                      <tr key={t.id}>
                        <td className="rd-td-small">{new Date(t.created_at).toLocaleString()}</td>
                        <td><span className="rd-badge rd-badge-added">{t.status === 'approved' ? 'ADDED' : t.status?.toUpperCase()}</span></td>
                        <td className="rd-td-amount">+${parseFloat(t.amount_usd).toFixed(2)}</td>
                        <td className="rd-td-small">{t.payment_method?.toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'key-history' && (
          <div className="rd-section">
            <h2 className="rd-section-title">Key History</h2>
            {keyOrders.length === 0 ? (
              <div className="rd-empty">No keys generated yet</div>
            ) : (
              <>
                <div className="rd-table-wrap">
                  <table className="rd-table">
                    <thead>
                      <tr><th>#</th><th>KEY</th><th>TYPE</th><th>DAYS</th><th>DATE</th></tr>
                    </thead>
                    <tbody>
                      {keyOrders.map((o, i) => (
                        <tr key={o.id}>
                          <td>{i + 1}</td>
                          <td className="rd-td-key">{o.key_value ? (o.key_value.substring(0, 12) + '...') : '-'}</td>
                          <td className="rd-td-small">{getPanelName(o.panel_id)} {o.duration_days}DAY</td>
                          <td>{o.duration_days}</td>
                          <td className="rd-td-small">{new Date(o.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="rd-action-btn" onClick={() => downloadCSV(keyOrders, 'key_history.csv')}>
                  Download CSV
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === 'today' && (
          <div className="rd-section">
            <h2 className="rd-section-title">Keys Generated Today ({todayOrders.length})</h2>
            {Object.keys(todaySummary).length > 0 ? (
              <div className="rd-table-wrap">
                <table className="rd-table">
                  <thead>
                    <tr><th>PRODUCT</th><th>GENERATED</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(todaySummary).map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rd-empty">No keys generated today</div>
            )}

            <div className="rd-divider" />

            <div className="rd-field">
              <label className="rd-label">Search Keys by Date:</label>
              <input type="date" className="rd-select" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
            </div>
            <button className="rd-search-btn" onClick={() => { if (!searchDate) toast.error('Select a date'); }}>
              SEARCH
            </button>
            {searchDate && searchOrders.length > 0 && (
              <div className="rd-table-wrap" style={{ marginTop: '16px' }}>
                <table className="rd-table">
                  <thead>
                    <tr><th>PRODUCT</th><th>KEY</th><th>DATE</th></tr>
                  </thead>
                  <tbody>
                    {searchOrders.map((o, i) => (
                      <tr key={o.id}>
                        <td className="rd-td-small">{getPanelName(o.panel_id)}</td>
                        <td className="rd-td-key">{o.key_value ? (o.key_value.substring(0, 12) + '...') : '-'}</td>
                        <td className="rd-td-small">{new Date(o.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {searchDate && searchOrders.length === 0 && (
              <div className="rd-empty" style={{ marginTop: '12px' }}>No keys found for this date</div>
            )}

            <button className="rd-export-btn" onClick={() => downloadCSV(keyOrders, 'all_keys.csv')}>
              Export All Keys
            </button>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="rd-section">
            <div className="rd-stat-total">
              <span className="rd-stat-label">ALL TIME TOTAL SOLD :</span>
              <span className="rd-stat-number">{keyOrders.length}</span>
            </div>

            <h2 className="rd-section-title">All Time Keys Breakdown</h2>
            {Object.keys(allTimeSummary).length > 0 ? (
              <div className="rd-table-wrap">
                <table className="rd-table">
                  <thead>
                    <tr><th>PRODUCT</th><th>SOLD</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(allTimeSummary).map(([name, count]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rd-empty">No sales data yet</div>
            )}
          </div>
        )}

        {activeTab === 'add-balance' && (
          <div className="rd-section">
            <h2 className="rd-section-title">Add Wallet Balance</h2>
            <p className="rd-section-desc">Choose a package. After payment, submit your UTR/TxHash for verification.</p>
            <div className="rd-packages">
              {packages.map(pkg => (
                <div key={pkg.id} className="rd-package-card">
                  <h3 className="rd-pkg-name">{pkg.name}</h3>
                  <p className="rd-pkg-price">${parseFloat(pkg.price_usd).toFixed(2)}</p>
                  <p className="rd-pkg-desc">Get ${parseFloat(pkg.amount_usd).toFixed(2)} balance</p>
                  <button className="rd-pkg-btn" onClick={() => handleBuyBalance(pkg)}>Buy</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rd-footer">
        <button className="rd-logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {showConfirm && currentPanel && currentDur && createPortal(
        <div className="rd-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="rd-confirm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="rd-confirm-title">Confirm Generation</h3>
            <p className="rd-confirm-text">
              Generate {quantity} {currentPanel.name} {currentPanel.platform?.toUpperCase()} {currentDur.days} DAY key{quantity > 1 ? 's' : ''}?
            </p>
            <p className="rd-confirm-cost">Total Cost: ${totalCost.toFixed(2)}</p>
            <div className="rd-confirm-actions">
              <button className="rd-cancel-btn" onClick={() => setShowConfirm(false)}>CANCEL</button>
              <button className="rd-ok-btn" onClick={confirmGenerate}>CONFIRM</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {purchaseResult && createPortal(
        <div className="rd-modal-overlay" onClick={() => setPurchaseResult(null)}>
          <div className="rd-confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#10b981', letterSpacing: '0.5px' }}>PURCHASE SUCCESSFUL!</h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px' }}>📦 Order Details</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                <p>├ 🎮 <strong>{purchaseResult.panelName}</strong> ({purchaseResult.platform})</p>
                <p>├ ⏱ Duration: <strong>{purchaseResult.duration} Day{purchaseResult.duration > 1 ? 's' : ''}</strong></p>
                <p>├ 📦 Quantity: <strong>{purchaseResult.quantity}</strong></p>
                <p>└ 💰 Total Paid: <strong style={{ color: '#a855f7' }}>${purchaseResult.totalPaid.toFixed(2)}</strong></p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>💳 Payment</p>
              <p style={{ fontSize: '14px' }}>└ 💰 New Balance: <strong style={{ color: '#10b981' }}>${purchaseResult.newBalance.toFixed(2)}</strong></p>
            </div>

            <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#a855f7', marginBottom: '10px' }}>🔑 Your License Key{purchaseResult.keys.length > 1 ? 's' : ''}:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {purchaseResult.keys.map((key, i) => (
                  <div
                    key={i}
                    onClick={() => { navigator.clipboard.writeText(key); toast.success('Key copied!'); }}
                    style={{
                      fontFamily: 'monospace', fontSize: '14px', fontWeight: '700', color: '#e2e8f0',
                      cursor: 'pointer', padding: '8px 12px', background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px', wordBreak: 'break-all', transition: 'background 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                  >
                    <span style={{ color: '#a855f7' }}>:</span>{key}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
                💡 Tap a key to copy!
              </p>
            </div>

            <button
              onClick={() => {
                const allKeys = purchaseResult.keys.join('\n');
                navigator.clipboard.writeText(allKeys);
                toast.success('All keys copied!');
              }}
              style={{
                width: '100%', padding: '10px', background: 'rgba(168,85,247,0.15)',
                border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px',
                color: '#a855f7', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                marginBottom: '10px', transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.15)'}
            >
              📋 Copy All Keys
            </button>

            {purchaseResult.partial && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '10px', fontSize: '12px', color: '#f59e0b' }}>
                ⚠️ {purchaseResult.partial}
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#10b981', marginBottom: '14px' }}>
              ✅ Thank you for your purchase!
            </p>

            <button
              className="rd-ok-btn"
              onClick={() => setPurchaseResult(null)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              CLOSE
            </button>
          </div>
        </div>,
        document.body
      )}

      {showTopupModal && selectedPackage && createPortal(
        <div className="rd-modal-overlay" onClick={() => setShowTopupModal(false)}>
          <div className="rd-confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <h3 className="rd-confirm-title">Buy {selectedPackage.name}</h3>
            <p className="rd-confirm-text">
              Pay <strong style={{ color: '#a855f7' }}>${parseFloat(selectedPackage.price_usd).toFixed(2)}</strong> to receive <strong>${parseFloat(selectedPackage.amount_usd).toFixed(2)}</strong> balance.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label className="rd-label">Payment Method</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {paymentInfo.payment_method_upi === 'true' && <button className={`rd-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>UPI</button>}
                {paymentInfo.payment_method_crypto === 'true' && <button className={`rd-method-btn ${paymentMethod === 'crypto' ? 'active' : ''}`} onClick={() => setPaymentMethod('crypto')}>Crypto</button>}
                {paymentInfo.payment_method_paypal === 'true' && <button className={`rd-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`} onClick={() => setPaymentMethod('paypal')}>PayPal</button>}
                {paymentInfo.payment_method_bd === 'true' && <button className={`rd-method-btn ${paymentMethod === 'bd' ? 'active' : ''}`} onClick={() => setPaymentMethod('bd')}>BD Pay</button>}
              </div>
            </div>

            {paymentMethod === 'upi' && paymentInfo.upi_id && (
              <div className="rd-pay-info">
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Pay to UPI ID:</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7', wordBreak: 'break-all' }}>{paymentInfo.upi_id}</p>
              </div>
            )}
            {paymentMethod === 'paypal' && paymentInfo.paypal_id && (
              <div className="rd-pay-info">
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>PayPal Email:</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7', wordBreak: 'break-all' }}>{paymentInfo.paypal_id}</p>
              </div>
            )}
            {paymentMethod === 'bd' && (
              <div className="rd-pay-info">
                {paymentInfo.bkash_number && <p style={{ marginBottom: '4px' }}>bKash: <strong style={{ color: '#d12053' }}>{paymentInfo.bkash_number}</strong></p>}
                {paymentInfo.nagad_number && <p>Nagad: <strong style={{ color: '#f7941d' }}>{paymentInfo.nagad_number}</strong></p>}
              </div>
            )}
            {paymentMethod === 'crypto' && (
              <div className="rd-pay-info" style={{ fontSize: '12px' }}>
                {paymentInfo.crypto_btc_address && <p style={{ marginBottom: '6px' }}>BTC: <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{paymentInfo.crypto_btc_address}</span></p>}
                {paymentInfo.crypto_usdt_trc20_address && <p>USDT TRC20: <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{paymentInfo.crypto_usdt_trc20_address}</span></p>}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="rd-label">{paymentMethod === 'upi' ? 'UTR Number' : 'Transaction Hash'}</label>
              <input className="rd-select" type="text" value={utrInput} onChange={e => setUtrInput(e.target.value)} placeholder={paymentMethod === 'upi' ? 'Enter 12-digit UTR' : 'Enter tx hash'} style={{ marginTop: '8px' }} />
            </div>

            <div className="rd-confirm-actions">
              <button className="rd-cancel-btn" onClick={() => setShowTopupModal(false)}>CANCEL</button>
              <button className="rd-ok-btn" onClick={handleSubmitTopup} disabled={submitting}>{submitting ? 'Submitting...' : 'SUBMIT'}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
