import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, Eye, CheckCircle, XCircle, FileText, Activity, Users, FileCheck, Info, AlertTriangle, MoreVertical, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSettings } from '../contexts/ThemeLanguageContext';
import HeaderActions from '../components/HeaderActions';

const StaffDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { t, theme } = useSettings();
  const dk = theme === 'dark';

  const c = {
    textMain: dk ? '#ffffff' : '#2c2c2c',
    textSub: dk ? '#bbbbbb' : '#666666',
    border: dk ? '#2a2a2a' : '#eaeaea',
    searchBg: dk ? '#2a2a2a' : '#f5f5f5',
    searchBorder: dk ? '#3d3d3d' : '#eaeaea',
    tableFooterBg: dk ? '#1e1e1e' : '#faf9f6',
    tableBorder: dk ? '#2a2a2a' : '#eaeaea',
    tableRowBorder: dk ? '#242424' : '#f9f9f9',
    selectBg: dk ? '#2a2a2a' : '#ffffff',
    selectBorder: dk ? '#3d3d3d' : '#eaeaea',
    selectColor: dk ? '#ffffff' : '#333333',
    cardTitleColor: dk ? '#ffffff' : '#1a1a1a',
    modalText: dk ? '#e0e0e0' : '#333333',
    modalHeading: dk ? '#ffffff' : '#2c2c2c',
    badgeText: dk ? '#dddddd' : '#4b5563',
    badgeBg: dk ? '#2a2a2a' : '#f3f4f6',
    deleteBtnBg: dk ? '#2d2d2d' : '#f5f5f5',
  };

  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [pendingParents, setPendingParents] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal State
  const [activeModal, setActiveModal] = useState(null); // 'ssn', 'payment', 'info', or null
  const [modalPayload, setModalPayload] = useState(null);

  const loadRequests = async () => {
    try {
      const data = await apiFetch('/staff/requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setDataLoading(false);
    }
  };

  const loadPendingParents = async () => {
    try {
      const data = await apiFetch('/staff/pending-parents');
      setPendingParents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pending parents:', err);
    }
  };



  const handleDeleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this document request?")) {
      try {
        await apiFetch(`/staff/request/${id}`, {
          method: 'DELETE'
        });
        loadRequests();
      } catch (err) {
        alert('Failed to delete document request: ' + err.message);
      }
    }
  };

  useEffect(() => {
    if (user && user.type === 'staff') {
      loadRequests();
      loadPendingParents();
      const interval = setInterval(() => {
        apiFetch('/staff/requests').then(data => {
          setRequests(Array.isArray(data) ? data : []);
        }).catch(err => console.error(err));

        apiFetch('/staff/pending-parents').then(data => {
          setPendingParents(Array.isArray(data) ? data : []);
        }).catch(err => console.error(err));
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user || user.type !== 'staff') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await apiFetch('/staff/update-request-status', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, status: newStatus })
      });
      loadRequests();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleApproveIdentity = async () => {
    try {
      await apiFetch('/staff/verify-parent', {
        method: 'POST',
        body: JSON.stringify({ parent_id: modalPayload.parent_id, approve: true })
      });
      setActiveModal(null);
      loadRequests();
      loadPendingParents();
    } catch(err) {
      alert(err.message);
    }
  };

  const handleRejectIdentity = async () => {
    try {
      await apiFetch('/staff/verify-parent', {
        method: 'POST',
        body: JSON.stringify({ parent_id: modalPayload.parent_id, approve: false })
      });
      setActiveModal(null);
      loadRequests();
      loadPendingParents();
    } catch(err) {
      alert(err.message);
    }
  };

  const handleVerifyIdentityDirect = async (parentId, approve) => {
    try {
      await apiFetch('/staff/verify-parent', {
        method: 'POST',
        body: JSON.stringify({ parent_id: parentId, approve })
      });
      loadRequests();
      loadPendingParents();
    } catch(err) {
      alert(err.message);
    }
  };

  const handleApprovePayment = async () => {
    try {
      await apiFetch('/staff/verify-payment', {
        method: 'POST',
        body: JSON.stringify({ payment_id: modalPayload.payment_id })
      });
      setActiveModal(null);
      loadRequests();
    } catch(err) {
      alert(err.message);
    }
  };

  const openModal = (type, req) => {
    setModalPayload(req);
    setActiveModal(type);
  };

  // Mock requests for empty database fallback
  const mockRequests = [
    {
      request_id: 12,
      student_full_name: 'Julian Hernandez',
      student_bemis_id: 'BM-2024-0012',
      document_type_name: 'Transfer Request',
      parent_verified: false,
      ssn_card_image_path: 'uploads/dummy_ssn.png',
      requires_payment: true,
      payment_verified: false,
      receipt_image_path: 'uploads/dummy_receipt.png',
      status: 'pending_verification',
      delivery_method: 'pickup',
      request_date: new Date()
    },
    {
      request_id: 89,
      student_full_name: 'Sarah McAllister',
      student_bemis_id: 'BM-2024-0089',
      document_type_name: 'Transcript Copy',
      parent_verified: true,
      ssn_card_image_path: null,
      requires_payment: true,
      payment_verified: false,
      receipt_image_path: 'uploads/dummy_receipt.png',
      status: 'pending',
      delivery_method: 'mailed',
      request_date: new Date()
    },
    {
      request_id: 145,
      student_full_name: 'Ethan Williams',
      student_bemis_id: 'BM-2024-0145',
      document_type_name: 'Conduct Certificate',
      parent_verified: false,
      ssn_card_image_path: 'uploads/dummy_ssn.png',
      requires_payment: true,
      payment_verified: true,
      receipt_image_path: 'uploads/dummy_receipt.png',
      status: 'ready_for_pickup',
      delivery_method: 'emailed',
      request_date: new Date()
    }
  ];

  // Active requests list
  const activeRequests = requests;

  // URL path-based filters
  const isArchivePage = window.location.pathname.includes('/archive');
  const isApprovalPage = window.location.pathname.includes('/approval');

  let filteredRequests = activeRequests;
  let pageTitle = 'Parent Requests Dashboard';
  let pageDescription = 'Manage and verify document submissions from parents and guardians. Use the status column to transition requests through the validation workflow.';

  if (isArchivePage) {
    filteredRequests = activeRequests.filter(r => r.status === 'completed' || r.status === 'denied');
    pageTitle = 'Archived Document Requests';
    pageDescription = 'Historical log of completed or denied parent requests.';
  } else if (isApprovalPage) {
    filteredRequests = activeRequests.filter(r => 
      (!r.parent_verified && r.ssn_card_image_path) || 
      (r.requires_payment && !r.payment_verified && r.receipt_image_path) ||
      r.status === 'pending_verification'
    );
    pageTitle = 'Approval Queue';
    pageDescription = 'Verify parent identity SSN cards and uploaded bank payment receipts to approve pending requests.';
  }

  // Paginate requests
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const pendingVerificationCount = requests.filter(r => r.status === 'pending_verification').length + pendingParents.length;
  const paymentsAwaitingCount = requests.filter(r => r.requires_payment && !r.payment_verified && r.receipt_image_path).length;
  const readyForPickupCount = requests.filter(r => r.status === 'ready_for_pickup').length;
  const totalProcessedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div style={{ padding: '1rem 1.5rem 2rem 1.5rem' }}>
      
      {/* ── Page Header & Navigation Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: dk ? '#ffb4c4' : '#7a0c2e', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
          Bishop Martin High School
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
          <div style={{ background: c.searchBg, border: `1px solid ${c.searchBorder}`, borderRadius: '20px', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={15} color="#888" />
            <input type="text" placeholder={t('search_records')} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '180px', fontFamily: "'Outfit', sans-serif", color: c.selectColor }} />
          </div>
          <HeaderActions />
        </div>
      </div>

      {/* ── Dashboard Title ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: c.textMain, margin: '0 0 6px 0', fontFamily: "'Outfit', sans-serif" }}>
          {pageTitle}
        </h2>
        <p style={{ fontSize: '0.85rem', color: c.textSub, margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
          {pageDescription}
        </p>
      </div>

      {/* ── 4-Card Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Pending Verification */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Pending Verification
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0, color: '#7a0c2e' }}>
            {pendingVerificationCount}
          </p>
        </div>

        {/* Payments Awaiting Approval */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Payments Awaiting Approval
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            {paymentsAwaitingCount}
          </p>
        </div>

        {/* Ready for Pickup */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Ready for Pickup
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0, color: '#10b981' }}>
            {readyForPickupCount}
          </p>
        </div>

        {/* Total Processed Today */}
        <div className="mock-card">
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Total Processed Today
          </p>
          <p className="serif-number" style={{ fontSize: '2.3rem', margin: 0 }}>
            {totalProcessedCount}
          </p>
        </div>

      </div>

      {/* ── Parents Verification Section (Only on Approval Queue Page) ── */}
      {isApprovalPage && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: dk ? '#ffb4c4' : '#7a0c2e', marginBottom: '1rem', fontFamily: "'Outfit', sans-serif" }}>
            Parents Awaiting Identity Verification ({pendingParents.length})
          </h3>
          <div className="mock-card" style={{ padding: '0.5rem 0' }}>
            {pendingParents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#888888', fontSize: '0.9rem' }}>
                No parent registration requests currently awaiting identity verification.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent Name</th>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Date</th>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Status</th>
                      <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingParents.map((parent, idx) => {
                      const parts = parent.full_name.split(' ');
                      const ini = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
 
                      return (
                        <tr key={parent.parent_id || idx} style={{ borderBottom: `1px solid ${c.tableRowBorder}` }}>
                          <td style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                              {ini || 'P'}
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.textMain }}>{parent.full_name}</span>
                          </td>
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: c.textSub }}>{parent.email}</td>
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: c.textSub }}>{parent.phone || 'N/A'}</td>
                          <td style={{ padding: '1.25rem 1rem', fontSize: '0.85rem', color: c.textSub }}>
                            {new Date(parent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '1.25rem 1rem' }}>
                            {parent.verified ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
                                Approved
                              </span>
                            ) : (
                              <span 
                                onClick={() => openModal('ssn', parent)} 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: dk ? '#ffb4c4' : '#7a0c2e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                <AlertTriangle size={14} /> Verify SSN Card
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              {parent.verified ? (
                                <button 
                                  onClick={() => handleVerifyIdentityDirect(parent.parent_id, false)} 
                                  style={{ background: c.deleteBtnBg, border: `1px solid ${c.border}`, color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => handleVerifyIdentityDirect(parent.parent_id, true)} 
                                    style={{ background: '#7a0c2e', border: 'none', color: '#ffffff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => handleVerifyIdentityDirect(parent.parent_id, false)} 
                                    style={{ background: c.deleteBtnBg, border: `1px solid ${c.border}`, color: '#ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Requests Table Card ── */}
      <div className="mock-card" style={{ padding: '0.5rem 0' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Name</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Type</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Status</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Update</th>
                <th style={{ padding: '1rem', fontSize: '0.72rem', fontWeight: 700, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map((req, i) => {
                const parts = req.student_full_name.split(' ');
                const ini = parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();

                return (
                  <tr key={req.request_id || i} style={{ borderBottom: `1px solid ${c.tableRowBorder}` }}>
                    
                    {/* Student Name & ID */}
                    <td style={{ padding: '1.25rem 1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        {ini || 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: c.textMain }}>{req.student_full_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#888888' }}>ID: {req.student_bemis_id || `BM-2024-${req.request_id}`}</div>
                      </div>
                    </td>

                    {/* Document Type */}
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ 
                        background: c.badgeBg, 
                        color: c.badgeText, 
                        padding: '4px 10px', 
                        borderRadius: '16px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600 
                      }}>
                        {(req.document_type_name || '').replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Verification Action */}
                    <td style={{ padding: '1.25rem 1rem' }}>
                      {req.parent_verified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Verified
                        </span>
                      ) : (
                        req.ssn_card_image_path ? (
                          <span 
                            onClick={() => openModal('ssn', req)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#7a0c2e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            <AlertTriangle size={14} /> Verify SSN Card
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#888888', fontSize: '0.8rem' }}>
                            ID Needed
                          </span>
                        )
                      )}
                    </td>

                    {/* Payment Status */}
                    <td style={{ padding: '1.25rem 1rem' }}>
                      {req.payment_verified ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        req.receipt_image_path ? (
                          <span 
                            onClick={() => openModal('payment', req)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#d97706', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            <AlertTriangle size={14} /> View Receipt
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#888888', fontSize: '0.8rem' }}>
                            Awaiting Pay
                          </span>
                        )
                      )}
                    </td>

                    {/* Status Update Dropdown */}
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <select 
                        className="form-select" 
                        value={req.status} 
                        onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                        style={{ 
                          padding: '4px 10px', 
                          fontSize: '0.8rem', 
                          fontWeight: 600, 
                          borderRadius: '6px', 
                          border: `1px solid ${c.selectBorder}`, 
                          background: c.selectBg,
                          color: c.selectColor,
                          width: '130px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending_verification">Processing</option>
                        <option value="pending">Awaiting</option>
                        <option value="ready_for_pickup">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="denied">Denied</option>
                      </select>
                    </td>

                    {/* Actions Menu */}
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openModal('info', req)}
                          style={{ background: 'none', border: 'none', color: '#888888', cursor: 'pointer', padding: '4px' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRequest(req.request_id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="Delete Request"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1rem', borderTop: `1px solid ${c.border}`, backgroundColor: c.tableFooterBg }}>
          <span style={{ fontSize: '0.8rem', color: '#8e8b82', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Showing {filteredRequests.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
            <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                border: `1px solid ${c.border}`,
                background: c.tableFooterBg,
                fontSize: '0.8rem',
                color: c.textSub,
                cursor: 'pointer',
                outline: 'none',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
            per page
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                border: 'none',
                background: 'none',
                color: safeCurrentPage === 1 ? '#ccc' : '#7a0c2e',
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                padding: '0.25rem 0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Previous Page"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, idx) => {
              const pageNum = idx + 1;
              const isActive = safeCurrentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    border: 'none',
                    background: isActive ? '#7a0c2e' : 'none',
                    color: isActive ? '#ffffff' : '#8e8b82',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                border: 'none',
                background: 'none',
                color: safeCurrentPage === totalPages ? '#ccc' : '#7a0c2e',
                cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                padding: '0.25rem 0.5rem',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Next Page"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* ── VERIFICATION MODALS ── */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <div className="glass-panel modal-panel" style={{ borderTop: `4px solid ${activeModal === 'ssn' ? '#7a0c2e' : activeModal === 'payment' ? '#10b981' : '#3b82f6'}`, marginBottom: 0, background: c.cardBg, color: c.modalText }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: c.modalHeading, fontWeight: 700 }}>
                   {activeModal === 'ssn' && `Identity Verification`}
                   {activeModal === 'payment' && `Payment Verification`}
                   {activeModal === 'info' && `Request Details Dossier`}
                 </h3>
                 <p style={{ color: '#888888', fontSize: '0.85rem' }}>
                   {activeModal === 'info' ? `Document ID #${modalPayload?.request_id}` : `Action required for Document Request #${modalPayload?.request_id}`}
                 </p>
              </div>
              <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#888888', cursor: 'pointer' }}><XCircle size={28}/></button>
            </div>
            
            {(activeModal === 'ssn' || activeModal === 'payment') && (
               <>
                 <div style={{ backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', marginBottom: '2rem', minHeight: '300px', padding: '1rem', border: `1px solid ${c.border}` }}>
                   <img 
                     src={`http://localhost:3000/${activeModal === 'ssn' ? modalPayload?.ssn_card_image_path : modalPayload?.receipt_image_path}`} 
                     alt="Verification Document" 
                     style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }} 
                     onError={(e) => {
                       // fallback if file doesn't exist
                       e.target.src = "https://placehold.co/600x400/7a0c2e/ffffff?text=Document+Image";
                     }}
                   />
                 </div>
                 <div className="flex gap-4">
                     {activeModal === 'ssn' ? (
                       <>
                         <button onClick={handleApproveIdentity} className="btn-primary flex justify-center items-center gap-2 flex-1" style={{ fontSize: '1rem', background: '#7a0c2e', border: 'none', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                           <CheckCircle size={18}/> Formally Approve Identity
                         </button>
                         <button onClick={handleRejectIdentity} className="btn-secondary flex justify-center items-center gap-2 flex-1" style={{ fontSize: '1rem', background: c.deleteBtnBg, border: `1px solid ${c.border}`, color: '#ef4444', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                           <XCircle size={18}/> Reject Identity
                         </button>
                       </>
                     ) : (
                       <button onClick={handleApprovePayment} className="btn-primary flex justify-center items-center gap-2 flex-1" style={{ fontSize: '1rem', backgroundColor: '#10b981', borderColor: '#059669', color: '#ffffff' }}>
                         <CheckCircle size={18}/> Formally Approve Payment
                       </button>
                     )}
                  </div>
               </>
            )}

            {activeModal === 'info' && (
               <div>
                  <div className="flex-responsive" style={{ gap: '2rem', marginBottom: '2rem' }}>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ color: dk ? '#ffb4c4' : '#7a0c2e', marginBottom: '1rem', borderBottom: `1px solid ${c.border}`, paddingBottom: '0.5rem', fontWeight: 700 }}>Student Profile</h4>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>Name:</span> <strong style={{ color: c.textMain }}>{modalPayload?.student_full_name}</strong></p>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>BEMIS ID:</span> <strong style={{ color: c.textMain }}>{modalPayload?.student_bemis_id || 'N/A'}</strong></p>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>Class / Year:</span> <strong style={{ color: c.textMain }}>{modalPayload?.student_graduation_year_or_years_attended || 'N/A'}</strong></p>
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ color: dk ? '#ffb4c4' : '#7a0c2e', marginBottom: '1rem', borderBottom: `1px solid ${c.border}`, paddingBottom: '0.5rem', fontWeight: 700 }}>Request Meta</h4>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>Type:</span> <strong style={{ color: c.textMain, textTransform: 'capitalize' }}>{(modalPayload?.document_type_name || '').replace('_', ' ')}</strong></p>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>Delivery:</span> <strong style={{ color: c.textMain, textTransform: 'uppercase' }}>{modalPayload?.delivery_method}</strong></p>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}><span style={{ color: '#888888' }}>Submitted:</span> <strong style={{ color: c.textMain }}>{new Date(modalPayload?.request_date).toLocaleString()}</strong></p>
                     </div>
                  </div>
                  
                  {modalPayload?.form_data && (
                     <div style={{ background: c.tableFooterBg, padding: '1.5rem', borderRadius: '12px', border: `1px solid ${c.border}`, marginBottom: '2rem' }}>
                        <h4 style={{ color: c.textMain, marginBottom: '1rem', fontWeight: 700 }}>Form Payload Data</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem', color: c.textSub, background: 'transparent', padding: 0, margin: 0, fontFamily: 'inherit' }}>
                          {(() => {
                             try {
                                const parsed = typeof modalPayload.form_data === 'string' ? JSON.parse(modalPayload.form_data) : modalPayload.form_data;
                                return Object.entries(parsed).map(([k, v]) => `${k.toUpperCase()}:\n${v}`).join('\n\n');
                             } catch(e) {
                                return modalPayload.form_data;
                             }
                          })()}
                        </pre>
                     </div>
                  )}

                  {modalPayload?.generated_file_path ? (
                     <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                        <FileText size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                        <h4 style={{ color: '#34d399', marginBottom: '0.5rem', fontWeight: 700 }}>Automated PDF Prototype Prepared</h4>
                        <p style={{ color: '#666666', fontSize: '0.875rem', marginBottom: '1rem' }}>The system automatically generated a localized PDF document incorporating the signature.</p>
                        <a 
                          href={`http://localhost:3000/${modalPayload.generated_file_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-primary" 
                          style={{ width: 'auto', background: '#10b981', borderColor: '#059669', color: '#ffffff', display: 'inline-flex', textDecoration: 'none' }}
                        >
                           <Eye size={18} /> View PDF Document
                        </a>
                     </div>
                  ) : (
                     <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed #eaeaea', borderRadius: '12px' }}>
                        <p style={{ color: '#888888', fontSize: '0.9rem' }}>This document request did not trigger PDF scaffolding. (Requires Manual processing)</p>
                     </div>
                  )}
               </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default StaffDashboard;
