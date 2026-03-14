import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminResellerOrders() {
  const [topups, setTopups] = useState([]);
  const [keyOrders, setKeyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('topups');
  const [filter, setFilter] = useState('');

  const load = () => {
    const url = filter ? `/admin/reseller-topups?status=${filter}` : '/admin/reseller-topups';
    apiFetch(url).then(setTopups).catch(() => {});
    apiFetch('/admin/reseller-key-orders').then(setKeyOrders).catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);

  const handleTopupAction = async (id, status) => {
    try {
      await apiFetch(`/admin/reseller-topups/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success(status === 'approved' ? 'Top-up approved! Balance credited.' : 'Top-up rejected.');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const statusBadge = (status) => {
    const map = {
      'pending_payment': { cls: 'badge-warning', label: 'Pending Payment' },
      'pending_verification': { cls: 'badge-info', label: 'Pending' },
      'approved': { cls: 'badge-success', label: 'Approved' },
      'rejected': { cls: 'badge-danger', label: 'Rejected' },
      'delivered': { cls: 'badge-success', label: 'Delivered' },
    };
    const s = map[status] || { cls: 'badge-info', label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const filters = ['', 'pending_verification', 'approved', 'rejected'];
  const filterLabels = { '': 'All', 'pending_verification': 'Pending', 'approved': 'Approved', 'rejected': 'Rejected' };

  return (
    <AdminLayout>
      <h1 className="page-title">Reseller Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Manage reseller balance top-ups and view key purchase history</p>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button className={`tab ${activeTab === 'topups' ? 'active' : ''}`} onClick={() => setActiveTab('topups')}>
          Balance Top-ups
        </button>
        <button className={`tab ${activeTab === 'keys' ? 'active' : ''}`} onClick={() => setActiveTab('keys')}>
          Key Purchases
        </button>
      </div>

      {activeTab === 'topups' && (
        <>
          <div className="tabs" style={{ marginBottom: '16px' }}>
            {filters.map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                {filterLabels[f]}
              </button>
            ))}
          </div>

          {topups.length === 0 ? (
            <div className="empty-state"><h3>No top-up requests</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Reseller</th><th>Package</th><th>Amount</th><th>Method</th><th>UTR/TxHash</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {topups.map(t => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td style={{ fontWeight: '600' }}>{t.reseller_username}</td>
                      <td>{t.package_name}</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${parseFloat(t.amount_usd).toFixed(2)}</td>
                      <td>{t.payment_method?.toUpperCase()}</td>
                      <td style={{ fontSize: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.utr_number || '-'}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td style={{ fontSize: '12px' }}>{new Date(t.created_at).toLocaleString()}</td>
                      <td>
                        {t.status === 'pending_verification' && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-sm btn-success" onClick={() => handleTopupAction(t.id, 'approved')}>Approve</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleTopupAction(t.id, 'rejected')}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'keys' && (
        <>
          {keyOrders.length === 0 ? (
            <div className="empty-state"><h3>No key purchases yet</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Reseller</th><th>Duration</th><th>Price</th><th>Key</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {keyOrders.map(o => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td style={{ fontWeight: '600' }}>{o.reseller_username}</td>
                      <td>{o.duration_days} Day</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${parseFloat(o.price_usd).toFixed(2)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', maxWidth: '150px', wordBreak: 'break-all' }}>{o.key_value}</td>
                      <td>{statusBadge(o.status)}</td>
                      <td style={{ fontSize: '12px' }}>{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
