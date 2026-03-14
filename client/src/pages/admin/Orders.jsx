import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [deliveredFiles, setDeliveredFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    const url = filter ? `/admin/orders?status=${filter}` : '/admin/orders';
    apiFetch(url).then(setOrders).catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);

  const updateOrder = async (id, data) => {
    try {
      await apiFetch(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Order updated');
      load();
      setShowModal(false);
    } catch (err) { toast.error(err.message); }
  };

  const openDetails = (order) => {
    setSelected(order);
    setKeyInput(order.key_delivered || '');
    setNotesInput(order.admin_notes || '');
    let files = [];
    try { files = JSON.parse(order.delivered_files || '[]'); } catch { files = []; }
    setDeliveredFiles(files);
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      const token = localStorage.getItem('ff_token');
      const res = await fetch(`/api/admin/orders/${selected.id}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setDeliveredFiles(data.files);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Remove this file?')) return;
    try {
      const data = await apiFetch(`/admin/orders/${selected.id}/files/${fileId}`, { method: 'DELETE' });
      setDeliveredFiles(data.files);
      toast.success('File removed');
    } catch (err) { toast.error(err.message); }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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

  const statusBadge = (status) => {
    const map = {
      'pending_payment': { cls: 'badge-warning', label: 'Pending Payment' },
      'pending_verification': { cls: 'badge-info', label: 'Pending Verification' },
      'approved': { cls: 'badge-success', label: 'Approved' },
      'rejected': { cls: 'badge-danger', label: 'Rejected' },
      'delivered': { cls: 'badge-success', label: 'Delivered' },
    };
    const s = map[status] || { cls: 'badge-info', label: status };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const durationLabels = { '1day': '1 Day', '7day': '7 Days', '30day': '30 Days', '60day': '60 Days' };
  const filters = ['', 'pending_payment', 'pending_verification', 'approved', 'rejected', 'delivered'];
  const filterLabels = { '': 'All', 'pending_payment': 'Pending Payment', 'pending_verification': 'Pending Verification', 'approved': 'Approved', 'rejected': 'Rejected', 'delivered': 'Delivered' };

  return (
    <AdminLayout>
      <h1 className="page-title">Orders</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Manage customer orders and verify payments</p>

      <div className="tabs" style={{ marginBottom: '20px' }}>
        {filters.map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="empty-state"><h3>No orders found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Customer</th><th>Email</th><th>Telegram</th><th>Panel</th><th>Duration</th><th>Amount</th><th>UTR</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td style={{ fontWeight: '600' }}>{o.customer_username}</td>
                  <td style={{ fontSize: '12px' }}>{o.customer_email || '-'}</td>
                  <td style={{ color: 'var(--info)' }}>{o.customer_telegram || '-'}</td>
                  <td>{o.panel_name}</td>
                  <td>{durationLabels[o.duration]}</td>
                  <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${parseFloat(o.final_price).toFixed(2)}</td>
                  <td style={{ fontSize: '12px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.utr_number || '-'}</td>
                  <td>{statusBadge(o.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openDetails(o)}>View</button>
                      <button className="btn btn-sm btn-danger" onClick={async () => {
                        if (!confirm('Delete this order permanently?')) return;
                        try {
                          await apiFetch(`/admin/orders/${o.id}`, { method: 'DELETE' });
                          toast.success('Order deleted');
                          load();
                        } catch (err) { toast.error(err.message); }
                      }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selected && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Order #{selected.id}</h2>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer</span>
                <span style={{ fontWeight: '600' }}>{selected.customer_username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Telegram</span>
                <span style={{ color: 'var(--info)' }}>{selected.customer_telegram || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span>{selected.customer_email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Panel</span>
                <span style={{ fontWeight: '600' }}>{selected.panel_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                <span>{durationLabels[selected.duration]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Original Price</span>
                <span>${parseFloat(selected.price).toFixed(2)}</span>
              </div>
              {parseFloat(selected.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Discount ({selected.promo_code})</span>
                  <span className="text-success">-${parseFloat(selected.discount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Final Amount</span>
                <span style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '18px' }}>${parseFloat(selected.final_price).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: '600' }}>{selected.payment_method?.toUpperCase() || 'UPI'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>UTR / TxHash</span>
                <span style={{ fontWeight: '600', color: 'var(--warning)', maxWidth: '200px', wordBreak: 'break-all', textAlign: 'right' }}>{selected.utr_number || 'Not submitted'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                {statusBadge(selected.status)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date</span>
                <span style={{ fontSize: '13px' }}>{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              {selected.payment_proof_image && (
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Payment Proof</span>
                  <a href={`/uploads/${selected.payment_proof_image}`} target="_blank" rel="noopener noreferrer">
                    <img src={`/uploads/${selected.payment_proof_image}`} alt="Payment Proof" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }} />
                  </a>
                </div>
              )}
            </div>

            <div style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--accent)' }}>Deliver Key or Files</h3>

              <div className="input-group" style={{ marginBottom: '12px' }}>
                <label>Activation Key (optional)</label>
                <input type="text" value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="Enter activation key to deliver" />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Upload Files (APKs, certificates, configs, etc.)
                </label>
                <div
                  style={{
                    border: '2px dashed var(--border)', borderRadius: '10px', padding: '20px',
                    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    background: 'var(--bg-card)'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'var(--border)';
                    const dt = e.dataTransfer;
                    if (dt.files.length > 0) {
                      const input = fileInputRef.current;
                      input.files = dt.files;
                      handleFileUpload({ target: input });
                    }
                  }}
                >
                  {uploading ? (
                    <p style={{ color: 'var(--accent)', fontSize: '14px' }}>Uploading...</p>
                  ) : (
                    <>
                      <p style={{ fontSize: '24px', marginBottom: '4px' }}>📁</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Click or drag files here</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>All file types supported (max 100MB each)</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
              </div>

              {deliveredFiles.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Uploaded Files ({deliveredFiles.length})
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {deliveredFiles.map(f => (
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
                        <button className="btn btn-sm btn-danger" style={{ flexShrink: 0, padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => deleteFile(f.id)}>Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="input-group">
              <label>Admin Notes</label>
              <textarea value={notesInput} onChange={e => setNotesInput(e.target.value)} rows={2} placeholder="Add notes (visible to customer)" />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-success" onClick={() => updateOrder(selected.id, { status: 'approved', key_delivered: keyInput, admin_notes: notesInput })}>
                ✓ Approve
              </button>
              <button className="btn btn-danger" onClick={() => updateOrder(selected.id, { status: 'rejected', admin_notes: notesInput })}>
                Reject
              </button>
              <button className="btn btn-primary" onClick={() => updateOrder(selected.id, { status: 'delivered', key_delivered: keyInput, admin_notes: notesInput })}>
                {deliveredFiles.length > 0 && keyInput ? 'Deliver Key & Files' : deliveredFiles.length > 0 ? 'Deliver Files' : 'Deliver Key'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
