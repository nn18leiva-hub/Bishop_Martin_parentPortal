import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    try {
      const data = await apiFetch('/staff/requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await apiFetch('/staff/requests/status', {
        method: 'PATCH',
        body: JSON.stringify({ request_id: requestId, status: newStatus })
      });
      loadRequests();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="app-container p-4">
      <div className="flex justify-between items-center mb-4">
        <h2>Staff Dashboard</h2>
        <button className="btn-secondary flex items-center gap-2" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="p-4 text-center">Loading requests...</div>
        ) : error ? (
          <div className="p-4 text-center error-text">{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>BEMIS ID</th>
                  <th>Doc Type</th>
                  <th>Date</th>
                  <th>Delivery</th>
                  <th>Action / Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.request_id}>
                    <td>#{req.request_id}</td>
                    <td>{req.student_full_name}</td>
                    <td>{req.student_bemis_id}</td>
                    <td>{req.document_type_id}</td>
                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                    <td>{req.delivery_method}</td>
                    <td>
                      <select 
                        className="form-select" 
                        value={req.status} 
                        onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                        style={{ padding: '4px', fontSize: '0.875rem', width: 'auto', display: 'inline-block' }}
                      >
                        <option value="pending_verification">Pending ID</option>
                        <option value="pending">Pending</option>
                        <option value="ready_for_pickup">Ready For Pickup / Mailed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
