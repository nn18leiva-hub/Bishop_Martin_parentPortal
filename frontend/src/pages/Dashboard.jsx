import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Link } from 'react-router-dom';
import { FilePlus, Eye, Clock, CheckCircle, UploadCloud } from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 1, name: 'lateness_form', label: 'Lateness Form', is_auto_generated: true, requires_payment: false },
  { id: 2, name: 'absence_form', label: 'Absence Form', is_auto_generated: true, requires_payment: false },
  { id: 3, name: 'permission_slip', label: 'Permission Slip', is_auto_generated: true, requires_payment: false },
  { id: 4, name: 'enrolment_letter', label: 'Enrolment Letter', is_auto_generated: false, requires_payment: true },
  { id: 5, name: 'transcript', label: 'Transcript', is_auto_generated: false, requires_payment: true },
];

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
    const interval = setInterval(() => {
       apiFetch('/requests/my-requests').then(data => {
         setRequests(Array.isArray(data) ? data : []);
       }).catch(err => console.error(err));
    }, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  const [uploadingReceipt, setUploadingReceipt] = useState(null); // stores request_id

  const loadRequests = async () => {
    try {
      const data = await apiFetch('/requests/my-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load your requests. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = async (request_id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('request_id', request_id);
    formData.append('receipt_image', file);

    setUploadingReceipt(request_id);
    try {
      await apiFetch('/payment/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      alert("Receipt uploaded! We'll verify it shortly.");
      loadRequests();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingReceipt(null);
    }
  };

  const getDocInfo = (type_id) => DOCUMENT_TYPES.find(d => d.id === parseInt(type_id)) || {};

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
      <div className="flex flex-responsive justify-between items-start mb-10 gap-8">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>My Requests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>Manage and track your submitted document applications.</p>
        </div>
        <Link 
          to="/dashboard/parents/new" 
          className="btn-primary w-full-mobile shadow-lg" 
          style={{ width: 'auto', padding: '0.85rem 1.75rem', fontSize: '0.9rem', flexShrink: 0, marginTop: '8px' }}
        >
          <FilePlus size={18} />
          New Request
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', width: '100%' }}>
        {loading ? (
          <div className="p-4 text-center">Loading requests...</div>
        ) : error ? (
          <div className="p-4 text-center error-text">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center p-4" style={{ padding: '3rem 2rem' }}>
             <FilePlus size={48} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
             <h3>No requests yet</h3>
             <p style={{ color: 'var(--text-muted)' }}>You haven't requested any documents.</p>
             <Link to="/dashboard/parents/new" className="btn-primary mt-2" style={{ width: 'auto', display: 'inline-flex' }}>Request Now</Link>
          </div>
        ) : (
          <div className="animate-up">
            {/* Mobile View: Cards */}
            <div className="mobile-view" style={{ flexDirection: 'column', gap: '1.5rem' }}>
              {requests.map(req => (
                <div className="request-card" key={req.request_id}>
                  <div className="request-card-header">
                    <div>
                      <span className="request-card-title">{req.document_type_name}</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        #{req.request_id} • {new Date(req.request_date).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                  
                  <div style={{ margin: '1rem 0', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{req.student_full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Method: {req.delivery_method}</p>
                  </div>

                  <div className="flex gap-2">
                    {getDocInfo(req.document_type_id).requires_payment && req.status === 'pending' && (
                      <label className="btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', boxShadow: 'none' }}>
                        {uploadingReceipt === req.request_id ? 'Uploading...' : 'Upload Receipt'}
                        <UploadCloud size={16} />
                        <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReceiptUpload(req.request_id, e)} disabled={uploadingReceipt === req.request_id} />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="desktop-block" style={{ overflowX: 'auto', width: '100%' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Document</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Delivery</th>
                    <th>Requested On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.request_id}>
                      <td style={{ fontWeight: 600 }}>#{req.request_id}</td>
                      <td style={{ fontWeight: 500 }}>{req.document_type_name}</td>
                      <td>{req.student_full_name}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td style={{ textTransform: 'capitalize' }}>{req.delivery_method}</td>
                      <td>{new Date(req.request_date).toLocaleDateString()}</td>
                      <td>
                        {getDocInfo(req.document_type_id).requires_payment && req.status === 'pending' && (
                          <label className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', width: 'auto' }}>
                            {uploadingReceipt === req.request_id ? '...' : 'Upload Receipt'}
                            <UploadCloud size={14} />
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReceiptUpload(req.request_id, e)} disabled={uploadingReceipt === req.request_id} />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
