import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Link } from 'react-router-dom';
import { FilePlus, Clock, CheckCircle, AlertCircle, ChevronRight, UploadCloud } from 'lucide-react';

const DOCUMENT_TYPES = [
  { id: 1, name: 'lateness_form', label: 'Lateness Form', is_auto_generated: true, requires_payment: false },
  { id: 2, name: 'absence_form', label: 'Absence Form', is_auto_generated: true, requires_payment: false },
  { id: 3, name: 'permission_slip', label: 'Permission Slip', is_auto_generated: true, requires_payment: false },
  { id: 4, name: 'enrolment_letter', label: 'Enrolment Letter', is_auto_generated: false, requires_payment: true },
  { id: 5, name: 'transcript', label: 'Transcript', is_auto_generated: false, requires_payment: true },
];

const genRef = (id) => `REFERENCE: ${String(id).padStart(3, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(null);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(() => {
      apiFetch('/requests/my-requests').then(data => {
        setRequests(Array.isArray(data) ? data : []);
      }).catch(err => console.error(err));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
      await apiFetch('/payment/upload-receipt', { method: 'POST', body: formData });
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
    switch (status) {
      case 'issued':
        return <span className="db-badge db-badge-issued"><CheckCircle size={11} /> Issued</span>;
      case 'processing':
        return <span className="db-badge db-badge-processing"><Clock size={11} /> Processing</span>;
      case 'pending_verification':
      case 'pending':
        return <span className="db-badge db-badge-action"><AlertCircle size={11} /> Action Required</span>;
      case 'ready_for_pickup':
        return <span className="db-badge db-badge-issued"><CheckCircle size={11} /> Ready</span>;
      default:
        return <span className="db-badge db-badge-processing"><Clock size={11} /> {status}</span>;
    }
  };

  const activeCount = requests.filter(r => ['pending', 'pending_verification', 'processing'].includes(r.status)).length;

  return (
    <div className="db-content">

      {/* Page Header */}
      <div className="db-page-header">
        <p className="db-page-eyebrow">ACADEMY PORTAL</p>
        <div className="db-page-title-row">
          <h1 className="db-page-title">Parent Dashboard</h1>
          <div className="db-page-actions">
            <button className="db-icon-btn" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="db-icon-btn" title="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active Requests Banner */}
      {activeCount > 0 && (
        <div className="db-active-banner">
          <div className="db-active-banner-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div>
            <div className="db-active-banner-count">{activeCount} active request{activeCount !== 1 ? 's' : ''}</div>
            <div className="db-active-banner-sub">Awaiting processing or action</div>
          </div>
        </div>
      )}

      {/* Recent Document Requests Table */}
      <div className="db-section-card">
        <div className="db-section-header">
          <div className="db-section-title-row">
            <div className="db-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h2 className="db-section-title">Recent Document Requests</h2>
          </div>
          <Link to="/dashboard/parents/new" className="db-view-all-link">
            View All <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="db-empty-state">Loading requests...</div>
        ) : error ? (
          <div className="db-empty-state db-error-text">{error}</div>
        ) : requests.length === 0 ? (
          <div className="db-empty-state">
            <FilePlus size={40} className="db-empty-icon" />
            <p>No document requests yet.</p>
            <Link to="/dashboard/parents/new" className="db-new-request-btn">
              <FilePlus size={16} /> New Request
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Document Type</th>
                    <th>Student</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.request_id}>
                      <td>
                        <div className="db-doc-name">{req.document_type_name}</div>
                        <div className="db-doc-ref">{genRef(req.request_id)}</div>
                      </td>
                      <td className="db-student-name">{req.student_full_name}</td>
                      <td className="db-date">{new Date(req.request_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>
                        {getDocInfo(req.document_type_id).requires_payment && req.status === 'pending' && (
                          <label className="db-upload-btn">
                            {uploadingReceipt === req.request_id ? 'Uploading...' : <><UploadCloud size={14} /> Upload Receipt</>}
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReceiptUpload(req.request_id, e)} disabled={uploadingReceipt === req.request_id} />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="db-table-footer-note">
              Document requests are typically processed within 2–5 business days. For urgent matters, please contact the registrar's office.
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
