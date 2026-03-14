import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiFetch('/admin/users').then(setUsers).catch(() => {});
  }, []);

  return (
    <AdminLayout>
      <h1 className="page-title">Users</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Registered customers</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Username</th><th>Email</th><th>Telegram</th><th>Role</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td style={{ fontWeight: '600' }}>{u.username}</td>
                <td>{u.email}</td>
                <td style={{ color: 'var(--info)' }}>{u.telegram_username || '-'}</td>
                <td>
                  <span className={`badge ${u.is_admin ? 'badge-warning' : 'badge-info'}`}>
                    {u.is_admin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td style={{ fontSize: '13px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
