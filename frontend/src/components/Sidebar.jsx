import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ShieldCheck, Users, Settings, LifeBuoy, LogOut, FilePlus, GraduationCap, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import schoolLogo from '../assets/school_logo_transparent.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = React.useState(false);

  const isAdmin = user?.type === 'staff';
  const isSuperAdmin = user?.role === 'principal' || user?.role === 'super_admin';

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
    if (isSuperAdmin) return 'Principal';
    if (user?.role === 'staff' || user?.role === 'admin') return 'Staff Member';
    if (user?.type === 'past_student') return 'Past Student';
    return 'Parent Account';
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const adminBase = isSuperAdmin ? '/superadmin' : '/staff';

  return (
    <aside className="db-sidebar desktop-view" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between', padding: '1.75rem 1.25rem' }}>
      
      <div>
        {/* Brand Header */}
        <div className="db-sidebar-brand" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: 'none', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            backgroundColor: '#7a0c2e',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <GraduationCap size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7a0c2e', fontFamily: "'Outfit', sans-serif" }}>Admin Portal</div>
            <div style={{ fontSize: '0.75rem', color: '#888888', fontWeight: 500, fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>Academic Year 2024-25</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="db-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {isAdmin ? (
            /* --- ADMIN / STAFF NAV LINKS --- */
            <>
              <NavLink to={adminBase} end className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to={`${adminBase}/settings`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Staff Registry</span>
              </NavLink>

              <NavLink to={`${adminBase}/users`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                <span>Public Users</span>
              </NavLink>

              <NavLink to={`${adminBase}/verification`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
                <Settings size={18} />
                <span>Provisioning</span>
              </NavLink>
            </>
          ) : (
            /* --- PARENT/STUDENT NAV LINKS --- */
            <>
              <div className="db-sidebar-new-btn-wrap" style={{ marginBottom: '1.25rem' }}>
                <Link to="/dashboard/parents/new" className="db-sidebar-new-btn" style={{ background: '#7a0c2e', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
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

        {/* Generate Report Button (Visible on Admin Portals) */}
        {isAdmin && (
          <button style={{
            background: '#7a0c2e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.65rem 1rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center',
            marginTop: '1.5rem',
            fontFamily: "'Outfit', sans-serif"
          }} onClick={() => alert('Generating system report...')}>
            Generate Report
          </button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="db-sidebar-footer" style={{ paddingTop: '1rem', marginTop: 'auto' }}>
        {/* Support Option */}
        <NavLink to="/help" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', textDecoration: 'none', padding: '0.6rem 0.75rem', width: '100%' }}>
          <HelpCircle size={18} />
          <span>Support</span>
        </NavLink>

        {/* Sign Out Button */}
        <button 
          className="db-sidebar-link db-sidebar-signout" 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 0.75rem', width: '100%', textAlign: 'left' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
