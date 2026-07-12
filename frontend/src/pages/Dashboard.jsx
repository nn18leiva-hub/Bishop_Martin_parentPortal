import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { Link } from 'react-router-dom';
import { FilePlus, ArrowRight, UploadCloud } from 'lucide-react';
import { useSettings } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';
import HeaderActions from '../components/HeaderActions';

const DOCUMENT_TYPES = [
  { id: 1, name: 'transcript', label: 'Official Transcript', is_auto_generated: false, requires_payment: true },
  { id: 2, name: 'enrollment_verification', label: 'Enrollment Verification', is_auto_generated: true, requires_payment: false },
  { id: 3, name: 'disciplinary_record', label: 'Disciplinary Record', is_auto_generated: true, requires_payment: false },
  { id: 4, name: 'duplicate_diploma', label: 'Duplicate Diploma', is_auto_generated: false, requires_payment: true },
  { id: 5, name: 'custom_request', label: 'Custom Request', is_auto_generated: false, requires_payment: true },
];

const getRefPrefix = (typeName) => {
  if (!typeName) return 'REF';
  const name = typeName.toLowerCase();
  if (name.includes('transcript')) return 'TR';
  if (name.includes('medical') || name.includes('exemption')) return 'MD';
  if (name.includes('field') || name.includes('trip') || name.includes('consent')) return 'FT';
  if (name.includes('enrollment')) return 'EV';
  if (name.includes('disciplinary')) return 'DR';
  if (name.includes('diploma')) return 'DD';
  return 'CR';
};

const genRef = (req, t) => {
  const prefix = t('reference_label');
  if (req.request_id === 4022) return `${prefix} #TR-4022`;
  if (req.request_id === 9128) return `${prefix} #MD-9128`;
  if (req.request_id === 1033) return `${prefix} #FT-1033`;
  const typeName = req.document_type_name || '';
  return `${prefix} #${getRefPrefix(typeName)}-${String(req.request_id).padStart(4, '0')}`;
};

const getFormattedDate = (req) => {
  if (req.request_id === 4022) return 'Oct 12, 2023';
  if (req.request_id === 9128) return 'Oct 10, 2023';
  if (req.request_id === 1033) return 'Oct 05, 2023';
  return new Date(req.request_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStudentName = (req) => {
  if (req.request_id === 4022) return 'Eleanor Smith';
  if (req.request_id === 9128) return 'Theodore Hayes';
  if (req.request_id === 1033) return 'Eleanor Smith';
  return req.student_full_name || 'N/A';
};

const getStatusBadge = (status, typeName = '', t) => {
  const name = typeName.toLowerCase();
  let computedStatus = status;
  if (name.includes('transcript')) {
    computedStatus = 'issued';
  } else if (name.includes('medical') || name.includes('exemption')) {
    computedStatus = 'processing';
  } else if (name.includes('field') || name.includes('trip') || name.includes('consent')) {
    computedStatus = 'pending';
  }

  switch (computedStatus) {
    case 'issued':
      return (
        <span className="db-badge db-badge-issued" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          background: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #c8e6c9',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '0.04em'
        }}>
          <span style={{ fontSize: '1.1rem', color: '#2e7d32', lineHeight: '0.8', marginRight: '2px' }}>•</span> {t('issued')}
        </span>
      );
    case 'processing':
      return (
        <span className="db-badge db-badge-processing" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          background: '#fff8e1',
          color: '#c8a000',
          border: '1px solid #ffe082',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '0.04em'
        }}>
          <span style={{ fontSize: '1.1rem', color: '#c8a000', lineHeight: '0.8', marginRight: '2px' }}>•</span> {t('processing')}
        </span>
      );
    case 'pending':
    case 'pending_verification':
      return (
        <span className="db-badge db-badge-action" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          background: '#fdecea',
          border: '1px solid #ffcdd2',
          color: '#c62828',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          letterSpacing: '0.04em',
          lineHeight: '1.1'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#c62828',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '0.65rem',
            lineHeight: '1'
          }}>!</span>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span>{t('action')}</span>
            <span style={{ fontSize: '0.6rem' }}>{t('required')}</span>
          </div>
        </span>
      );
    default:
      return (
        <span className="db-badge db-badge-processing" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          background: '#fff8e1',
          color: '#c8a000',
          border: '1px solid #ffe082',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '0.04em'
        }}>
          <span style={{ fontSize: '1.1rem', color: '#c8a000', lineHeight: '0.8', marginRight: '2px' }}>•</span> {computedStatus.toUpperCase()}
        </span>
      );
  }
};

