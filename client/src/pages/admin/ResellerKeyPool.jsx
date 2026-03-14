import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminResellerKeyPool() {
  const [keys, setKeys] = useState([]);
  const [panels, setPanels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addPanelId, setAddPanelId] = useState('');
  const [addDuration, setAddDuration] = useState('1');
  const [addKeys, setAddKeys] = useState('');
  const [filterPanel, setFilterPanel] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const load = () => {
    apiFetch('/admin/reseller-key-pool').then(setKeys).catch(() => {});
    apiFetch('/admin/panels').then(setPanels).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAddKeys = async () => {
    if (!addPanelId) return toast.error('Select a panel');
    const keyList = addKeys.split('\n').map(k => k.trim()).filter(Boolean);
    if (!keyList.length) return toast.error('Enter at least one key');
    try {
      await apiFetch('/admin/reseller-key-pool', {
        method: 'POST',
        body: JSON.stringify({
          panel_id: parseInt(addPanelId),
          duration_days: parseInt(addDuration),
          keys: keyList
        })
      });
      toast.success(`${keyList.length} key(s) added`);
      setShowAddModal(false);
      setAddKeys('');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm('Delete this key?')) return;
    try {
      await apiFetch(`/admin/reseller-key-pool/${id}`, { method: 'DELETE' });
      toast.success('Key deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return toast.error('Select keys first');
    if (!confirm(`Delete ${selectedIds.size} selected key(s)?`)) return;
    try {
      await apiFetch('/admin/reseller-key-pool-bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      toast.success(`${selectedIds.size} key(s) deleted`);
      setSelectedIds(new Set());
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleClearSold = async () => {
    if (!confirm('Delete ALL sold reseller keys? This cannot be undone.')) return;
    try {
      const data = await apiFetch('/admin/reseller-key-pool-bulk', {
        method: 'DELETE',
        body: JSON.stringify({ clear_sold: true })
      });
      toast.success(`${data.deleted} sold key(s) cleared`);
      setSelectedIds(new Set());
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(k => k.id)));
    }
  };

  const selectedPanel = panels.find(p => p.id === parseInt(addPanelId));
  const getAvailableDurations = () => {
    if (!selectedPanel) return [1, 7, 30, 60];
    const durations = [];
    if (parseFloat(selectedPanel.price_1day) > 0) durations.push(1);
    if (parseFloat(selectedPanel.price_7day) > 0) durations.push(7);
    if (parseFloat(selectedPanel.price_30day) > 0) durations.push(30);
    if (parseFloat(selectedPanel.price_60day) > 0) durations.push(60);
    const cp = selectedPanel.custom_prices || {};
    Object.keys(cp).forEach(d => {
      if (parseFloat(cp[d].price) > 0) durations.push(parseInt(d));
    });
    durations.sort((a, b) => a - b);
    return durations.length > 0 ? durations : [1, 7, 30, 60];
  };

  const allDurations = [...new Set(keys.map(k => k.duration_days))].sort((a, b) => a - b);

  const filtered = keys.filter(k => {
    if (filterPanel && k.panel_id !== parseInt(filterPanel)) return false;
    if (filterDuration && k.duration_days !== parseInt(filterDuration)) return false;
    if (filterStatus && k.status !== filterStatus) return false;
    return true;
  });

  const availableCount = keys.filter(k => k.status === 'available').length;
  const soldCount = keys.filter(k => k.status === 'sold').length;

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Reseller Key Pool</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage activation keys for resellers by specific panel</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px' }}>
            <span style={{ color: '#10b981' }}>Available: {availableCount}</span>
            <span style={{ color: '#3b82f6' }}>Sold: {soldCount}</span>
            <span style={{ color: 'var(--text-muted)' }}>Total: {keys.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {soldCount > 0 && (
            <button className="btn btn-sm btn-danger" onClick={handleClearSold}>Clear Sold Keys ({soldCount})</button>
          )}
          {selectedIds.size > 0 && (
            <button className="btn btn-sm btn-danger" onClick={handleBulkDelete}>Delete Selected ({selectedIds.size})</button>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>+ Add Keys</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterPanel} onChange={e => setFilterPanel(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}>
          <option value="">All Panels</option>
          {panels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterDuration} onChange={e => setFilterDuration(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}>
          <option value="">All Durations</option>
          {allDurations.map(d => <option key={d} value={d}>{d} Day</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px' }}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><h3>No keys found</h3><p>Add activation keys to the pool</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>ID</th><th>Panel</th><th>Duration</th><th>Key</th><th>Status</th><th>Added</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(k => (
                <tr key={k.id} style={{ background: selectedIds.has(k.id) ? 'rgba(168,85,247,0.08)' : undefined }}>
                  <td>
                    <input type="checkbox" checked={selectedIds.has(k.id)} onChange={() => toggleSelect(k.id)} />
                  </td>
                  <td>{k.id}</td>
                  <td>{k.panel_name}</td>
                  <td>{k.duration_days} Day</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', maxWidth: '200px', wordBreak: 'break-all' }}>{k.key_value}</td>
                  <td><span className={`badge ${k.status === 'available' ? 'badge-success' : 'badge-info'}`}>{k.status}</span></td>
                  <td style={{ fontSize: '12px' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteKey(k.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>Add Keys to Pool</h2>
            <div className="input-group">
              <label>Panel</label>
              <select value={addPanelId} onChange={e => { setAddPanelId(e.target.value); setAddDuration(''); }}>
                <option value="">Select Panel</option>
                {panels.map(p => <option key={p.id} value={p.id}>{p.name} ({p.platform})</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Duration (Days)</label>
              <select value={addDuration} onChange={e => setAddDuration(e.target.value)}>
                <option value="">Select Duration</option>
                {getAvailableDurations().map(d => <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Keys (one per line)</label>
              <textarea value={addKeys} onChange={e => setAddKeys(e.target.value)} rows={8} placeholder={"KEY-XXXX-YYYY-ZZZZ\nKEY-AAAA-BBBB-CCCC\nKEY-1111-2222-3333"} style={{ fontFamily: 'monospace', fontSize: '13px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleAddKeys} style={{ flex: 1, justifyContent: 'center' }}>Add Keys</button>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
