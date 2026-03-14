import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import toast from 'react-hot-toast';

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { code: '', discount_percent: 0, discount_amount: 0, min_order: 0, max_uses: 0, expires_at: '' };
  const [form, setForm] = useState(emptyForm);

  const load = () => apiFetch('/admin/promo-codes').then(setPromos).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, expires_at: form.expires_at || null };
      if (editing) {
        await apiFetch(`/admin/promo-codes/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('Promo updated');
      } else {
        await apiFetch('/admin/promo-codes', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Promo created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    try {
      await apiFetch(`/admin/promo-codes/${id}`, { method: 'DELETE' });
      toast.success('Promo deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (promo) => {
    try {
      await apiFetch(`/admin/promo-codes/${promo.id}`, {
        method: 'PUT', body: JSON.stringify({ is_active: !promo.is_active })
      });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ code: p.code, discount_percent: p.discount_percent, discount_amount: p.discount_amount, min_order: p.min_order, max_uses: p.max_uses, expires_at: p.expires_at ? p.expires_at.split('T')[0] : '' });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Promo Codes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create and manage discount codes</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}>
          + New Promo
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: '700', color: 'var(--accent)' }}>{p.code}</td>
                <td>
                  {p.discount_percent > 0 ? `${p.discount_percent}%` : ''}
                  {p.discount_amount > 0 ? `$${parseFloat(p.discount_amount).toFixed(2)}` : ''}
                </td>
                <td>${parseFloat(p.min_order).toFixed(2)}</td>
                <td>{p.used_count}/{p.max_uses || '∞'}</td>
                <td>
                  <span className={`badge ${p.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm" style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      onClick={() => toggleActive(p)}>{p.is_active ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Promo' : 'New Promo Code'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required placeholder="e.g. SAVE20" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Discount %</label>
                  <input type="number" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: e.target.value})} min="0" max="100" />
                </div>
                <div className="input-group">
                  <label>Discount $ (flat)</label>
                  <input type="number" value={form.discount_amount} onChange={e => setForm({...form, discount_amount: e.target.value})} min="0" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Min Order $</label>
                  <input type="number" value={form.min_order} onChange={e => setForm({...form, min_order: e.target.value})} min="0" />
                </div>
                <div className="input-group">
                  <label>Max Uses (0=unlimited)</label>
                  <input type="number" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} min="0" />
                </div>
              </div>
              <div className="input-group">
                <label>Expiry Date (optional)</label>
                <input type="date" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} />
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
