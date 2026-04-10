import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Power, User, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
  const { user, logout } = useAuth();

  const getHomeLink = () => {
    if (user?.role === 'super_admin') return '/superadmin';
    if (user?.type === 'staff') return '/staff';
    return '/dashboard/parents';
  };

  return (
    <nav className="bottom-nav mobile-view">
      <NavLink to={getHomeLink()} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={22} />
        <span>{user?.type === 'staff' || user?.role === 'super_admin' ? 'Portal' : 'Home'}</span>
      </NavLink>

      {(user?.type === 'parent' || user?.type === 'past_student') && (
        <NavLink to="/dashboard/parents/bank-details" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={22} />
          <span>Pay</span>
        </NavLink>
      )}

      <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Me</span>
      </NavLink>

      <NavLink to="/help" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <LifeBuoy size={22} />
        <span>Help</span>
      </NavLink>

      <button onClick={logout} className="nav-item" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
        <Power size={22} color="var(--danger-color)" />
        <span style={{ color: 'var(--danger-color)' }}>Exit</span>
      </button>
    </nav>
  );
};

export default MobileNav;
