import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiLayers, FiPackage, FiShoppingBag, FiTag, FiSettings, FiUsers, FiCreditCard, FiShield, FiKey, FiUploadCloud } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const links = [
    { path: '/admin', label: 'Dashboard', icon: <FiGrid />, visible: true },
    { path: '/admin/sections', label: 'Sections', icon: <FiLayers />, visible: true },
    { path: '/admin/panels', label: 'Panels', icon: <FiPackage />, visible: true },
    { path: '/admin/orders', label: 'Orders', icon: <FiShoppingBag />, visible: user?.role === 'main_admin' || user?.permissions?.view_payments },
    { path: '/admin/promos', label: 'Promo Codes', icon: <FiTag />, visible: true },
    { path: '/admin/users', label: 'Users', icon: <FiUsers />, visible: user?.role === 'main_admin' || user?.permissions?.manage_users },
    { path: '/admin/resellers', label: 'Resellers', icon: <FiUsers />, visible: user?.role === 'main_admin' || user?.permissions?.manage_resellers },
    { path: '/admin/reseller-orders', label: 'Reseller Orders', icon: <FiShoppingBag />, visible: user?.role === 'main_admin' || user?.permissions?.manage_resellers },
    { path: '/admin/reseller-keys', label: 'Reseller Keys', icon: <FiPackage />, visible: user?.role === 'main_admin' || user?.permissions?.manage_resellers },
    { path: '/admin/customer-keys', label: 'Customer Keys', icon: <FiKey />, visible: true },
    { path: '/admin/panel-manager', label: 'Panel Manager', icon: <FiUploadCloud />, visible: true },
    { path: '/admin/payments', label: 'Payments', icon: <FiCreditCard />, visible: user?.role === 'main_admin' || user?.permissions?.view_payments },
    { path: '/admin/settings', label: 'Settings', icon: <FiSettings />, visible: user?.role === 'main_admin' || user?.permissions?.manage_settings },
    { path: '/admin/management', label: 'Admin Management', icon: <FiShield />, visible: user?.role === 'main_admin' },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        {links.filter(l => l.visible).map(l => (
          <Link key={l.path} to={l.path} className={location.pathname === l.path ? 'active' : ''}>
            {l.icon} {l.label}
          </Link>
        ))}
      </div>
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
