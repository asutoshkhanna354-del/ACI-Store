import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getToken } from '../../api';
import toast from 'react-hot-toast';

export default function AdminPanels() {
  const [panels, setPanels] = useState([]);
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [panelImages, setPanelImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const emptyForm = { section_id: '', name: '', description: '', platform: 'both', price_1day: 0, price_7day: 0, price_30day: 0, price_60day: 0, reseller_price_1day: 0, reseller_price_7day: 0, reseller_price_30day: 0, reseller_price_60day: 0, features: '', image_url: '', custom_prices: {}, hidden_durations: {} };
  const [form, setForm] = useState(emptyForm);
  const [customDays, setCustomDays] = useState([]);

  const load = () => {
    apiFetch('/admin/panels').then(setPanels).catch(() => {});
    apiFetch('/admin/sections').then(setSections).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const loadImages = (panelId) => {
    apiFetch(`/admin/panels/${panelId}/images`).then(setPanelImages).catch(() => setPanelImages([]));
  };

  const customPricesToArray = (cp) => {
    if (!cp || typeof cp !== 'object') return [];
    return Object.entries(cp).map(([days, data]) => ({
      days: parseInt(days),
      price: parseFloat(data.price) || 0,
      reseller_price: parseFloat(data.reseller_price) || 0,
    })).sort((a, b) => a.days - b.days);
  };

  const arrayToCustomPrices = (arr) => {
    const result = {};
    arr.forEach(item => {
      if (item.days > 0 && item.price > 0) {
        result[String(item.days)] = { price: parseFloat(item.price) || 0, reseller_price: parseFloat(item.reseller_price) || 0 };
      }
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...form, custom_prices: arrayToCustomPrices(customDays), hidden_durations: form.hidden_durations || {} };
      if (editing) {
        await apiFetch(`/admin/panels/${editing.id}`, { method: 'PUT', body: JSON.stringify(submitData) });
        toast.success('Panel updated');
      } else {
        const created = await apiFetch('/admin/panels', { method: 'POST', body: JSON.stringify(submitData) });
        setEditing(created);
        toast.success('Panel created — you can now upload images');
        load();
        loadImages(created.id);
        return;
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      setCustomDays([]);
      setPanelImages([]);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this panel?')) return;
    try {
      await apiFetch(`/admin/panels/${id}`, { method: 'DELETE' });
      toast.success('Panel deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleStock = async (panel) => {
    try {
      await apiFetch(`/admin/panels/${panel.id}`, {
        method: 'PUT', body: JSON.stringify({ is_in_stock: !panel.is_in_stock })
      });
      toast.success(panel.is_in_stock ? 'Marked out of stock' : 'Marked in stock');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const toggleActive = async (panel) => {
    try {
      await apiFetch(`/admin/panels/${panel.id}`, {
        method: 'PUT', body: JSON.stringify({ is_active: !panel.is_active })
      });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      section_id: p.section_id, name: p.name, description: p.description, platform: p.platform,
      price_1day: p.price_1day, price_7day: p.price_7day, price_30day: p.price_30day, price_60day: p.price_60day,
      reseller_price_1day: p.reseller_price_1day || 0, reseller_price_7day: p.reseller_price_7day || 0,
      reseller_price_30day: p.reseller_price_30day || 0, reseller_price_60day: p.reseller_price_60day || 0,
      features: p.features, image_url: p.image_url, custom_prices: p.custom_prices || {}, hidden_durations: p.hidden_durations || {}
    });
    setCustomDays(customPricesToArray(p.custom_prices));
    loadImages(p.id);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editing) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }
      const token = getToken();
      const res = await fetch(`/api/admin/panels/${editing.id}/images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast.success(`${files.length} image(s) uploaded`);
      loadImages(editing.id);
    } catch (err) { toast.error(err.message); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (imageId) => {
    if (!editing) return;
    try {
      await apiFetch(`/admin/panels/${editing.id}/images/${imageId}`, { method: 'DELETE' });
      toast.success('Image deleted');
      loadImages(editing.id);
    } catch (err) { toast.error(err.message); }
  };

  const addCustomDay = () => {
    setCustomDays(prev => [...prev, { days: 0, price: 0, reseller_price: 0 }]);
  };

  const updateCustomDay = (index, field, value) => {
    setCustomDays(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeCustomDay = (index) => {
    setCustomDays(prev => prev.filter((_, i) => i !== index));
  };

  const getCustomDaysSummary = (panel) => {
    const cp = panel.custom_prices || {};
    const entries = Object.entries(cp);
    if (entries.length === 0) return null;
    return entries.sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([days, data]) => `${days}D: $${parseFloat(data.price).toFixed(2)}`).join(', ');
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Panels</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your panels</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({...emptyForm, section_id: sections[0]?.id || ''}); setCustomDays([]); setPanelImages([]); setShowModal(true); }}>
          + New Panel
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Panel</th><th>Section</th><th>Platform</th><th>1D</th><th>7D</th><th>30D</th><th>60D</th><th>Custom</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {panels.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: '600' }}>{p.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{p.section_name}</td>
                <td>{p.platform}</td>
                <td>
                  <div>${parseFloat(p.price_1day).toFixed(2)}</div>
                  {parseFloat(p.reseller_price_1day) > 0 && <div style={{ fontSize: '10px', color: 'var(--success)' }}>R: ${parseFloat(p.reseller_price_1day).toFixed(2)}</div>}
                </td>
                <td>
                  <div>${parseFloat(p.price_7day).toFixed(2)}</div>
                  {parseFloat(p.reseller_price_7day) > 0 && <div style={{ fontSize: '10px', color: 'var(--success)' }}>R: ${parseFloat(p.reseller_price_7day).toFixed(2)}</div>}
                </td>
                <td>
                  <div>${parseFloat(p.price_30day).toFixed(2)}</div>
                  {parseFloat(p.reseller_price_30day) > 0 && <div style={{ fontSize: '10px', color: 'var(--success)' }}>R: ${parseFloat(p.reseller_price_30day).toFixed(2)}</div>}
                </td>
                <td>
                  <div>${parseFloat(p.price_60day).toFixed(2)}</div>
                  {parseFloat(p.reseller_price_60day) > 0 && <div style={{ fontSize: '10px', color: 'var(--success)' }}>R: ${parseFloat(p.reseller_price_60day).toFixed(2)}</div>}
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '120px' }}>
                  {getCustomDaysSummary(p) || '-'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={p.is_active !== false}
                      onChange={() => toggleActive(p)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '11px', color: p.is_active !== false ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                      {p.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setPanelImages([]); setCustomDays([]); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{editing ? 'Edit Panel' : 'New Panel'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Section</label>
                <select value={form.section_id} onChange={e => setForm({...form, section_id: e.target.value})} required>
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Panel Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              </div>
              <div className="input-group">
                <label>Platform</label>
                <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                  <option value="both">Both (iOS & Android)</option>
                  <option value="ios">iOS Only</option>
                  <option value="android">Android Only</option>
                  <option value="pc">PC Only</option>
                  <option value="ipad">iPadOS Only</option>
                </select>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '12px', marginBottom: '4px' }}>Standard Prices</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Price - 1 Day ($) min $1</label>
                  <input type="number" step="0.01" min="1" value={form.price_1day} onChange={e => setForm({...form, price_1day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Price - 7 Days ($) min $1</label>
                  <input type="number" step="0.01" min="1" value={form.price_7day} onChange={e => setForm({...form, price_7day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Price - 30 Days ($) min $1</label>
                  <input type="number" step="0.01" min="1" value={form.price_30day} onChange={e => setForm({...form, price_30day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Price - 60 Days ($) min $1</label>
                  <input type="number" step="0.01" min="1" value={form.price_60day} onChange={e => setForm({...form, price_60day: e.target.value})} />
                </div>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '12px', marginBottom: '4px' }}>Reseller Prices (0 = use customer price)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Reseller 1 Day ($)</label>
                  <input type="number" step="0.01" min="0" value={form.reseller_price_1day} onChange={e => setForm({...form, reseller_price_1day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Reseller 7 Days ($)</label>
                  <input type="number" step="0.01" min="0" value={form.reseller_price_7day} onChange={e => setForm({...form, reseller_price_7day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Reseller 30 Days ($)</label>
                  <input type="number" step="0.01" min="0" value={form.reseller_price_30day} onChange={e => setForm({...form, reseller_price_30day: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Reseller 60 Days ($)</label>
                  <input type="number" step="0.01" min="0" value={form.reseller_price_60day} onChange={e => setForm({...form, reseller_price_60day: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Duration Visibility (uncheck to hide from customers)</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                  {[
                    { key: '1day', label: '1 Day' },
                    { key: '7day', label: '7 Days' },
                    { key: '30day', label: '30 Days' },
                    { key: '60day', label: '60 Days' },
                  ].map(d => (
                    <label key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={!(form.hidden_durations || {})[d.key]}
                        onChange={() => {
                          const hd = { ...(form.hidden_durations || {}) };
                          if (hd[d.key]) delete hd[d.key]; else hd[d.key] = true;
                          setForm({ ...form, hidden_durations: hd });
                        }}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>Custom Day Durations</p>
                  <button type="button" className="btn btn-sm btn-outline" onClick={addCustomDay}>+ Add Day</button>
                </div>
                {customDays.length === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>No custom durations. Add custom day options like 3, 14, 90, 180 days etc.</p>
                )}
                {customDays.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 40px', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Days</label>
                      <input type="number" min="1" value={item.days} onChange={e => updateCustomDay(idx, 'days', parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Price ($)</label>
                      <input type="number" step="0.01" min="0" value={item.price} onChange={e => updateCustomDay(idx, 'price', e.target.value)} />
                    </div>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '11px' }}>Reseller ($)</label>
                      <input type="number" step="0.01" min="0" value={item.reseller_price} onChange={e => updateCustomDay(idx, 'reseller_price', e.target.value)} />
                    </div>
                    <button type="button" className="btn btn-sm btn-danger" style={{ height: '38px' }} onClick={() => removeCustomDay(idx)}>✕</button>
                  </div>
                ))}
              </div>

              <div className="input-group">
                <label>Features (comma separated)</label>
                <input type="text" value={form.features} onChange={e => setForm({...form, features: e.target.value})} placeholder="Feature 1, Feature 2, Feature 3" />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setPanelImages([]); setCustomDays([]); }}>Cancel</button>
              </div>
            </form>

            {editing && (
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '12px' }}>Panel Media (Images & Videos)</h3>

                {panelImages.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {panelImages.map(img => (
                      <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {img.media_type === 'video' ? (
                          <div style={{ position: 'relative' }}>
                            <video src={`/uploads/${img.filename}`} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} muted />
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>VIDEO</span>
                          </div>
                        ) : (
                          <img src={`/uploads/${img.filename}`} alt={img.original_name} style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }} />
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none',
                            borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                          }}
                        >x</button>
                        <div style={{ padding: '4px 6px', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {img.original_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', padding: '24px',
                    textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
                    color: 'var(--text-muted)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                  {uploading ? (
                    <p>Uploading...</p>
                  ) : (
                    <>
                      <p style={{ fontSize: '24px', marginBottom: '8px' }}>+</p>
                      <p>Click to upload images or videos</p>
                      <p style={{ fontSize: '12px' }}>Supports JPG, PNG, WebP, GIF, MP4, WebM, MOV</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
