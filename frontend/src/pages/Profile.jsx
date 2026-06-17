import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, ShieldCheck, User, Camera, Upload } from 'lucide-react';
import { apiFetch } from '../services/api';

const Profile = () => {
  const { user, fetchProfile } = useAuth();
  
  // States: 'idle', 'requesting', 'awaiting_code', 'verifying', 'success'
  const [stage, setStage] = useState('idle');
  
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // States for Avatar Upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');

  const handleRequestCode = async () => {
    setError('');
    setMessage('');
    setStage('requesting');
    try {
      const res = await apiFetch('/auth/request-profile-code', { method: 'POST' });
      setMessage(res.message || 'Verification code dispatched to your email.');
      setStage('awaiting_code');
    } catch (err) {
      setError(err.message || 'Failed to request code.');
      setStage('idle');
    }
  };

  const handleVerifyAndChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (code.length !== 6) return setError('Verification code must be exactly 6 digits.');

    setError('');
    setStage('verifying');
    try {
      const res = await apiFetch('/auth/change-profile-password', {
        method: 'POST',
        body: JSON.stringify({ code, newPassword })
      });
      setMessage(res.message || 'Password updated successfully!');
      setStage('success');
      setCode('');
      setNewPassword('');
    } catch (err) {
      setError(err.message || 'Failed to change password. Code may be invalid or expired.');
      setStage('awaiting_code');
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
 
        {/* Password Security Block */}
        <div className="mock-card" style={{ borderTop: '4px solid #f59e0b', background: '#ffffff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '1.5rem', alignSelf: 'start' }}>
            <h3 className="mb-4 flex items-center gap-2" style={{ color: '#d97706', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0' }}><KeyRound size={20} /> Data Authorization Key</h3>
            <p style={{ color: '#555555', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                For your security, resetting your portal password requires email verification. We will send a secure 6-digit pin to your registered inbox to authorize this change.
            </p>
 
            {error && <div className="error-text mb-4 p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
            {message && <div className="mb-4 p-3" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.9rem' }}>{message}</div>}
 
            {stage === 'idle' && (
                <button 
                  onClick={handleRequestCode} 
                  className="btn-primary" 
                  style={{ background: '#f59e0b', borderColor: '#d97706', color: '#ffffff', fontWeight: 700, width: 'auto', padding: '0.6rem 1.2rem', cursor: 'pointer', border: 'none', borderRadius: '6px' }}>
                    Request Verification Pin
                </button>
            )}
 
            {stage === 'requesting' && (
                <button className="btn-primary" disabled style={{ width: 'auto', background: 'rgba(245, 158, 11, 0.5)', color: '#ffffff', cursor: 'wait', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '6px' }}>
                    Authenticating Node...
                </button>
            )}
 
            {(stage === 'awaiting_code' || stage === 'verifying') && (
                <form onSubmit={handleVerifyAndChange} className="animate-up" style={{ padding: '1.25rem', background: '#faf9f6', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                    <div className="form-group mb-4" style={{ marginBottom: '1rem' }}>
                        <label style={{ color: '#d97706', display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>6-Digit Verification Pin</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. 123456" 
                            value={code} 
                            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            required 
                            style={{ letterSpacing: '4px', fontSize: '1.25rem', fontFamily: 'monospace', width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <div className="form-group mb-6" style={{ marginBottom: '1.25rem' }}>
                        <label style={{ color: '#d97706', display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>New Secure Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)}
                            required 
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ background: '#f59e0b', borderColor: '#d97706', color: '#ffffff', fontWeight: 700, width: '100%', padding: '0.6rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }} disabled={stage === 'verifying'}>
                        {stage === 'verifying' ? 'Validating Hash...' : 'Confirm & Update Password'}
                    </button>
                    
                    <button type="button" onClick={() => setStage('idle')} className="btn-secondary mt-3" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', border: '1px solid #ddd', background: '#fff', borderRadius: '6px', cursor: 'pointer', marginTop: '0.75rem' }}>
                        Cancel Request
                    </button>
                </form>
            )}
 
            {stage === 'success' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                    <ShieldCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                    <h4 style={{ color: '#10b981', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Authentication Matrix Updated</h4>
                    <p style={{ color: '#555555', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Your new password is now active. Any subsequent logins will require these credentials.
                    </p>
                    <button onClick={() => { setStage('idle'); setMessage(''); }} className="btn-primary" style={{ margin: '0 auto', width: 'auto', background: '#10b981', color: '#fff', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Acknowledge
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
