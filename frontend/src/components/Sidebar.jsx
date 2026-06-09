import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ShieldCheck, Users, Settings, LifeBuoy, LogOut, FilePlus, BarChart2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import schoolLogo from '../assets/school_logo_transparent.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.type === 'staff';
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomeLink = () => {
    if (isSuperAdmin) return '/superadmin';
    if (isAdmin) return '/staff';
    return '/dashboard/parents';
  };

  const getRoleLabel = () => {
    if (user?.role === 'super_admin') return 'System Administrator';
    if (user?.role === 'admin') return 'Office Admin';
    if (user?.role === 'viewer') return 'Principal Viewer';
    if (user?.type === 'past_student') return 'Past Student';
    return 'Parent Account';
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'U';

  const adminBase = isSuperAdmin ? '/superadmin' : '/staff';

  return (
    <aside className="db-sidebar desktop-view">

      {/* Brand Header */}
      <div className="db-sidebar-brand">
        <Link to={getHomeLink()} className="db-sidebar-brand-link">
          <img src={schoolLogo} alt="Bishop Martin" className="db-sidebar-logo" />
          <div>
            <div className="db-sidebar-brand-name">Bishop Martin</div>
            <div className="db-sidebar-brand-sub">Parent Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="db-sidebar-nav">

        {isAdmin ? (
          /* --- ADMIN NAV LINKS --- */
          <>
            <NavLink to={adminBase} end className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            {isSuperAdmin && (
              <NavLink to={`${adminBase}`} end className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'none' }}>
                {/* Oversight is the index for superadmin */}
              </NavLink>
            )}

            <NavLink to={`${adminBase}/requests`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>Requests</span>
            </NavLink>

            <NavLink to={`${adminBase}/verification`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Verification</span>
            </NavLink>

            <NavLink to={`${adminBase}/users`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>User Directory</span>
            </NavLink>

            {isSuperAdmin && (
              <NavLink to={`${adminBase}/settings`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
                <Settings size={18} />
                <span>System Settings</span>
              </NavLink>
            )}
          </>

        ) : (
          /* --- PARENT/STUDENT NAV LINKS --- */
          <>
            <div className="db-sidebar-new-btn-wrap">
              <Link to="/dashboard/parents/new" className="db-sidebar-new-btn">
                <FilePlus size={16} />
                New Entry
              </Link>
            </div>

            <NavLink to="/dashboard/parents" end className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/dashboard/parents/documents" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              <span>All Documents</span>
            </NavLink>

            <NavLink to="/dashboard/parents/approval" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} />
              <span>Approval Queue</span>
            </NavLink>

            <NavLink to="/dashboard/parents/staff-directory" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Staff Directory</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="db-sidebar-footer">
        <NavLink to="/help" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
          <LifeBuoy size={18} />
          <span>Help Center</span>
        </NavLink>

        <button className="db-sidebar-link db-sidebar-signout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        {/* User Info */}
        <div className="db-sidebar-user">
          <div className="db-sidebar-avatar">{initials}</div>
          <div>
            <div className="db-sidebar-username">{user?.full_name || 'User'}</div>
            <div className="db-sidebar-userrole">{getRoleLabel()}</div>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
