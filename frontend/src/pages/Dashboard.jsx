import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Link } from 'react-router-dom';
import { FilePlus, Eye, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await apiFetch('/requests/my-requests');
      // Backend returns either an array of objects or empty array.
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load your requests. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_verification':
        return <span className="status-badge pending_verification"><Clock size={12} className="mr-1" style={{ marginRight: '4px' }}/> Pending ID</span>;
      case 'pending':
        return <span className="status-badge pending"><Clock size={12} className="mr-1" style={{ marginRight: '4px' }}/> Pending</span>;
      case 'ready_for_pickup':
        return <span className="status-badge ready_for_pickup"><CheckCircle size={12} className="mr-1" style={{ marginRight: '4px' }}/> Ready</span>;
      default:
        return <span className="status-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}>{status}</span>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2>My Requests</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your submitted document requests.</p>
        </div>
        <Link to="/dashboard/new" className="btn-primary" style={{ width: 'auto' }}>
          <FilePlus size={18} />
          New Request
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div className="p-4 text-center">Loading requests...</div>
        ) : error ? (
          <div className="p-4 text-center error-text">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center p-4" style={{ padding: '3rem 2rem' }}>
             <FilePlus size={48} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
             <h3>No requests yet</h3>
             <p style={{ color: 'var(--text-muted)' }}>You haven't requested any documents.</p>
             <Link to="/dashboard/new" className="btn-primary mt-2" style={{ width: 'auto' }}>Request Now</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Document</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.request_id}>
                    <td style={{ fontWeight: 500 }}>#{req.request_id}</td>
                    <td>{req.document_type_name || `Doc ID: ${req.document_type_id}`}</td>
                    <td>{req.student_full_name}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{req.delivery_method}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(req.request_date).toLocaleDateString()}
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

export default Dashboard;
