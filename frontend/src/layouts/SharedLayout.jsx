import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const SharedLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
     if (!loading) {
       if (!user) navigate('/login');
     }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="app-container items-center justify-center">Loading User Profile...</div>;
  }

  if (!user) return null;

  return (
    <div className="app-container">
      {/* PC Side Sidebar */}
      <Sidebar />

      {/* Mobile-only Header */}
      <header className="mobile-view" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>
          <FileText size={28} color="var(--primary-color)" />
          <span>BMW Connect</span>
        </Link>
      </header>

      <main className="main-content" style={{ maxWidth: '100%' }}>
        <Outlet />
      </main>

      {/* Mobile-only Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default SharedLayout;
