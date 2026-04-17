import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, UserPlus, Trash2, ShieldAlert, Cpu, Server, Search, ArrowUpDown, LayoutList, KeyRound, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { logout, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('registry'); // 'registry', 'provision', or 'users'
  
  const [staffList, setStaffList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [stats, setStats] = useState({ registered: { staff: [], parents: [] }, online: { staff: [], parents: [] } });
  const [dataLoading, setDataLoading] = useState(true);
  
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');

  // Password Override State
  const [overrideTarget, setOverrideTarget] = useState(null); // stores user obj
  const [newPassword, setNewPassword] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  const loadData = async () => {
    try {
      const [staffData, userData, statsData] = await Promise.all([
        apiFetch('/superadmin/staff'),
        apiFetch('/superadmin/users'),
        apiFetch('/superadmin/stats')
      ]);
      setStaffList(Array.isArray(staffData) ? staffData : []);
      setUserList(Array.isArray(userData) ? userData : []);
      setStats(statsData || { registered: { staff: [], parents: [] }, online: { staff: [], parents: [] } });
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { 
     if (user && user.role === 'super_admin') loadData(); 
  }, [user]);

  if (!user || user.role !== 'super_admin') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await apiFetch('/superadmin/staff', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setFormData({ full_name: '', email: '', password: '', role: 'admin' });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create staff');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this staff member?')) return;
    try {
      await apiFetch(`/superadmin/staff/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Failed to delete staff: ' + err.message);
    }
  };

  const executePasswordOverride = async () => {
     if (newPassword.length < 6) return alert('Temporary password must be 6 characters strictly.');
     setOverrideLoading(true);
     try {
       await apiFetch('/superadmin/override-password', {
         method: 'POST',
         body: JSON.stringify({ targetEmail: overrideTarget.email, newPassword })
       });
       alert(`Successfully overrode password for ${overrideTarget.email}`);
       setOverrideTarget(null);
       setNewPassword('');
     } catch (err) {
       alert('Override Failed: ' + err.message);
     } finally {
       setOverrideLoading(false);
     }
  };

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffList;
    const lower = searchQuery.toLowerCase();
    return staffList.filter(s => s.full_name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower) || s.role.toLowerCase().includes(lower));
  }, [staffList, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return userList;
    const lower = searchQuery.toLowerCase();
    return userList.filter(u => u.full_name.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower) || u.user_type.toLowerCase().includes(lower));
  }, [userList, searchQuery]);

  return (
    <div className="animate-up">
      <div className="flex flex-responsive justify-between items-start mb-6 gap-2">
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>SuperAdmin Console</h2>
          <p style={{ color: 'var(--text-muted)' }}>High-level system governance and node management.</p>
        </div>
      </div>

      {/* Dynamic Tabs */}
      <div className="flex mb-16" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.25rem', flexWrap: 'wrap', gap: '6rem' }}>
        <button 
           onClick={() => { setActiveTab('registry'); setSearchQuery(''); }}
           style={{ background: 'transparent', border: 'none', color: activeTab === 'registry' ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', borderBottom: activeTab === 'registry' ? '4px solid var(--primary-color)' : 'none', paddingBottom: '1.25rem', transition: 'all 0.3s', letterSpacing: '0.07em' }}>
          STAFF REGISTRY
        </button>
        <button 
           onClick={() => { setActiveTab('provision'); setSearchQuery(''); }}
           style={{ background: 'transparent', border: 'none', color: activeTab === 'provision' ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', borderBottom: activeTab === 'provision' ? '4px solid var(--primary-color)' : 'none', paddingBottom: '1.25rem', transition: 'all 0.3s', letterSpacing: '0.07em' }}>
          PROVISION NEW STAFF
        </button>
        <button 
           onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
           style={{ background: 'transparent', border: 'none', color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', borderBottom: activeTab === 'users' ? '4px solid var(--primary-color)' : 'none', paddingBottom: '1.25rem', transition: 'all 0.3s', letterSpacing: '0.07em' }}>
          PUBLIC USERS
        </button>
      </div>

      {/* Comprehensive Statistics Panel */}
      <div className="grid grid-3 gap-6 mb-12">
         {/* Registered Breakdown */}
         <div className="glass-panel" style={{ borderLeft: '4px solid var(--primary-color)', padding: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
               <h3 style={{ fontSize: '1rem', color: 'var(--primary-color)' }}>Registered Base</h3>
               <Server size={18} color="var(--primary-color)" />
            </div>
            <div className="flex flex-col gap-3">
               <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Parents/Students</span>
                  <span style={{ fontWeight: 700 }}>{stats.registered.parents.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Staff (Admins/Viewers)</span>
                  <span style={{ fontWeight: 700 }}>{stats.registered.staff.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</span>
               </div>
               <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '8px', paddingTop: '8px' }} className="flex justify-between items-center">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Total Systems</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{staffList.length + userList.length}</span>
               </div>
            </div>
         </div>

         {/* Active/Online Breakdown */}
         <div className="glass-panel" style={{ borderLeft: '4px solid var(--success-color)', padding: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
               <h3 style={{ fontSize: '1rem', color: 'var(--success-color)' }}>Online Nodes (15m)</h3>
               <Cpu size={18} color="var(--success-color)" />
            </div>
            <div className="flex flex-col gap-3">
               <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Parents</span>
                  <span style={{ fontWeight: 700, color: 'var(--success-color)' }}>{stats.online.parents.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Staff</span>
                  <span style={{ fontWeight: 700, color: 'var(--success-color)' }}>{stats.online.staff.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</span>
               </div>
               <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '8px', paddingTop: '8px' }} className="flex justify-between items-center">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Global Sync</span>
                  <span style={{ fontWeight: 800, color: 'var(--success-color)' }}>
                     {stats.online.parents.reduce((acc, curr) => acc + parseInt(curr.count), 0) + stats.online.staff.reduce((acc, curr) => acc + parseInt(curr.count), 0)} Live
                  </span>
               </div>
            </div>
         </div>

         {/* Search & Integrity */}
         <div className="glass-panel flex flex-col justify-between" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex items-center gap-3 mb-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '0.5rem 1rem', border: '1px solid var(--glass-border)' }}>
               <Search size={18} color="var(--text-muted)" />
               <input type="text" placeholder={`Filter ${activeTab}...`} style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', width: '100%', fontSize: '0.85rem' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex justify-between items-center">
               <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>System Integrity</span>
               <div className="flex items-center gap-2" style={{ color: 'var(--success-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--success-color)', borderRadius: '50%', boxShadow: '0 0 8px var(--success-color)' }}></div>
                  NOMINAL
               </div>
            </div>
         </div>
      </div>

        {activeTab === 'provision' && (
           <div className="animate-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ borderTop: '4px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.05)' }}>
                <h3 className="mb-6 flex items-center gap-3" style={{ color: '#c4b5fd', fontSize: '1.5rem' }}><Server size={24} /> Provision New Administrative Node</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Onboard a new staff member with specific matrix permissions. Temporary passwords must be changed upon first login.</p>
                
                {error && <div className="error-text mb-4 p-4" style={{ background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#fca5a5' }}>{error}</div>}
                
                <form onSubmit={handleCreateStaff} autoComplete="off">
                  <div className="form-grid form-grid-2 mb-6">
                    <div className="form-group">
                      <label style={{ color: '#a78bfa' }}>Internal Full Name</label>
                      <input type="text" name="full_name" autoComplete="new-password" className="form-input" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'rgba(139, 92, 246, 0.3)' }} value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#a78bfa' }}>Institutional Email</label>
                      <input type="email" name="email" autoComplete="new-password" className="form-input" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'rgba(139, 92, 246, 0.3)' }} value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-grid form-grid-2 mb-8">
                    <div className="form-group">
                      <label style={{ color: '#a78bfa' }}>Permission Matrix Role</label>
                      <select name="role" className="form-select" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'rgba(139, 92, 246, 0.3)' }} value={formData.role} onChange={handleChange}>
                        <option value="admin">Level 3: Admin</option>
                        <option value="viewer">Level 2: Viewer (Read-only)</option>
                        <option value="super_admin">Level 4: Super Admin (Root)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#a78bfa' }}>Secure Temporary Password</label>
                      <input type="password" name="password" autoComplete="new-password" className="form-input" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', borderColor: 'rgba(139, 92, 246, 0.3)' }} value={formData.password} onChange={handleChange} required />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ background: '#8b5cf6', borderColor: '#7c3aed', width: '100%', padding: '1.25rem' }} disabled={creating}>
                    <UserPlus size={20} className="inline mr-2" />
                    {creating ? 'Synchronizing Cluster...' : 'Deploy Active Account'}
                  </button>
                </form>
              </div>
           </div>
        )}

        {activeTab === 'registry' && (
            <div className="animate-up">
              <div className="glass-panel" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', background: 'rgba(139, 92, 246, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderRadius: '14px' }}>
                 <ShieldAlert size={22} color="#a78bfa" />
                 <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Administrative Node Registry</h3>
              </div>

              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                {dataLoading ? (
                   <div className="p-4 text-center">Interrogating Server Databanks...</div>
                ) : (
                  <>
                    {/* MOBILE VIEW CARDS FOR STAFF */}
                    <div className="mobile-view flex-col gap-4" style={{ padding: '1rem' }}>
                        {filteredStaff.map(staff => (
                            <div key={`m-${staff.staff_id}`} className="request-card" style={{ borderLeft: `4px solid ${staff.role === 'super_admin' ? '#ef4444' : '#3b82f6'}`, padding: '1.25rem', marginBottom: 0 }}>
                                <div className="flex justify-between items-start mb-2">
                                    <span style={{ fontWeight: 800, fontSize: '1.10rem', color: '#c4b5fd' }}>SVR-{staff.staff_id.toString().padStart(4, '0')}</span>
                                    <span className="status-badge" style={{ background: staff.role === 'super_admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: staff.role === 'super_admin' ? '#fca5a5' : '#93c5fd', fontSize: '0.65rem' }}>
                                        {staff.role.replace('_', ' ')}
                                    </span>
                                </div>
                                <strong style={{ display: 'block', color: '#fff', marginBottom: '4px', fontSize: '1.1rem' }}>{staff.full_name}</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>{staff.email}</span>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => setOverrideTarget(staff)} className="btn-secondary flex-1 flex justify-center items-center gap-1" style={{ padding: '8px', fontSize: '0.8rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px' }} title="Override Password">
                                        <KeyRound size={14} /> Password
                                    </button>
                                    {staff.role !== 'super_admin' && (
                                      <button onClick={() => handleDeleteStaff(staff.staff_id)} className="btn-secondary flex-1 flex justify-center items-center gap-1" style={{ padding: '8px', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px' }} title="Desync node">
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredStaff.length === 0 && <div className="text-center p-4">No staff found matching search.</div>}
                    </div>

                    {/* DESKTOP VIEW TABLE FOR STAFF */}
                    <div className="desktop-block">
                      <table className="data-table" style={{ width: '100%' }}>
                        <thead style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                          <tr>
                            <th style={{ color: '#a78bfa' }}>Network ID</th>
                            <th style={{ color: '#a78bfa' }}>Identity</th>
                            <th style={{ color: '#a78bfa', textAlign: 'center' }}>Security Auth</th>
                            <th style={{ color: '#a78bfa', textAlign: 'center' }}>Node Termination</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStaff.map(staff => (
                            <tr key={staff.staff_id}>
                              <td style={{ color: '#c4b5fd', fontWeight: 'bold', fontSize: '1rem' }}>SVR-{staff.staff_id.toString().padStart(4, '0')}</td>
                              <td>
                                <strong style={{ display: 'block', color: '#fff', marginBottom: '4px', fontSize: '1.05rem' }}>{staff.full_name}</strong>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span className="status-badge" style={{ background: staff.role === 'super_admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: staff.role === 'super_admin' ? '#fca5a5' : '#93c5fd', fontSize: '0.65rem' }}>
                                    {staff.role.replace('_', ' ')}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{staff.email}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                 <button onClick={() => setOverrideTarget(staff)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', width: 'auto', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }} title="Override Password">
                                    <KeyRound size={16} /> Override Password
                                 </button>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {staff.role !== 'super_admin' && (
                                  <button onClick={() => handleDeleteStaff(staff.staff_id)} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', width: 'auto', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }} title="Desync node">
                                    <Trash2 size={16} /> Delete Node
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                          {filteredStaff.length === 0 && <tr><td colSpan={4} className="text-center" style={{ padding: '3rem' }}>No staff nodes discovered in this sector.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
        )}

         {activeTab === 'users' && (
            <div className="animate-up">
               <div className="glass-panel" style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderRadius: '14px' }}>
                  <LayoutList size={22} color="#10b981" />
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>Public User Accounts Registry</h3>
               </div>
               
               <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* MOBILE VIEW CARDS FOR USERS */}
                  <div className="mobile-view flex-col gap-4" style={{ padding: '1rem' }}>
                    {filteredUsers.map(u => (
                      <div className="request-card" key={`um-${u.id}`} style={{ borderLeft: `4px solid ${u.verified ? '#10b981' : '#f59e0b'}`, marginBottom: 0 }}>
                        <div className="flex justify-between items-start mb-2">
                           <span style={{ fontWeight: 800, fontSize: '1rem', color: u.verified ? '#10b981' : '#f59e0b' }}>USR-{u.id.toString().padStart(4, '0')}</span>
                           <span className="status-badge" style={{ fontSize: '0.65rem' }}>{u.verified ? 'Verified' : 'Unverified'}</span>
                        </div>
                        <strong style={{ display: 'block', color: '#fff', fontSize: '1.1rem' }}>{u.full_name}</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{u.email}</p>
                        <button onClick={() => setOverrideTarget(u)} className="btn-secondary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                           <KeyRound size={16} /> Override Password
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW TABLE FOR USERS */}
                  <div className="desktop-block">
                    <table className="data-table" style={{ width: '100%' }}>
                      <thead style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <tr>
                          <th style={{ color: '#10b981' }}>ID</th>
                          <th style={{ color: '#10b981' }}>Identity</th>
                          <th style={{ color: '#10b981' }}>Verification</th>
                          <th style={{ color: '#10b981' }}>Meta Info</th>
                          <th style={{ color: '#10b981', textAlign: 'center' }}>Management</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td style={{ color: '#10b981', fontWeight: 700 }}>USR-{u.id.toString().padStart(4, '0')}</td>
                            <td>
                              <strong style={{ display: 'block', color: '#fff', fontSize: '1rem' }}>{u.full_name}</strong>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</span>
                            </td>
                            <td>
                               {u.verified ? (
                                 <span className="status-badge ready_for_pickup" style={{ fontSize: '0.65rem' }}>Verified Account</span>
                               ) : (
                                 <span className="status-badge pending_verification" style={{ fontSize: '0.65rem' }}>Unverified Node</span>
                               )}
                            </td>
                            <td>
                               <div style={{ fontSize: '0.85rem' }}>
                                 <p><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {new Date(u.dob).toLocaleDateString()}</p>
                                 <p><span style={{ color: 'var(--text-muted)' }}>PH:</span> {u.phone || 'N/A'}</p>
                               </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button onClick={() => setOverrideTarget(u)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', width: 'auto', margin: '0 auto', borderRadius: '6px' }}>
                                 <KeyRound size={14} className="inline mr-2" /> Override
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && <tr><td colSpan={5} className="text-center p-8">No matching user accounts discovered.</td></tr>}
                      </tbody>
                    </table>
                  </div>
               </div>
           </div>
         )}

      {/* OVERRIDE MODAL */}
      {overrideTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <div className="glass-panel modal-panel" style={{ borderTop: '4px solid #f59e0b', marginBottom: 0, maxWidth: '500px' }}>
             <button onClick={() => {setOverrideTarget(null); setNewPassword('')}} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <XCircle size={24} />
             </button>
             
             <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <KeyRound size={24} color="#f59e0b" /> Password Override
             </h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
               Forcefully reset the locked password for <strong>{overrideTarget.email}</strong>. This operation permanently scrambles the new credential hash and cannot be undone.
             </p>

             <div className="form-group mb-4">
                <label style={{ color: '#fbbf24' }}>New Temporary Password</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fff', fontSize: '1.125rem' }} 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="e.g. Temp1234!" 
                />
             </div>

             <button onClick={executePasswordOverride} className="btn-primary" style={{ background: '#f59e0b', color: '#000', borderColor: '#d97706', width: '100%', fontWeight: 700 }} disabled={overrideLoading || newPassword.length < 6}>
                {overrideLoading ? 'Overwriting Hash...' : 'Execute Override'}
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
