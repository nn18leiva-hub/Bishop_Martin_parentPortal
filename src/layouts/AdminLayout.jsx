import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, LogOut, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
     if (!loading) {
       if (!user) navigate('/login');
       // Redirect parents if they accidentally land here
       if (user?.type === 'parent' || user?.type === 'past_student') {
         navigate('/dashboard/parents');
       }
     }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="app-container items-center justify-center">Authenticating Admin Node...</div>;
  }

  if (!user) return null;

  const getHeaderLink = () => {
    return user.role === 'super_admin' ? '/superadmin' : '/staff';
  };

  return (
    <div className="app-container">
      {/* PC Side Sidebar */}
      <Sidebar />

      {/* Mobile-only Header */}
      <header className="mobile-view" style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center' }}>
        <Link to={getHeaderLink()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>
          <ShieldAlert size={28} color="#8b5cf6" />
          <span style={{ letterSpacing: '1px' }}>ADMIN CONSOLE</span>
        </Link>
      </header>

      <main className="main-content" style={{ maxWidth: '100%' }}>
        {/* No verification banners here - this is purely administrative */}
        <Outlet />
      </main>

      {/* Mobile-only Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default AdminLayout;
