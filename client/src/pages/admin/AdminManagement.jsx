import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    permissions: {
      manage_users: false,
      manage_resellers: false,
      view_payments: false,
      manage_settings: false
    }
  });

  const load = () => apiFetch('/admin/admins').then(setAdmins).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) return toast.error('Username and password required');
    try {
      await apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Admin created');
      setShowModal(false);
      setForm({ username: '', password: '', permissions: { manage_users: false, manage_resellers: false, view_payments: false, manage_settings: false } });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admin?')) return;
    try {
      await apiFetch(`/admin/admins/${id}`, { method: 'DELETE' });
      toast.success('Admin deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const togglePermission = (key) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [key]: !form.permissions[key]
      }
    });
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage sub-admin accounts</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Create Admin</button>
      </div>

      {admins.length === 0 ? (
        <div className="empty-state"><h3>No admins found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Username</th><th>Role</th><th>Permissions</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: '600' }}>{a.username}</td>
                  <td><span className={`badge ${a.role === 'main_admin' ? 'badge-success' : 'badge-info'}`}>{a.role}</span></td>
                  <td style={{ fontSize: '11px', maxWidth: '300px' }}>
                    {Object.entries(a.permissions || {}).filter(([_, v]) => v).map(([k]) => k.replace('_', ' ')).join(', ') || 'No permissions'}
                  </td>
                  <td style={{ fontSize: '12px' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    {a.role !== 'main_admin' && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                    )}
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
            <h2>Create New Admin</h2>
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="admin_user" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Permissions</label>
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.keys(form.permissions).map(key => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={form.permissions[key]} onChange={() => togglePermission(key)} />
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleCreate} style={{ flex: 1, justifyContent: 'center' }}>Create Admin</button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
