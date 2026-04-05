import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, LogOut, FileText, UploadCloud, FilePlus } from 'lucide-react';
import { apiFetch } from '../services/api';

const DashboardLayout = () => {
  const { user, logout, loading, fetchProfile } = useAuth();
  const navigate = useNavigate();
  const [uploadingSsn, setUploadingSsn] = useState(false);
  const [ssnError, setSsnError] = useState('');

  if (loading) {
    return <div className="app-container items-center justify-center">Loading...</div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSSNUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('ssn_card', file);

    setUploadingSsn(true);
    setSsnError('');
    try {
      await apiFetch('/parent/upload-ssn-card', {
        method: 'POST',
        body: formData,
      });
      alert("SSN Uploaded successfully! Waiting for admin approval.");
      await fetchProfile(); // refresh profile to see if status changed or just keep verify state
    } catch (err) {
      setSsnError(err.message || 'Upload failed');
    } finally {
      setUploadingSsn(false);
    }
  };

  const isVerified = user.verified || user.ssn_verified;

  return (
    <div className="app-container">
      <header className="navbar">
        <Link to="/dashboard" className="navbar-brand">
          <FileText size={24} />
          Bishop Martin Portal
        </Link>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: '0.875rem' }}>
            Hello, {user.full_name} ({user.user_type === 'past_student' ? 'Past Student' : 'Parent'})
          </span>
          <button className="btn-secondary" style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-main)' }} onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {!isVerified && (
          <div className="warning-banner">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} />
              <div>
                <strong style={{ display: 'block' }}>Identity Verification Required</strong>
                <span style={{ fontSize: '0.875rem' }}>Your requests are paused. Please upload your ID/SSN card to unlock processing.</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               {ssnError && <span style={{ color: '#fff', fontSize: '0.75rem', marginRight: '8px' }}>{ssnError}</span>}
               <label className="btn-primary" style={{ backgroundColor: '#fff', color: 'var(--warning-color)', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', margin: 0, width: 'auto' }}>
                 {uploadingSsn ? 'Uploading...' : 'Upload ID'}
                 <UploadCloud size={16} />
                 <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleSSNUpload} disabled={uploadingSsn} />
               </label>
            </div>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
