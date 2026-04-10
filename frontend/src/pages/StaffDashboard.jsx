import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { LogOut, Eye, CheckCircle, XCircle, FileText, Activity, Users, FileCheck, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (user && user.type === 'staff') {
       loadRequests(); 
       const interval = setInterval(() => {
          apiFetch('/staff/requests').then(data => {
            setRequests(Array.isArray(data) ? data : []);
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
        body: JSON.stringify({ parent_id: modalPayload.parent_id })
      });
      setActiveModal(null);
      loadRequests();
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

  const pendingVerificationCount = requests.filter(r => r.status === 'pending_verification').length;
  const pendingProcessingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="animate-up">
      <div className="flex flex-responsive justify-between items-start mb-6 gap-2">
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Staff Portal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Administrative overview of all document applications.</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="form-grid form-grid-3 mb-12">
         <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #3b82f6', marginBottom: 0 }}>
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px' }}>
               <FileText size={28} color="#3b82f6" />
            </div>
            <div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Requests</p>
               <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{requests.length}</h3>
            </div>
         </div>
         
         <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
            <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px' }}>
               <Users size={28} color="#f59e0b" />
            </div>
            <div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Validating</p>
               <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{pendingVerificationCount}</h3>
            </div>
         </div>

         <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #10b981', marginBottom: 0 }}>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
               <FileCheck size={28} color="#10b981" />
            </div>
            <div>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Processing</p>
               <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{pendingProcessingCount}</h3>
            </div>
         </div>
      </div>

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {dataLoading ? (
            <div className="p-4 text-center">Loading requests...</div>
          ) : error ? (
            <div className="p-4 text-center error-text">{error}</div>
          ) : (
            <>
              {/* MOBILE VIEW CARDS */}
              <div className="mobile-view flex-col gap-6" style={{ padding: '1rem' }}>
                {requests.map(req => (
                  <div key={`m-${req.request_id}`} className="request-card" style={{ padding: '1.25rem', marginBottom: 0, borderTop: '4px solid #3b82f6' }}>
                    <div className="flex justify-between items-start mb-2">
                       <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>#{req.request_id}</span>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.request_date).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', color: '#fff' }}>{req.student_full_name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>P: {req.parent_email}</p>
                    
                    <div className="flex gap-2 items-center mb-4 flex-wrap">
                       <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                         {(req.document_type_name || "").replace('_', ' ')}
                       </span>
                       <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', border: '1px solid var(--glass-border)', padding: '2px 8px', borderRadius: '4px' }}>
                         {req.delivery_method}
                       </span>
                    </div>

                    <div className="flex flex-col gap-2 mb-4">
                       {!req.parent_verified ? (
                         req.ssn_card_image_path ? (
                           <button onClick={() => openModal('ssn', req)} className="btn-primary" style={{ padding: '8px', fontSize: '0.85rem' }}>
                             <Eye size={16}/> Verify ID
                           </button>
                         ) : (
                           <div className="status-badge text-center" style={{ width: '100%' }}>ID Needed</div>
                         )
                       ) : (
                         <div className="status-badge ready_for_pickup text-center mb-1">ID Verified ✅</div>
                       )}

                       {req.requires_payment && (
                         !req.payment_verified ? (
                           req.receipt_image_path ? (
                             <button onClick={() => openModal('payment', req)} className="btn-secondary" style={{ padding: '8px', fontSize: '0.85rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                               <Eye size={16}/> Verify Pay
                             </button>
                           ) : (
                             <div className="status-badge text-center" style={{ width: '100%' }}>Awaiting Pay</div>
                           )
                         ) : (
                             <div className="status-badge ready_for_pickup text-center">Paid ✅</div>
                         )
                       )}
                    </div>

                    <div className="flex flex-col gap-2">
                       <select 
                         className="form-select" 
                         value={req.status} 
                         onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                         style={{ padding: '8px', fontSize: '0.875rem', fontWeight: 600, color: req.status === 'ready_for_pickup' ? '#34d399' : '#fff' }}
                       >
                         <option value="pending_verification">Pending ID</option>
                         <option value="pending">Pending</option>
                         <option value="ready_for_pickup">Ready / Mailed</option>
                         <option value="completed">Completed</option>
                         <option value="denied">Denied</option>
                       </select>
                       
                       <button onClick={() => openModal('info', req)} className="btn-secondary" style={{ padding: '8px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>
                         <Info size={16}/> View Details
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW TABLE */}
              <div className="desktop-block" style={{ overflowX: 'auto', width: '100%' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Request Info</th>
                      <th>Date / Delivery</th>
                      <th>Verifications Action</th>
                      <th>Status Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.request_id}>
                        <td style={{ fontWeight: 600 }}>#{req.request_id}</td>
                        <td>
                          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '1.05rem', color: '#fff' }}>{req.student_full_name}</strong>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                             <span style={{ 
                               background: 'rgba(59, 130, 246, 0.15)', 
                               color: '#60a5fa',
                               padding: '2px 8px', 
                               borderRadius: '4px', 
                               fontSize: '0.75rem',
                               border: '1px solid rgba(59, 130, 246, 0.3)',
                               textTransform: 'uppercase',
                               fontWeight: 600
                             }}>
                               {(req.document_type_name || "").replace('_', ' ')}
                             </span>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Parent: {req.parent_email}</span>
                          </div>
                          <button onClick={() => openModal('info', req)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', margin: 0, width: 'auto', background: 'rgba(255,255,255,0.05)' }}>
                             <Info size={12}/> View Deep-Dive Info
                          </button>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}>{new Date(req.request_date).toLocaleDateString()}</div>
                          <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{req.delivery_method}</span>
                        </td>
                        <td>
                          <div className="flex flex-col gap-2">
                            {/* Parent SSN Verification */}
                            {!req.parent_verified ? (
                              req.ssn_card_image_path ? (
                                <button onClick={() => openModal('ssn', req)} className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto', margin: 0, display: 'flex', gap: '6px', alignItems: 'center', background: '#3b82f6', border: '1px solid #2563eb' }}>
                                  <Eye size={14}/> Verify Parent ID
                                </button>
                              ) : (
                                <span className="status-badge" style={{ fontSize: '0.65rem' }}>ID Needed</span>
                              )
                            ) : (
                              <span className="status-badge ready_for_pickup" style={{ fontSize: '0.65rem', display: 'inline-block' }}>ID Verified ✅</span>
                            )}
  
                            {/* Payment Verification */}
                            {req.requires_payment && (
                               !req.payment_verified ? (
                                 req.receipt_image_path ? (
                                   <button onClick={() => openModal('payment', req)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem', width: 'auto', margin: 0, display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                     <Eye size={14}/> Verify Payment
                                   </button>
                                 ) : (
                                   <span className="status-badge" style={{ fontSize: '0.65rem', display: 'inline-block' }}>Awaiting Money</span>
                                 )
                               ) : (
                                   <span className="status-badge ready_for_pickup" style={{ fontSize: '0.65rem', display: 'inline-block' }}>Paid ✅</span>
                               )
                             )}
                          </div>
                        </td>
                        <td>
                          <select 
                            className="form-select" 
                            value={req.status} 
                            onChange={(e) => handleStatusChange(req.request_id, e.target.value)}
                            style={{ padding: '6px', fontSize: '0.875rem', width: '150px', background: 'rgba(0,0,0,0.4)', fontWeight: 600, color: req.status === 'ready_for_pickup' ? '#34d399' : '#fff' }}
                          >
                            <option value="pending_verification">Pending ID</option>
                            <option value="pending">Pending</option>
                            <option value="ready_for_pickup">Ready / Mailed</option>
                            <option value="completed">Completed</option>
                            <option value="denied">Denied</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

      {/* VERIFICATION MODALS */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '1rem' }}>
          <div className="glass-panel modal-panel" style={{ borderTop: `4px solid ${activeModal === 'ssn' ? '#4f46e5' : activeModal === 'payment' ? '#10b981' : '#3b82f6'}`, marginBottom: 0 }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: '#fff' }}>
                   {activeModal === 'ssn' && `Identity Verification`}
                   {activeModal === 'payment' && `Payment Verification`}
                   {activeModal === 'info' && `Request Details Dossier`}
                 </h3>
                 <p style={{ color: 'var(--text-muted)' }}>
                   {activeModal === 'info' ? `Document ID #${modalPayload?.request_id}` : `Action required for Document Request #${modalPayload?.request_id}`}
                 </p>
              </div>
              <button className="btn-secondary" onClick={() => setActiveModal(null)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: '#fff' }}><XCircle size={28}/></button>
            </div>
            
            {(activeModal === 'ssn' || activeModal === 'payment') && (
               <>
                 <div style={{ backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', marginBottom: '2rem', minHeight: '300px', padding: '1rem', border: '1px solid var(--glass-border)' }}>
                   <img 
                     src={`http://localhost:3000/${activeModal === 'ssn' ? modalPayload?.ssn_card_image_path : modalPayload?.receipt_image_path}`} 
                     alt="Verification Document" 
                     style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }} 
                   />
                 </div>
                 <div className="flex gap-4">
                    {activeModal === 'ssn' ? (
                      <button onClick={handleApproveIdentity} className="btn-primary flex justify-center items-center gap-2 flex-1" style={{ fontSize: '1.125rem' }}>
                        <CheckCircle size={20}/> Formally Approve Identity
                      </button>
                    ) : (
                      <button onClick={handleApprovePayment} className="btn-primary flex justify-center items-center gap-2 flex-1" style={{ fontSize: '1.125rem', backgroundColor: '#10b981', borderColor: '#059669' }}>
                        <CheckCircle size={20}/> Formally Approve Payment
                      </button>
                    )}
                 </div>
               </>
            )}

            {activeModal === 'info' && (
               <div>
                  <div className="flex-responsive" style={{ gap: '2rem', marginBottom: '2rem' }}>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#60a5fa', marginBottom: '1rem', borderBottom: '1px solid rgba(96, 165, 250, 0.2)', paddingBottom: '0.5rem' }}>Student Profile</h4>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Name:</span> <strong style={{ color: '#fff' }}>{modalPayload?.student_full_name}</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>BEMIS ID:</span> <strong style={{ color: '#fff' }}>{modalPayload?.student_bemis_id || 'N/A'}</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Class / Year:</span> <strong style={{ color: '#fff' }}>{modalPayload?.student_graduation_year_or_years_attended || 'N/A'}</strong></p>
                     </div>
                     <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#60a5fa', marginBottom: '1rem', borderBottom: '1px solid rgba(96, 165, 250, 0.2)', paddingBottom: '0.5rem' }}>Request Meta</h4>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{(modalPayload?.document_type_name || '').replace('_', ' ')}</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Delivery:</span> <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{modalPayload?.delivery_method}</strong></p>
                        <p style={{ marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Submitted:</span> <strong style={{ color: '#fff' }}>{new Date(modalPayload?.request_date).toLocaleString()}</strong></p>
                     </div>
                  </div>
                  
                  {modalPayload?.form_data && (
                     <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                        <h4 style={{ color: '#c4b5fd', marginBottom: '1rem' }}>Form Payload Data</h4>
                        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875rem', color: '#e2e8f0', background: 'transparent', padding: 0, margin: 0, fontFamily: 'inherit' }}>
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
                        <h4 style={{ color: '#34d399', marginBottom: '0.5rem' }}>Automated PDF Prototype Prepared</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>The system automatically generated a localized PDF document incorporating the signature.</p>
                        <a 
                          href={`http://localhost:3000/${modalPayload.generated_file_path}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-primary" 
                          style={{ width: 'auto', background: '#10b981', borderColor: '#059669', display: 'inline-flex' }}
                        >
                           <Eye size={18} /> View PDF Document
                        </a>
                     </div>
                  ) : (
                     <div style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>This document request did not trigger PDF scaffolding. (Requires Manual processing)</p>
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