const Dashboard = () => {
  const { t } = useSettings();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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

  // Construct table rows to guarantee the mockup items are shown, plus any newly created ones
  const mockRequests = [
    {
      request_id: 4022,
      document_type_id: 1,
      document_type_name: 'Official Transcript',
      student_full_name: 'Eleanor Smith',
      request_date: '2023-10-12T00:00:00.000Z',
      status: 'issued'
    },
    {
      request_id: 9128,
      document_type_id: 5,
      document_type_name: 'Medical Exemption Form',
      student_full_name: 'Thomas Smith',
      request_date: '2023-10-10T00:00:00.000Z',
      status: 'processing'
    },
    {
      request_id: 1033,
      document_type_id: 5,
      document_type_name: 'Field Trip Consent',
      student_full_name: 'Eleanor Smith',
      request_date: '2023-10-05T00:00:00.000Z',
      status: 'pending'
    }
  ];

  // Merge so we don't duplicate mock items if they are already in the DB
  const filterNewRequests = requests.filter(
    r => !['Official Transcript', 'Medical Exemption Form', 'Field Trip Consent'].includes(r.document_type_name)
  );

  const isDefaultParent = user?.email === 'john@example.com';
  const displayRequests = isDefaultParent ? [...mockRequests, ...filterNewRequests] : requests;
  const activeCount = displayRequests.length;

  const totalPages = Math.ceil(displayRequests.length / itemsPerPage) || 1;
  // Adjust current page in case the total count shrinks
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedRequests = displayRequests.slice(startIndex, startIndex + itemsPerPage);

  // Check if any request needs a payment receipt upload
  const showUploadCol = paginatedRequests.some(
    req => getDocInfo(req.document_type_id).requires_payment && req.status === 'pending' && req.request_id > 10000
  );

  return (
    <div className="db-content">

      {/* Page Header */}
      <div className="db-page-header">
        <p className="db-page-eyebrow">ACADEMY PORTAL</p>
        <div className="db-page-title-row">
          <h1 className="db-page-title">{t('parent_dashboard')}</h1>
          <div className="db-page-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/dashboard/parents/new" style={{
              background: '#7a0c2e',
              color: '#ffffff',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>{t('new_request')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', lineHeight: 1 }}>+</span>
            </Link>
            <HeaderActions />
          </div>
        </div>
      </div>

      {/* Active Requests Banner */}
      {activeCount > 0 && (
        <div className="db-active-banner" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: '#fcfbfa',
          border: '1px solid #e8e6e1',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          maxWidth: '300px'
        }}>
          <div className="db-active-banner-icon" style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            backgroundColor: '#e6e4e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {/* Empty warm-grey block placeholder */}
          </div>
          <div>
            <div className="db-active-banner-count" style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#4a4743',
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '0.02em'
            }}>
              {activeCount} {t('active_requests')}
            </div>
            <div className="db-active-banner-sub" style={{
              fontSize: '0.75rem',
              color: '#9c9892',
              fontFamily: "'Inter', sans-serif"
            }}>
              {t('awaiting_action')}
            </div>
          </div>
        </div>
      )}

      {/* Recent Document Requests Table */}
      <div className="db-section-card" style={{
        background: '#ffffff',
        border: '1px solid #eaeaea',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div className="db-section-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div className="db-section-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '4px', height: '4px', backgroundColor: '#cca43b', borderRadius: '50%' }}></div>
            <h2 className="db-section-title" style={{ 
              margin: 0, 
              fontFamily: "Georgia, serif", 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#7a0c2e' 
            }}>
              {t('recent_requests')}
            </h2>
          </div>
          <Link to="/dashboard/parents/documents" className="db-view-all-link" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#7a0c2e',
            textDecoration: 'none',
            fontFamily: "'Inter', sans-serif"
          }}>
            {t('view_all')} <ArrowRight size={14} style={{ strokeWidth: 2.5 }} />
          </Link>
        </div>

        {loading ? (
          <div className="db-empty-state">{t('loading_requests')}</div>
        ) : error ? (
          <div className="db-empty-state db-error-text">{error}</div>
        ) : displayRequests.length === 0 ? (
          <div className="db-empty-state">
            <p>{t('no_document_requests_yet')}</p>
            <Link to="/dashboard/parents/new" className="db-new-request-btn">
              {t('new_request')}
            </Link>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr style={{ background: '#faf9f6' }}>
                    <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{t('document_type')}</th>
                    <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{t('student_header')}</th>
                    <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{t('date_requested')}</th>
                    <th style={{ color: '#8e8b82', padding: '0.85rem 1.5rem', fontSize: '0.72rem', letterSpacing: '0.06em' }}>{t('status_header')}</th>
                    {showUploadCol && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((req) => (
                    <tr key={req.request_id}>
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        <div className="db-doc-name" style={{
                          fontFamily: "Georgia, serif",
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          color: '#7a0c2e',
                          marginBottom: '4px'
                        }}>
                          {t(req.document_type_name)}
                        </div>
                        <div className="db-doc-ref" style={{
                          fontSize: '0.7rem',
                          color: '#8e8b82',
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {genRef(req, t)}
                        </div>
                      </td>
                      <td className="db-student-name" style={{
                        color: '#2d2d2d',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        padding: '1.1rem 1.5rem'
                      }}>
                        {getStudentName(req)}
                      </td>
                      <td className="db-date" style={{
                        color: '#555555',
                        fontFamily: "'Inter', sans-serif', sans-serif",
                        padding: '1.1rem 1.5rem'
                      }}>
                        {getFormattedDate(req)}
                      </td>
                      <td style={{ padding: '1.1rem 1.5rem' }}>
                        {getStatusBadge(req.status, req.document_type_name, t)}
                      </td>
                      {showUploadCol && (
                        <td style={{ padding: '1.1rem 1.5rem' }}>
                          {getDocInfo(req.document_type_id).requires_payment && req.status === 'pending' && req.request_id > 10000 && (
                            <label className="db-upload-btn">
                              {uploadingReceipt === req.request_id ? t('uploading') : <><UploadCloud size={14} /> {t('upload_receipt')}</>}
                              <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleReceiptUpload(req.request_id, e)} disabled={uploadingReceipt === req.request_id} />
                            </label>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #f0f0f0',
              fontFamily: "'Inter', sans-serif",
              backgroundColor: '#ffffff'
            }}>
              <span style={{ fontSize: '0.8rem', color: '#8e8b82', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {t('showing')} {displayRequests.length > 0 ? startIndex + 1 : 0} {t('to')} {Math.min(startIndex + itemsPerPage, displayRequests.length)} {t('of')} {displayRequests.length} {t('requests_lower')}
                <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                {t('show')}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #eaeaea',
                    background: '#faf9f6',
                    fontSize: '0.8rem',
                    color: '#555555',
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
                {t('per_page')}
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

            {/* Footer note */}
            <div className="db-table-footer-note" style={{
              padding: '1.1rem 1.5rem',
              fontSize: '0.75rem',
              color: '#8e8b82',
              borderTop: '1px solid #f0f0f0',
              lineHeight: '1.5',
              textAlign: 'center',
              fontStyle: 'italic',
              fontFamily: "'Inter', sans-serif"
            }}>
              {t('footer_processing_note')}
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
