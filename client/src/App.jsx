import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ParticleCanvas from './components/ParticleCanvas'
import AnnouncementBanner from './components/AnnouncementBanner'
import SplashScreen from './components/SplashScreen'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Store from './pages/Store'
import PanelDetail from './pages/PanelDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import AdminDashboard from './pages/admin/Dashboard'
import AdminSections from './pages/admin/Sections'
import AdminPanels from './pages/admin/Panels'
import AdminOrders from './pages/admin/Orders'
import AdminPromos from './pages/admin/Promos'
import AdminSettings from './pages/admin/Settings'
import AdminUsers from './pages/admin/Users'
import AdminPaymentOptions from './pages/admin/PaymentOptions'
import AdminResellers from './pages/admin/Resellers'
import AdminResellerOrders from './pages/admin/ResellerOrders'
import AdminResellerKeyPool from './pages/admin/ResellerKeyPool'
import AdminCustomerKeyPool from './pages/admin/CustomerKeyPool'
import AdminPanelManager from './pages/admin/PanelManager'
import AdminManagement from './pages/admin/AdminManagement'
import PanelsPage from './pages/PanelsPage'
import ResellerLogin from './pages/ResellerLogin'
import ResellerDashboard from './pages/ResellerDashboard'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty-state"><h3>Loading...</h3></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children, permission }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="empty-state"><h3>Loading...</h3></div>;
  if (!user || !user.is_admin) return <Navigate to="/" />;
  
  if (permission && user.role !== 'main_admin' && !user.permissions?.[permission]) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h1 style={{ fontSize: '48px' }}>🚫</h1>
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
  
  if (location.pathname === '/admin/management' && user.role !== 'main_admin') {
    return <Navigate to="/admin" />;
  }

  return children;
}

function App() {
  const showSplash = !sessionStorage.getItem('ff_splash_done');
  const [splashDone, setSplashDone] = useState(!showSplash);
  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem('ff_splash_done', '1');
    setSplashDone(true);
  }, []);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <ParticleCanvas />
      <AnnouncementBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/store" element={<Store />} />
        <Route path="/panel/:id" element={<PanelDetail />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/sections" element={<AdminRoute><AdminSections /></AdminRoute>} />
        <Route path="/admin/panels" element={<AdminRoute><AdminPanels /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute permission="view_payments"><AdminOrders /></AdminRoute>} />
        <Route path="/admin/promos" element={<AdminRoute><AdminPromos /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute permission="manage_settings"><AdminSettings /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute permission="manage_users"><AdminUsers /></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute permission="view_payments"><AdminPaymentOptions /></AdminRoute>} />
        <Route path="/admin/resellers" element={<AdminRoute permission="manage_resellers"><AdminResellers /></AdminRoute>} />
        <Route path="/admin/reseller-orders" element={<AdminRoute permission="manage_resellers"><AdminResellerOrders /></AdminRoute>} />
        <Route path="/admin/reseller-keys" element={<AdminRoute permission="manage_resellers"><AdminResellerKeyPool /></AdminRoute>} />
        <Route path="/admin/customer-keys" element={<AdminRoute><AdminCustomerKeyPool /></AdminRoute>} />
        <Route path="/admin/panel-manager" element={<AdminRoute><AdminPanelManager /></AdminRoute>} />
        <Route path="/admin/management" element={<AdminRoute><AdminManagement /></AdminRoute>} />
        <Route path="/panels" element={<PanelsPage />} />
        <Route path="/reseller-login" element={<ResellerLogin />} />
        <Route path="/reseller" element={<ResellerDashboard />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App
