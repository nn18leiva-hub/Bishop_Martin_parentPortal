import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, UserPlus, Trash2, ShieldAlert, Search, XCircle, CheckCircle, Filter, UserMinus, Plus, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/ThemeLanguageContext';
import HeaderActions from '../components/HeaderActions';

const SuperAdminDashboard = () => {
  const { logout, user, loading: authLoading } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  
  const [staffList, setStaffList] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Add Staff Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'staff' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Collapsible Filters states
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const isAuthorized = user?.type === 'staff';

  const loadData = async () => {
    try {
      const staffData = await apiFetch('/superadmin/staff');
      setStaffList(Array.isArray(staffData) ? staffData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { 
     if (user && isAuthorized) loadData(); 
  }, [user]);

  if (!user || !isAuthorized) return null;

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
      setFormData({ full_name: '', email: '', password: '', role: 'staff' });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create staff');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete staff member ${name}?`)) return;
    try {
      await apiFetch(`/superadmin/staff/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert('Failed to delete staff: ' + err.message);
    }
  };

  // Mock staff list for empty database fallback
  const mockStaff = [
    {
      staff_id: 101,
      full_name: 'Dr. Robert Chen',
      email: 'robert.chen@bishopmartin.edu',
      department: 'Science & Tech',
      role_label: 'Department Head',
      status: 'Active',
      access: 'Full Admin',
      role: 'staff',
      initials: 'RC',
      avatar: '/robert_chen.png'
    },
    {
      staff_id: 102,
      full_name: 'Sarah J. Williams',
      email: 'sarah.williams@bishopmartin.edu',
      department: 'Humanities',
      role_label: 'Senior Lecturer',
      status: 'Active',
      access: 'Standard Access',
      role: 'staff',
      initials: 'SW',
      avatar: '/sarah_williams.png'
    },
    {
      staff_id: 103,
      full_name: 'Marcus Thorne',
      email: 'm.thorne@bishopmartin.edu',
      department: 'Finance',
      role_label: 'Bursar',
      status: 'On Leave',
      access: 'Financial Restricted',
      role: 'staff',
      initials: 'MT',
      avatar: '/marcus_thorne.png'
    }
  ];

  // Combine database staff list with mock registry
  const displayedStaff = [];
  
  // Seed the mock staff first as fallbacks/seed layout
  mockStaff.forEach(m => displayedStaff.push(m));
  
  // Append actual database staff members dynamically
  staffList.forEach(s => {
    // Avoid double listing seed emails
    if (s.email !== 'office@bmhs.edu.bz' && s.email !== 'superadmin@bmhs.edu.bz' && s.email !== 'principal@bmhs.edu.bz') {
      const parts = s.full_name.split(' ');
      const ini = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
      
      let roleLabel = 'Staff Member';
      let accessLevel = 'Standard Access';
      if (s.role === 'principal' || s.role === 'super_admin') {
        roleLabel = 'Principal';
        accessLevel = 'Full Admin';
      }
      
      displayedStaff.push({
        staff_id: s.staff_id,
        full_name: s.full_name,
        email: s.email,
        department: 'Administration',
        role_label: roleLabel,
        status: 'Active',
        access: accessLevel,
        role: s.role,
        initials: ini || 'S'
      });
    }
  });

  // Filter based on search query, department, and role
  const filteredStaff = displayedStaff.filter(s => {
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      const matchSearch = s.full_name.toLowerCase().includes(lower) || 
                          s.email.toLowerCase().includes(lower) || 
                          s.department.toLowerCase().includes(lower) || 
                          s.role_label.toLowerCase().includes(lower);
      if (!matchSearch) return false;
    }
    
    if (filterDept !== 'all') {
      if (s.department !== filterDept) return false;
    }
    
    if (filterRole !== 'all') {
      if (s.role_label !== filterRole) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const paginatedStaff = useMemo(() => {
    const startIndex = (activePage - 1) * itemsPerPage;
    return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStaff, activePage]);

  return (
    <div style={{ padding: '1rem 1.5rem 2rem 1.5rem' }}>
      
      {/* ── Page Navigation Header Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7a0c2e', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          {t('staff_registry')}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <div style={{ background: '#f5f5f5', border: '1px solid #eaeaea', borderRadius: '20px', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={15} color="#888" />
            <input 
              type="text" 
              placeholder={t('search_registry')} 
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '180px', fontFamily: "'Outfit', sans-serif" }} 
            />
          </div>
          <HeaderActions />
          <img 
            src="/principal_avatar.png" 
            alt="Principal Profile" 
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eaeaea', marginLeft: '0.25rem' }} 
          />
        </div>
      </div>

      {/* ── Dashboard Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a0c2e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>
            Administrative Control
          </p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2c2c2c', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            {t('staff_registry')}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: showFilters ? 'rgba(122, 12, 46, 0.08)' : '#ffffff', 
              border: showFilters ? '1.5px solid #7a0c2e' : '1px solid #eaeaea', 
              borderRadius: '6px', 
              padding: '0.55rem 1.1rem', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              color: showFilters ? '#7a0c2e' : '#444',
              cursor: 'pointer'
            }}
          >
            <Filter size={14} /> {t('filter_list')}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: '#7a0c2e', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '0.55rem 1.1rem', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> {t('add_new_staff')}
          </button>
        </div>
      </div>

      {/* ── Collapsible Filters Panel ── */}
      {showFilters && (
        <div className="mock-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #eaeaea)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color, #555)' }}>Department</label>
            <select
              value={filterDept}
              onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
              style={{ border: '1px solid var(--border-color, #eaeaea)', borderRadius: 6, padding: '0.45rem', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-color, #2c2c2c)', outline: 'none' }}
            >
              <option value="all">All Departments</option>
              <option value="Science & Tech">Science & Tech</option>
              <option value="Humanities">Humanities</option>
              <option value="Finance">Finance</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color, #555)' }}>Role</label>
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value); setCurrentPage(1); }}
              style={{ border: '1px solid var(--border-color, #eaeaea)', borderRadius: 6, padding: '0.45rem', fontSize: '0.85rem', background: 'transparent', color: 'var(--text-color, #2c2c2c)', outline: 'none' }}
            >
              <option value="all">All Roles</option>
              <option value="Department Head">Department Head</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Bursar">Bursar</option>
              <option value="Staff Member">Staff Member</option>
              <option value="Principal">Principal</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              onClick={() => { setFilterDept('all'); setFilterRole('all'); setSearchQuery(''); setCurrentPage(1); }}
              style={{ border: '1px solid #7a0c2e', color: '#7a0c2e', background: 'transparent', borderRadius: 6, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* ── Registry Table Card ── */}
      <div className="mock-card" style={{ padding: '0.5rem 0' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eaeaea' }}>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff Member</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStaff.map((s, i) => (
                <tr key={s.staff_id || i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                  
                  {/* Staff Member (Initials, Name, Email) */}
                  <td style={{ padding: '1.15rem 1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.avatar ? (
                      <img 
                        src={s.avatar} 
                        alt={s.full_name} 
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid #eaeaea' }} 
                      />
                    ) : (
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
                        {s.initials}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2c2c2c' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#888888' }}>{s.email}</div>
                    </div>
                  </td>

                  {/* Department */}
                  <td style={{ padding: '1.15rem 1rem', fontSize: '0.85rem', color: '#555555' }}>
                    {s.department}
                  </td>

                  {/* Role */}
                  <td style={{ padding: '1.15rem 1rem', fontSize: '0.85rem', color: '#555555' }}>
                    {s.role_label}
                  </td>

                  {/* Status Pill */}
                  <td style={{ padding: '1.15rem 1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: s.status === 'Active' ? '#d1fae5' : '#fef3c7',
                      color: s.status === 'Active' ? '#10b981' : '#f59e0b'
                    }}>
                      {s.status}
                    </span>
                  </td>

                  {/* Access privilege */}
                  <td style={{ padding: '1.15rem 1rem', fontSize: '0.85rem', color: '#555555' }}>
                    {s.access}
                  </td>

                  {/* Actions Column */}
                  <td style={{ padding: '1.15rem 1rem', textAlign: 'right' }}>
                    {/* Render delete action only for database staff (prevent deleting mocked visual rows) */}
                    {s.staff_id >= 0 && s.staff_id !== 101 && s.staff_id !== 102 && s.staff_id !== 103 ? (
                      <button 
                        onClick={() => handleDeleteStaff(s.staff_id, s.full_name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Staff"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'not-allowed', padding: '4px' }} disabled>
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1rem', borderTop: '1px solid #eaeaea' }}>
          <span style={{ fontSize: '0.8rem', color: '#888888' }}>
            Showing {paginatedStaff.length} of {filteredStaff.length} active staff members
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ border: 'none', background: 'none', color: activePage === 1 ? '#ccc' : '#888888', cursor: activePage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              const isActive = activePage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    border: 'none',
                    background: isActive ? '#7a0c2e' : 'none',
                    color: isActive ? '#ffffff' : '#888888',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ border: 'none', background: 'none', color: activePage === totalPages ? '#ccc' : '#888888', cursor: activePage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* ── ADD NEW STAFF MODAL ── */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
              <XCircle size={24} />
            </button>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#7a0c2e', marginBottom: '1.25rem', fontFamily: "'Outfit', sans-serif" }}>
              Add New Staff User
            </h3>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Full Name</label>
                <input 
                  type="text" 
                  name="full_name" 
                  value={formData.full_name} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', border: '1px solid #eaeaea', borderRadius: 6, padding: '0.55rem 0.8rem', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', border: '1px solid #eaeaea', borderRadius: 6, padding: '0.55rem 0.8rem', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={{ width: '100%', border: '1px solid #eaeaea', borderRadius: 6, padding: '0.55rem 0.8rem', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>System Access Privilege</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange} 
                  style={{ width: '100%', border: '1px solid #eaeaea', borderRadius: 6, padding: '0.55rem 0.8rem', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
                >
                  <option value="staff">Staff (Standard Access)</option>
                  <option value="principal">Principal (Full Admin)</option>
                </select>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: 0 }}>{error}</p>}

              <button 
                type="submit" 
                disabled={creating}
                style={{ 
                  background: '#7a0c2e', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '0.65rem', 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                {creating ? 'Creating...' : 'Register User'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
