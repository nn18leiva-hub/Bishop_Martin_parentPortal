import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, UploadCloud, FileText } from 'lucide-react';
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
      if (user?.type === 'staff' || user?.role === 'super_admin') {
        navigate(user?.role === 'super_admin' ? '/superadmin' : '/staff');
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
    <div className="db-app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <header className="db-mobile-header mobile-view">
        <Link to="/dashboard/parents" className="db-mobile-brand">
          <FileText size={22} />
          <span>Bishop Martin</span>
        </Link>
      </header>

      {/* Main */}
      <main className="db-main">
        {/* Verification Banner */}
        {!isVerified && (
          <div className="db-verify-banner">
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
