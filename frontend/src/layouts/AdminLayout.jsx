import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Search, Settings } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
     if (!loading) {
       if (!user) navigate('/login');
       if (user?.type === 'parent' || user?.type === 'past_student') {
         navigate('/dashboard/parents');
       }
     }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="db-loading-screen">
        <div className="db-loading-spinner"></div>
        <p>Authenticating...</p>
      </div>
    );
  }

  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/$/, '');
  const hasLocalHeader = [
    '/superadmin/settings',
    '/staff/settings',
    '/superadmin/requests',
    '/staff/requests',
    '/staff'
  ].includes(normalizedPath);

  if (!user) return null;

  return (
    <div className="db-app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="db-main">
        {/* Top Header Bar */}
        {!hasLocalHeader && (
          <header className="adm-topbar" style={{ background: 'transparent', borderBottom: 'none', padding: '1.5rem 2.5rem 0.5rem 2.5rem', height: 'auto' }}>
            <div className="adm-topbar-title" style={{ visibility: 'hidden' }}>Bishop Martin Parent Portal</div>
            <div className="adm-topbar-actions" style={{ marginLeft: 'auto', gap: '1rem' }}>
              <div className="adm-topbar-search" style={{ background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '20px', padding: '0.4rem 1rem' }}>
                <Search size={15} color="#888" />
                <input type="text" placeholder="Search records..." style={{ fontFamily: "'Outfit', sans-serif" }} />
              </div>
              <button className="adm-topbar-icon-btn" aria-label="Notifications" style={{ border: 'none', background: 'none', color: '#666', position: 'relative', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={20} />
                <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#7a0c2e' }}></span>
              </button>
              <button className="adm-topbar-icon-btn" aria-label="Settings" style={{ border: 'none', background: 'none', color: '#666', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} />
              </button>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="db-content">
          <Outlet />
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
};

export default AdminLayout;
