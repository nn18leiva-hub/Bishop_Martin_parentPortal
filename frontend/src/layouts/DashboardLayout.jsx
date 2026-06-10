import React, { useState } from 'react';
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, UploadCloud, FileText, Bell, Settings, GraduationCap, Plus } from 'lucide-react';
import { apiFetch } from '../services/api';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import schoolLogo from '../assets/school_logo_transparent.png';

const DashboardLayout = () => {
  const { user, loading, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [uploadingSsn, setUploadingSsn] = useState(false);
  const [ssnError, setSsnError] = useState('');

  React.useEffect(() => {
    if (!loading) {
      if (!user) navigate('/login');
      if (user?.type === 'staff' || user?.role === 'super_admin' || user?.role === 'principal') {
        navigate(user?.role === 'super_admin' || user?.role === 'principal' ? '/superadmin' : '/staff');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="db-loading-screen">
        <div className="db-loading-spinner"></div>
        <p>Loading your portal...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleSSNUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('ssn_image', file);
    setUploadingSsn(true);
    setSsnError('');
    try {
      await apiFetch('/parent/upload-ssn-card', { method: 'POST', body: formData });
      alert("ID uploaded successfully! Waiting for admin approval.");
      await fetchProfile();
    } catch (err) {
      setSsnError(err.message || 'Upload failed');
    } finally {
      setUploadingSsn(false);
    }
  };

  const isVerified = user.verified || user.ssn_verified;

  return (
    <div className="parent-portal-container" style={{ minHeight: '100vh', background: '#fbfbfb', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- DESKTOP TOP NAVBAR --- */}
      <header className="parent-topbar desktop-view" style={{
        background: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        padding: '0.85rem 3.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Brand */}
        <Link 
          to="/dashboard/parents" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/parents');
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <img src={schoolLogo} alt="Logo" style={{ width: 32, height: 32 }} />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#7a0c2e',
            fontFamily: "Georgia, serif"
          }}>
            Bishop Martin Parent Portal
          </span>
        </Link>

        {/* Menu Links */}
        <nav style={{ display: 'flex', gap: '2.5rem', marginLeft: 'auto', marginRight: 'auto' }}>
          <NavLink to="/dashboard/parents" end className="parent-topbar-link">
            Documents
          </NavLink>
          <NavLink to="/dashboard/parents/records" className="parent-topbar-link">
            Records
          </NavLink>
          <NavLink to="/dashboard/parents/bank-details" className="parent-topbar-link">
            Payments
          </NavLink>
          <NavLink to="/help" className="parent-topbar-link">
            Support
          </NavLink>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#7a0c2e' }}></span>
          </button>
          <button style={{ border: 'none', background: 'none', color: '#666', cursor: 'pointer' }}>
            <Settings size={20} />
          </button>
          <Link to="/dashboard/parents/new" style={{
            background: '#7a0c2e',
            color: '#ffffff',
            padding: '0.55rem 1.1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <Plus size={16} /> New Request
          </Link>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            background: '#7a0c2e', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '0.75rem', 
            fontWeight: 700 
          }}>
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR & HEADER --- */}
      <div className="mobile-view">
        <Sidebar />
        <header className="db-mobile-header">
          <Link to="/dashboard/parents" className="db-mobile-brand">
            <FileText size={22} />
            <span>Bishop Martin</span>
          </Link>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="db-main" style={{ flex: 1, padding: '2.5rem', width: '100%', maxWidth: '1280px', margin: '0 auto', boxSizing: 'border-box' }}>
        {/* Verification Banner */}
        {!isVerified && (
          <div className="db-verify-banner" style={{ marginBottom: '2rem' }}>
            <div className="db-verify-banner-inner">
              <AlertTriangle size={20} className="db-verify-icon" />
              <div>
                <strong>Verification Required</strong>
                <p>Please upload your ID to unlock your dashboard features.</p>
              </div>
            </div>
            <label className="db-verify-upload-btn">
              {uploadingSsn ? 'Uploading...' : <><UploadCloud size={16} /> Upload ID</>}
              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleSSNUpload} disabled={uploadingSsn} />
            </label>
            {ssnError && <p className="db-verify-error">{ssnError}</p>}
          </div>
        )}

        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
