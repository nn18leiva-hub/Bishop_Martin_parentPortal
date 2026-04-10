import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, User, LifeBuoy, Power, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


const Sidebar = () => {
  const { user, logout } = useAuth();

  const getHomeLink = () => {
    if (user?.role === 'super_admin') return '/superadmin';
    if (user?.type === 'staff') return '/staff';
    return '/dashboard/parents';
  };

  const getRoleLabel = () => {
    if (user?.role === 'super_admin') return 'Super Admin';
    if (user?.type === 'staff') return 'Staff Member';
    if (user?.type === 'past_student') return 'Past Student';
    return 'Parent Account';
  };

  return (
    <aside className="sidebar desktop-view">
      <div style={{ marginBottom: '3rem' }}>
        <Link to={getHomeLink()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', color: '#fff' }}>
          <div style={{ background: 'var(--primary-color)', padding: '8px', borderRadius: '12px', boxShadow: '0 0 15px var(--primary-glow)' }}>
             <FileText size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>Bishop Martin</span>
        </Link>
      </div>

      <nav style={{ flexGrow: 1 }}>
        {/* Parent / Past Student Links */}
        {(user?.type === 'parent' || user?.type === 'past_student') && (
          <>
            <NavLink to="/dashboard/parents" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} strokeWidth={2} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/dashboard/parents/bank-details" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Wallet size={20} strokeWidth={2} />
              <span>Payments</span>
            </NavLink>
          </>
        )}

        {/* Staff Links */}
        {user?.type === 'staff' && user?.role !== 'super_admin' && (
          <NavLink to="/staff" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} strokeWidth={2} />
            <span>Staff Portal</span>
          </NavLink>
        )}

        {/* SuperAdmin Links */}
        {user?.role === 'super_admin' && (
          <NavLink to="/superadmin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} strokeWidth={2} />
            <span>SuperAdmin</span>
          </NavLink>
        )}
        
        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <User size={20} strokeWidth={2} />
          <span>Account Settings</span>
        </NavLink>

        <NavLink to="/help" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LifeBuoy size={20} strokeWidth={2} />
          <span>Help Center</span>
        </NavLink>
      </nav>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', padding: '0 0.75rem' }}>
           <div style={{ width: '42px', height: '42px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-color)' }}>
              {user?.full_name?.charAt(0) || 'U'}
           </div>
           <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{user?.full_name || 'User'}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{getRoleLabel()}</p>
           </div>
        </div>
        
        <button 
          onClick={logout}
          className="sidebar-link" 
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--danger-color)' }}>
          <Power size={20} />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
