import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, LogOut, FileText, UploadCloud, FilePlus } from 'lucide-react';
import { apiFetch } from '../services/api';

import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const DashboardLayout = () => {
  const { user, loading, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [uploadingSsn, setUploadingSsn] = useState(false);
  const [ssnError, setSsnError] = useState('');

  React.useEffect(() => {
     if (!loading) {
       if (!user) navigate('/login');
       // Redirect staff if they land here
       if (user?.type === 'staff' || user?.role === 'super_admin') {
         navigate(user?.role === 'super_admin' ? '/superadmin' : '/staff');
       }
     }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="app-container items-center justify-center">Loading Data...</div>;
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
      await apiFetch('/parent/upload-ssn-card', {
        method: 'POST',
        body: formData,
      });
      alert("SSN Uploaded successfully! Waiting for admin approval.");
      await fetchProfile();
    } catch (err) {
      setSsnError(err.message || 'Upload failed');
    } finally {
      setUploadingSsn(false);
    }
  };

  const isVerified = user.verified || user.ssn_verified;
  
  return (
    <div className="app-container">
      {/* PC Side Sidebar */}
      <Sidebar />

      {/* Mobile-only Header */}
      <header className="mobile-view" style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center' }}>
        <Link to="/dashboard/parents" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>
          <FileText size={28} color="var(--primary-color)" />
          <span>BMP V2</span>
        </Link>
      </header>

      <main className="main-content">
        {!isVerified && (
          <div className="glass-panel" style={{ border: '1px solid var(--warning-border)', background: 'var(--warning-bg)' }}>
             <div className="flex items-center gap-4 mb-4">
                <AlertTriangle size={32} color="var(--warning-color)" />
                <div>
                   <h3 style={{ color: '#fff' }}>Verification Required</h3>
                   <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Please upload your ID to unlock your dashboard.</p>
                </div>
             </div>
             
             <div style={{ maxWidth: '400px' }}>
                <label className="btn-primary" style={{ background: '#fff', color: '#000' }}>
                  {uploadingSsn ? 'Uploading...' : 'Upload ID Map'}
                  <UploadCloud size={20} />
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleSSNUpload} disabled={uploadingSsn} />
                </label>
                {ssnError && <p className="error-text mt-2">{ssnError}</p>}
             </div>
          </div>
        )}

        <Outlet />
      </main>

      {/* Mobile-only Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default DashboardLayout;
