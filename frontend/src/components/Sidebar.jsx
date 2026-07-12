import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ShieldCheck, Users, Archive, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/ThemeLanguageContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderAvatar = (userObject, size = 38) => {
    if (userObject?.avatar_path) {
      const path = userObject.avatar_path.startsWith('/') 
        ? userObject.avatar_path 
        : `/${userObject.avatar_path}`;
      return (
        <img 
          src={path} 
          alt={userObject.full_name || 'User'} 
          style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      );
    }

    const name = userObject?.full_name || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#7a0c2e', '#4f46e5', '#2563eb', '#0284c7', '#0891b2', '#0d9488',
      '#059669', '#16a34a', '#ca8a04', '#d97706', '#dc2626', '#db2777'
    ];
    const bgColor = colors[Math.abs(hash) % colors.length];

    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.85rem',
        fontFamily: "'Inter', sans-serif"
      }}>
        {initials}
      </div>
    );
  };

  // Check if we should render the Parent Portal sidebar or the Admin/Staff sidebar
  const isParent = user 
    ? (user.type === 'parent' || user.type === 'past_student') 
    : window.location.pathname.startsWith('/dashboard/parents');

  // Dynamic active link styling for the Parent Portal sidebar matching mockup
  const getParentLinkStyle = ({ isActive }) => isActive ? {
    backgroundColor: '#f5f5f3',
    color: '#7a0c2e',
    borderRight: '4px solid #7a0c2e',
    borderRadius: '6px 0 0 6px',
    fontWeight: 700
  } : {};

  const getParentLinkClass = ({ isActive }) => `db-sidebar-link ${isActive ? 'active-parent' : ''}`;

  if (isParent) {
    const parentName = user?.full_name || 'James Wilson';
    const parentId = user?.id || user?.parent_id || '20442';

    return (
      <aside className="db-sidebar desktop-view" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        justifyContent: 'space-between', 
        padding: '1.75rem 1.25rem',
        boxSizing: 'border-box'
      }}>
        <div>
          {/* Brand Header */}
          <div className="db-sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: 'none', paddingBottom: '0rem', marginBottom: '2.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#7a0c2e',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#ffffff' }}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7a0c2e', fontFamily: "Georgia, serif", lineHeight: 1.1 }}>
                Bishop Martin
              </div>
              <div style={{ fontSize: '0.8rem', color: '#888888', fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '2px' }}>
                {t('parent_dashboard')}
              </div>
            </div>
          </div>

          {/* New Request Button */}
          <div className="db-sidebar-new-btn-wrap" style={{ marginBottom: '1.25rem' }}>
            <Link to="/dashboard/parents/new" className="db-sidebar-new-btn" style={{ 
              background: '#7a0c2e', 
              color: '#ffffff', 
              padding: '0.65rem 1rem', 
              borderRadius: '6px', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif"
            }}>
              <span>{t('new_request')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>+</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="db-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavLink to="/dashboard/parents" end className={getParentLinkClass} style={getParentLinkStyle}>
              <LayoutDashboard size={18} />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink to="/dashboard/parents/bank-details" className={getParentLinkClass} style={getParentLinkStyle}>
              <FileText size={18} />
              <span>{t('requests')}</span>
            </NavLink>

            <NavLink to="/dashboard/parents/verification" className={getParentLinkClass} style={getParentLinkStyle}>
              <ShieldCheck size={18} />
              <span>{t('verification')}</span>
            </NavLink>

            <NavLink to="/dashboard/parents/users" className={getParentLinkClass} style={getParentLinkStyle}>
              <Users size={18} />
              <span>{t('user_management')}</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="db-sidebar-footer" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '4px',
          borderTop: 'none', 
          paddingTop: '0.75rem', 
          marginTop: 'auto' 
        }}>
          {/* Help Center Option */}
          <NavLink to="/help" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active-parent' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', textDecoration: 'none', padding: '0.5rem 0.75rem', width: '100%', boxSizing: 'border-box' }}>
            <HelpCircle size={18} />
            <span>{t('help_center')}</span>
          </NavLink>

          {/* Sign Out Button */}
          <button 
            className="db-sidebar-link db-sidebar-signout" 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.75rem', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}
          >
            <LogOut size={18} />
            <span>{t('sign_out')}</span>
          </button>

          {/* User Profile Card */}
          <Link to="/profile" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            padding: '1rem 0.75rem 0 0.75rem', 
            marginTop: '0.75rem', 
            borderTop: '1px solid #f0f0f0',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer'
          }}>
            <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
              {renderAvatar(user, 38)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222222', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                {parentName}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>
                PARENT ID: {parentId}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    );
  }

  // Admin / Staff Sidebar
  const isAdmin = user?.role === 'super_admin' || user?.role === 'principal';
  const adminPrefix = isAdmin ? '/superadmin' : '/staff';

  const staffName = user?.full_name || 'J. Smith';
  const staffRole = user?.role === 'principal' 
    ? 'Principal' 
    : user?.role === 'super_admin' 
      ? 'System Admin' 
      : 'Administrator';

  return (
    <aside className="db-sidebar desktop-view" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      justifyContent: 'space-between', 
      padding: '1.75rem 1.25rem',
      boxSizing: 'border-box'
    }}>
      
      <div>
        {/* Brand Header */}
        <div className="db-sidebar-brand" style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: 'none', paddingBottom: '0rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7a0c2e', fontFamily: "Georgia, serif" }}>
            Admin Portal
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <div style={{ width: '2px', height: '14px', backgroundColor: '#d4af37' }}></div>
            <div style={{ fontSize: '0.8rem', color: '#888888', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              Staff Management
            </div>
          </div>
        </div>

        {/* New Entry Button — only for Parent / Guardian accounts */}
        {isParent && (
          <div className="db-sidebar-new-btn-wrap" style={{ marginBottom: '1.25rem' }}>
            <Link to="/dashboard/parents/new" className="db-sidebar-new-btn" style={{ 
              background: '#5c0922', 
              color: '#ffffff', 
              padding: '0.65rem 1rem', 
              borderRadius: '6px', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif"
            }}>
              <span>{t('new_entry')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>+</span>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="db-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to={adminPrefix} end className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>{t('dashboard')}</span>
          </NavLink>

          <NavLink to={`${adminPrefix}/requests`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} />
            <span>{t('all_documents')}</span>
          </NavLink>

          <NavLink to={`${adminPrefix}/approval`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={18} />
            <span>{t('approval_queue')}</span>
          </NavLink>

          <NavLink to={`${adminPrefix}/staff-directory`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>{t('staff_directory')}</span>
          </NavLink>

          <NavLink to={`${adminPrefix}/archive`} className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`}>
            <Archive size={18} />
            <span>{t('archive')}</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="db-sidebar-footer" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px',
        borderTop: 'none', 
        paddingTop: '0.75rem', 
        marginTop: 'auto' 
      }}>
        {/* Help Center Option */}
        <NavLink to="/help" className={({ isActive }) => `db-sidebar-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', textDecoration: 'none', padding: '0.5rem 0.75rem', width: '100%', boxSizing: 'border-box' }}>
          <HelpCircle size={18} />
          <span>{t('help_center')}</span>
        </NavLink>

        {/* Sign Out Button */}
        <button 
          className="db-sidebar-link db-sidebar-signout" 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#555555', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.75rem', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}
        >
          <LogOut size={18} />
          <span>{t('sign_out')}</span>
        </button>

        {/* User Profile Card */}
        <Link to="/profile" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '1rem 0.75rem 0 0.75rem', 
          marginTop: '0.75rem', 
          borderTop: '1px solid #f0f0f0',
          textDecoration: 'none',
          color: 'inherit',
          cursor: 'pointer'
        }}>
          <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
            {renderAvatar(user, 38)}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '10px',
              height: '10px',
              backgroundColor: '#4caf50',
              border: '2px solid #ffffff',
              borderRadius: '50%'
            }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#222222', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
              {staffName}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Inter', sans-serif" }}>
              {staffRole}
            </span>
          </div>
        </Link>
      </div>

    </aside>
  );
};

export default Sidebar;
