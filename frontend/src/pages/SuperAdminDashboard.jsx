import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ full_name: '', email: '', password: '', role: 'admin' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadStaff = async () => {
    try {
      const data = await apiFetch('/superadmin/staff');
      setStaffList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

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
      loadStaff();
    } catch (err) {
      setError(err.message || 'Failed to create staff');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Super Admin Control Panel</h2>
        <button className="btn-secondary flex items-center gap-2" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <div className="glass-panel">
          <h3 className="mb-3">Provision New Staff</h3>
          {error && <div className="error-text mb-2 p-2">{error}</div>}
          <form onSubmit={handleCreateStaff}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary mt-2" disabled={creating}>
              <UserPlus size={16} className="inline mr-2" />
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', alignSelf: 'start' }}>
          {loading ? (
             <div className="p-4">Loading staff directory...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.staff_id}>
                    <td>#{staff.staff_id}</td>
                    <td>{staff.full_name}</td>
                    <td>{staff.email}</td>
                    <td style={{ textTransform: 'capitalize' }}>{staff.role.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
