import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, ShieldCheck, User, Camera } from 'lucide-react';
import { apiFetch } from '../services/api';

const Profile = () => {
  const { user, fetchProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // States for Avatar Upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');
    if (newPassword !== confirmPassword) return setPwError('New passwords do not match.');
    if (newPassword.length < 6) return setPwError('New password must be at least 6 characters.');

    setPwLoading(true);
    try {
      const res = await apiFetch('/auth/change-profile-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      setPwMessage(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('File is too large. Max size is 2MB.');
      setAvatarSuccess('');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    setAvatarError('');
    setAvatarSuccess('');

    try {
      const res = await apiFetch('/auth/upload-avatar', {
        method: 'POST',
        body: formData
      });
      setAvatarSuccess(res.message || 'Profile picture updated successfully!');
      await fetchProfile();
    } catch (err) {
      setAvatarError(err.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const renderAvatar = (userObject, size = 120) => {
    if (userObject?.avatar_path) {
      const path = userObject.avatar_path.startsWith('/') 
        ? userObject.avatar_path 
        : `/${userObject.avatar_path}`;
      return (
        <img 
          src={path} 
          alt={userObject.full_name || 'User'} 
          style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover', border: '2px solid #7a0c2e' }}
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
        fontSize: size > 60 ? '2.5rem' : '1rem',
        fontFamily: "'Outfit', sans-serif",
        border: '2px solid #eaeaea'
      }}>
        {initials}
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="animate-up" style={{ padding: '1rem 0' }}>
      <div className="flex flex-responsive justify-between items-start mb-6 gap-2">
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#2c2c2c', fontFamily: "'Outfit', sans-serif" }}>Account Settings</h2>
          <p style={{ color: '#666666', fontSize: '0.9rem' }}>Manage your personal profile and security boundaries.</p>
        </div>
      </div>
 
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Details Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Profile Picture Upload Block */}
            <div className="mock-card" style={{ borderTop: '4px solid #7a0c2e', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <h3 className="mb-4 flex items-center gap-2" style={{ color: '#7a0c2e', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', alignSelf: 'flex-start' }}>
                   <Camera size={20} /> Profile Picture
                </h3>
                
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '1rem auto' }}>
                  {renderAvatar(user, 120)}
                  
                  <label style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#7a0c2e',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    transition: 'all 0.2s'
                  }} title="Upload Photo">
                    <Upload size={16} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      style={{ display: 'none' }} 
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                {uploadingAvatar && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>Uploading picture...</p>}
                {avatarError && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '8px' }}>{avatarError}</p>}
                {avatarSuccess && <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '8px' }}>{avatarSuccess}</p>}
                
                <p style={{ color: '#888888', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  Supported formats: JPG, PNG. Max size: 2MB.
                </p>
            </div>

            {/* Personal Info Details Block */}
            <div className="mock-card" style={{ borderTop: '4px solid #3b82f6', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem' }}>
                <h3 className="mb-4 flex items-center gap-2" style={{ color: '#2563eb', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0' }}><User size={20} /> Personal Identification</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Full Legal Name</p>
                    <p style={{ fontSize: '1.1rem', color: '#2c2c2c', fontWeight: 600 }}>{user.full_name || 'N/A'}</p>
                </div>
 
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>Registered Email</p>
                    <p style={{ fontSize: '1.1rem', color: '#2c2c2c', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={16} color="#7a0c2e" /> {user.email || 'N/A'}
                    </p>
                </div>
 
                <div>
                    <p style={{ fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Access Node Clearance</p>
                    <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {(user.role || user.type || 'Standard').toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
 
        {/* Password Change Block */}
        <div className="mock-card" style={{ borderTop: '4px solid #f59e0b', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem', alignSelf: 'start' }}>
            <h3 style={{ color: '#d97706', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} /> Change Password
            </h3>

            {pwError && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', marginBottom: '1rem' }}>{pwError}</div>}
            {pwMessage && <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', padding: '10px 14px', fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} /> {pwMessage}
            </div>}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Enter your current password"
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="At least 6 characters"
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={pwLoading}
                    style={{ background: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '0.65rem 1rem', fontWeight: 700, fontSize: '0.9rem', cursor: pwLoading ? 'wait' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}
                >
                    {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
