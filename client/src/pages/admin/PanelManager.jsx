import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch, getToken } from '../../api';
import toast from 'react-hot-toast';

export default function AdminPanelManager() {
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', version: '1.0', file_size: '', update_date: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const thumbRef = useRef(null);

  const load = () => {
    apiFetch('/admin/panel-files').then(setFiles).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.title) return toast.error('Title required');
    if (!editing && !fileRef.current?.files?.[0]) return toast.error('File required');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('version', form.version);
      fd.append('file_size', form.file_size);
      fd.append('update_date', form.update_date || new Date().toISOString().split('T')[0]);
      if (fileRef.current?.files?.[0]) fd.append('file', fileRef.current.files[0]);
      if (thumbRef.current?.files?.[0]) fd.append('thumbnail', thumbRef.current.files[0]);
      const token = getToken();
      const url = editing ? `/api/admin/panel-files/${editing.id}` : '/api/admin/panel-files';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(editing ? 'Updated' : 'Panel file uploaded');
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', description: '', version: '1.0', file_size: '', update_date: '' });
      load();
    } catch (err) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this panel file?')) return;
    try {
      await apiFetch(`/admin/panel-files/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({ title: f.title, description: f.description, version: f.version, file_size: f.file_size, update_date: f.update_date });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Panel Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Upload and manage panel files for download</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setForm({ title: '', description: '', version: '1.0', file_size: '', update_date: '' }); setShowModal(true); }}>+ Upload Panel</button>
      </div>

      {files.length === 0 ? (
        <div className="empty-state"><h3>No panel files</h3><p>Upload panel files for users to download</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Thumbnail</th><th>Title</th><th>Version</th><th>Size</th><th>Updated</th><th>File</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id}>
                  <td>
                    {f.thumbnail ? (
                      <img src={`/uploads/${f.thumbnail}`} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                    )}
                  </td>
                  <td style={{ fontWeight: '600' }}>{f.title}</td>
                  <td>{f.version}</td>
                  <td>{f.file_size || '-'}</td>
                  <td style={{ fontSize: '12px' }}>{f.update_date || '-'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.original_filename}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>Delete</button>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>{editing ? 'Edit Panel File' : 'Upload Panel File'}</h2>
            <div className="input-group">
              <label>Title</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Panel name" />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label>Version</label>
                <input type="text" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="1.0" />
              </div>
              <div className="input-group">
                <label>File Size</label>
                <input type="text" value={form.file_size} onChange={e => setForm({ ...form, file_size: e.target.value })} placeholder="e.g. 25 MB" />
              </div>
            </div>
            <div className="input-group">
              <label>Update Date</label>
              <input type="date" value={form.update_date} onChange={e => setForm({ ...form, update_date: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Panel File {editing ? '(leave empty to keep current)' : ''}</label>
              <input ref={fileRef} type="file" style={{ padding: '8px' }} />
            </div>
            <div className="input-group">
              <label>Thumbnail Image {editing ? '(leave empty to keep current)' : '(optional)'}</label>
              <input ref={thumbRef} type="file" accept="image/*" style={{ padding: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
                {uploading ? 'Uploading...' : editing ? 'Update' : 'Upload'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
