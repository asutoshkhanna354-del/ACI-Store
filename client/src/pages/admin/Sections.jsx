import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminSections() {
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 });

  const load = () => apiFetch('/admin/sections').then(setSections).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiFetch(`/admin/sections/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Section updated');
      } else {
        await apiFetch('/admin/sections', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Section created');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', description: '', sort_order: 0 });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this section and all its panels?')) return;
    try {
      await apiFetch(`/admin/sections/${id}`, { method: 'DELETE' });
      toast.success('Section deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (section) => {
    try {
      await apiFetch(`/admin/sections/${section.id}`, {
        method: 'PUT', body: JSON.stringify({ is_active: !section.is_active })
      });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, description: s.description, sort_order: s.sort_order });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Sections</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage store categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', description: '', sort_order: 0 }); setShowModal(true); }}>
          + New Section
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Order</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {sections.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: '600' }}>{s.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.description}</td>
                <td>{s.sort_order}</td>
                <td>
                  <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {s.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      onClick={() => toggleActive(s)}>{s.is_active ? 'Hide' : 'Show'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Section' : 'New Section'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Section Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="input-group">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
