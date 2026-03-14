import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function PanelsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/store/panel-files').then(setFiles).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}><div className="empty-state"><h3>Loading...</h3></div></div>;

  return (
    <div className="container fade-in" style={{ padding: '40px 20px' }}>
      <h1 className="page-title">Panels</h1>
      <p className="page-subtitle">Download available panel files</p>

      {files.length === 0 ? (
        <div className="empty-state"><h3>No panels available</h3><p>Check back later for new panel files</p></div>
      ) : (
        <div className="grid-3">
          {files.map(f => (
            <div key={f.id} className="card" style={{ overflow: 'hidden' }}>
              {f.thumbnail ? (
                <img src={`/uploads/${f.thumbnail}`} alt={f.title} style={{ height: '180px', objectFit: 'cover', borderRadius: '12px 12px 0 0', margin: '-20px -20px 12px', width: 'calc(100% + 40px)' }} />
              ) : (
                <div style={{ width: 'calc(100% + 40px)', height: '120px', background: 'linear-gradient(135deg, var(--accent-dark), var(--bg-input))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', borderRadius: '12px 12px 0 0', margin: '-20px -20px 12px' }}>📦</div>
              )}
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{f.title}</h3>
              {f.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.5' }}>{f.description}</p>}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {f.version && <span>v{f.version}</span>}
                {f.file_size && <span>{f.file_size}</span>}
                {f.update_date && <span>{f.update_date}</span>}
              </div>
              <a
                href={`/api/store/panel-files/${f.id}/download`}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
