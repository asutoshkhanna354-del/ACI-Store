import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_orders: 0, pending_orders: 0, total_revenue: 0 });

  useEffect(() => {
    apiFetch('/admin/stats').then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: '👥', color: '#3b82f6', link: '/admin/users' },
    { label: 'Total Orders', value: stats.total_orders, icon: '📦', color: '#f97316', link: '/admin/orders' },
    { label: 'Pending Verification', value: stats.pending_orders, icon: '⏳', color: '#f59e0b', link: '/admin/orders' },
    { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, icon: '💰', color: '#22c55e', link: '/admin/orders' },
  ];

  return (
    <AdminLayout>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Overview of your store</p>
      <div className="grid-2">
        {cards.map(c => (
          <Link to={c.link} key={c.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '40px' }}>{c.icon}</div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{c.label}</p>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: c.color }}>{c.value}</h2>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-3">
        <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/panels" className="btn btn-primary">Manage Panels</Link>
          <Link to="/admin/sections" className="btn btn-outline">Manage Sections</Link>
          <Link to="/admin/orders" className="btn btn-outline">View Orders</Link>
          <Link to="/admin/promos" className="btn btn-outline">Promo Codes</Link>
          <Link to="/admin/settings" className="btn btn-outline">Store Settings</Link>
        </div>
      </div>
    </AdminLayout>
  );
}
