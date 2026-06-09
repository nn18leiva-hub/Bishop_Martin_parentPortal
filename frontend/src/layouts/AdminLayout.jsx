import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Search } from 'lucide-react';
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

  if (!user) return null;

  return (
    <div className="db-app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="db-main">
        {/* Top Header Bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-title">Bishop Martin Parent Portal</div>
          <div className="adm-topbar-actions">
            <div className="adm-topbar-search">
              <Search size={15} color="#aaa" />
              <input type="text" placeholder="Search records..." />
            </div>
            <button className="adm-topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="adm-topbar-avatar">
              {user?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('') || 'U'}
            </div>
          </div>
        </header>

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
