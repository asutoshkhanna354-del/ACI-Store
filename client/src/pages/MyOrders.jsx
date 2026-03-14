import { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { apiFetch } from '../api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, t } = useCurrency();

  useEffect(() => {
    apiFetch('/store/my-orders').then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      'pending_payment': { cls: 'badge-warning', label: t('pendingPayment') },
      'pending_verification': { cls: 'badge-info', label: t('pendingVerification') },
      'approved': { cls: 'badge-success', label: t('approved') },
      'rejected': { cls: 'badge-danger', label: t('rejected') },
      'delivered': { cls: 'badge-success', label: t('delivered') },
    };
    const s = map[status] || { cls: 'badge-info', label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const durationLabels = { '1day': t('day1'), '7day': t('days7'), '30day': t('days30'), '60day': t('days60') };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (['apk', 'ipa', 'xapk'].includes(ext)) return '📱';
    if (['cer', 'crt', 'pem', 'p12', 'pfx', 'key'].includes(ext)) return '🔐';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    if (['pdf'].includes(ext)) return '📄';
    if (['txt', 'log', 'cfg', 'conf', 'ini'].includes(ext)) return '📝';
    if (['exe', 'msi', 'dmg', 'deb', 'rpm'].includes(ext)) return '💿';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFiles = (order) => {
    try { return JSON.parse(order.delivered_files || '[]'); } catch { return []; }
  };

  const downloadFile = (orderId, fileId, fileName) => {
    const token = localStorage.getItem('ff_token');
    const link = document.createElement('a');
    link.href = `/api/store/download/${orderId}/${fileId}?token=${token}`;
    link.download = fileName;
    link.click();
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="empty-state"><h3>{t('loading')}</h3></div></div>;

  return (
    <div className="container fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="page-title">{t('myOrders')}</h1>
      <p className="page-subtitle">{t('trackOrderStatus')}</p>

      {orders.length === 0 ? (
        <div className="empty-state">
          <h3>{t('noOrdersYet')}</h3>
          <p>{t('ordersWillAppear')}</p>
        </div>
      ) : (
        orders.map(order => {
          const files = getFiles(order);
          return (
            <div key={order.id} className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{order.panel_name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {t('duration')}: {durationLabels[order.duration]} | {t('order')} #{order.id}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {statusBadge(order.status)}
                  <p style={{ marginTop: '8px', fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{formatPrice(parseFloat(order.final_price))}</p>
                </div>
              </div>
              {order.utr_number && (
                <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  UTR: <strong>{order.utr_number}</strong>
                </p>
              )}
              {order.key_delivered && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success)' }}>{t('yourKey')}:</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', wordBreak: 'break-all' }}>{order.key_delivered}</p>
                </div>
              )}
              {files.length > 0 && order.status === 'delivered' && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid var(--accent)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', marginBottom: '8px' }}>
                    {t('yourFiles') || 'Your Files'}:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {files.map(f => (
                      <div key={f.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '8px 12px', gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '18px' }}>{getFileIcon(f.originalName)}</span>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatFileSize(f.size)}</p>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-primary" style={{ flexShrink: 0, padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => downloadFile(order.id, f.id, f.originalName)}>
                          {t('download') || 'Download'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {order.status === 'rejected' && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>Order Rejected</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {order.admin_notes || 'Your payment was rejected. This may be due to wrong TXN ID or proof. Please contact support.'}
                  </p>
                </div>
              )}
              {order.admin_notes && order.status !== 'rejected' && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {t('note')}: {order.admin_notes}
                </p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
