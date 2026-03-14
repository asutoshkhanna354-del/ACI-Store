import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminResellers() {
  const [resellers, setResellers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', display_name: '', status: 'active', wallet_balance: 0 });
  const [editId, setEditId] = useState(null);

  const load = () => apiFetch('/admin/resellers').then(setResellers).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) return toast.error('Username and password required');
    try {
      await apiFetch('/admin/resellers', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Reseller created');
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdate = async () => {
    try {
      const data = { display_name: form.display_name, status: form.status, wallet_balance: parseFloat(form.wallet_balance) };
      if (form.password) data.password = form.password;
      await apiFetch(`/admin/resellers/${editId}`, { method: 'PUT', body: JSON.stringify(data) });
      toast.success('Reseller updated');
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reseller? All their data will be lost.')) return;
    try {
      await apiFetch(`/admin/resellers/${id}`, { method: 'DELETE' });
      toast.success('Reseller deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openCreate = () => {
    setEditMode(false);
    setForm({ username: '', password: '', display_name: '', status: 'active', wallet_balance: 0 });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditMode(true);
    setEditId(r.id);
    setForm({ username: r.username, password: '', display_name: r.display_name, status: r.status, wallet_balance: r.wallet_balance });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Resellers</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage reseller accounts</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Create Reseller</button>
      </div>

      {resellers.length === 0 ? (
        <div className="empty-state"><h3>No resellers yet</h3><p>Create your first reseller account</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Username</th><th>Display Name</th><th>Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {resellers.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{ fontWeight: '600' }}>{r.username}</td>
                  <td>{r.display_name}</td>
                  <td style={{ fontWeight: '700', color: 'var(--accent)' }}>${parseFloat(r.wallet_balance).toFixed(2)}</td>
                  <td><span className={`badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                  <td style={{ fontSize: '12px' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h2>{editMode ? 'Edit Reseller' : 'Create Reseller'}</h2>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} disabled={editMode} placeholder="reseller_username" />
            </div>
            <div className="input-group">
              <label>{editMode ? 'New Password (leave empty to keep)' : 'Password'}</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" />
            </div>
            <div className="input-group">
              <label>Display Name</label>
              <input type="text" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})} placeholder="Reseller name" />
            </div>
            {editMode && (
              <>
                <div className="input-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Wallet Balance ($)</label>
                  <input type="number" step="0.01" value={form.wallet_balance} onChange={e => setForm({...form, wallet_balance: e.target.value})} />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={editMode ? handleUpdate : handleCreate} style={{ flex: 1, justifyContent: 'center' }}>
                {editMode ? 'Update' : 'Create'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
