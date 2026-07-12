import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Settings, Sun, Moon, Check, XCircle, CheckCircle, Globe } from 'lucide-react';
import { useSettings } from '../contexts/ThemeLanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';

const HeaderActions = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  const { user } = useAuth();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [parentRequests, setParentRequests] = useState([]);
  const [staffPendingParents, setStaffPendingParents] = useState([]);
  const [staffPendingRequests, setStaffPendingRequests] = useState([]);

  const [readNotificationIds, setReadNotificationIds] = useState([]);

  useEffect(() => {
    if (!user) return;

    if (user.type === 'parent' || user.type === 'past_student') {
      const loadParentReqs = () => {
        apiFetch('/requests/my-requests')
          .then(data => {
            setParentRequests(Array.isArray(data) ? data : []);
          })
          .catch(err => console.error('Failed to load notifications requests:', err));
      };
      
      loadParentReqs();
      const interval = setInterval(loadParentReqs, 15000);
      return () => clearInterval(interval);
    } else if (user.type === 'staff') {
      const loadStaffData = () => {
        apiFetch('/staff/pending-parents')
          .then(data => {
            setStaffPendingParents(Array.isArray(data) ? data : []);
          })
          .catch(err => console.error('Failed to load pending parents for notifications:', err));

        apiFetch('/staff/requests')
          .then(data => {
            setStaffPendingRequests(Array.isArray(data) ? data : []);
          })
          .catch(err => console.error('Failed to load requests for notifications:', err));


      };

      loadStaffData();
      const interval = setInterval(loadStaffData, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Dynamically compute notifications specific to the logged-in user
  const notifications = useMemo(() => {
    if (!user) return [];

    if (user.type === 'staff') {
      // Administrative notifications based on real DB items
      const list = [];

      // 1. Parents awaiting identity verification notifications
      staffPendingParents.forEach(p => {
        list.push({
          id: `staff-parent-ver-${p.parent_id}`,
          text: `Identity Verification Required: parent "${p.full_name}" submitted their SSN Card.`,
          read: false,
          time: "Pending Review"
        });
      });

      // 2. Pending payment verification requests
      staffPendingRequests.forEach(req => {
        if (req.requires_payment && !req.payment_verified && req.receipt_image_path) {
          list.push({
            id: `staff-payment-val-${req.request_id}`,
            text: `Payment Approval Required: New receipt uploaded for ${req.student_full_name} (${(req.document_type_name || '').replace(/_/g, ' ')})`,
            read: false,
            time: "Awaiting Validation"
          });
        }
      });



      return list.map(n => ({
        ...n,
        read: readNotificationIds.includes(n.id) ? true : n.read
      }));
    }

    // Parent / Past Student specific notifications
    const list = [];
    let idCounter = 1;

    // 1. Identity Verification Notification
    if (user.verified) {
      list.push({
        id: `parent-ver-${idCounter++}`,
        text: t('notif_identity_approved').replace('{name}', user.full_name),
        read: false,
        time: t('time_just_now')
      });
    } else if (user.ssn_card_image_path) {
      list.push({
        id: `parent-ver-${idCounter++}`,
        text: t('notif_identity_pending'),
        read: false,
        time: t('time_10m_ago')
      });
    } else {
      list.push({
        id: `parent-ver-${idCounter++}`,
        text: t('notif_identity_required'),
        read: false,
        time: t('time_1h_ago')
      });
    }

    // 2. Document Request Status Notifications
    parentRequests.forEach(req => {
      const docName = t(req.document_type_name) || (req.document_type_name || '').replace(/_/g, ' ').toUpperCase();
      const studentName = req.student_full_name;

      if (req.status === 'ready_for_pickup') {
        list.push({
          id: `parent-req-${req.request_id}`,
          text: t('notif_ready_for_pickup').replace('{doc}', docName).replace('{student}', studentName),
          read: false,
          time: t('time_recently')
        });
      } else if (req.status === 'denied') {
        list.push({
          id: `parent-req-${req.request_id}`,
          text: t('notif_denied').replace('{doc}', docName).replace('{student}', studentName),
          read: false,
          time: t('time_recently')
        });
      } else if (req.status === 'pending_verification') {
        list.push({
          id: `parent-req-${req.request_id}`,
          text: t('notif_under_verification').replace('{doc}', docName).replace('{student}', studentName),
          read: true,
          time: t('time_1h_ago')
        });
      } else if (req.status === 'pending' && req.requires_payment && !req.payment_verified && !req.receipt_image_path) {
        list.push({
          id: `parent-req-${req.request_id}`,
          text: t('notif_upload_receipt').replace('{doc}', docName),
          read: false,
          time: t('time_recently')
        });
      }
    });

    return list.map(n => ({
      ...n,
      read: readNotificationIds.includes(n.id) ? true : n.read
    }));
  }, [user, parentRequests, staffPendingParents, staffPendingRequests, readNotificationIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
  };

  const toggleRead = (id) => {
    setReadNotificationIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Click outside to close notifications dropdown
  const notificationsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
      
      {/* ── Notification Bell ── */}
      <div ref={notificationsRef} style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ 
            border: '1px solid var(--border-color, #e2e2e5)', 
            background: 'var(--card-bg, #ffffff)', 
            color: 'var(--text-color, #333333)',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              top: 4, 
              right: 4, 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: '#ef4444' 
            }}></span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="mock-card" style={{
            position: 'absolute',
            top: '48px',
            right: 0,
            width: '320px',
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #eaeaea)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            zIndex: 1000,
            padding: '1rem 0',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem 0.75rem 1rem', borderBottom: '1px solid #eaeaea' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color, #2c2c2c)' }}>{t('notifications')}</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: '#7a0c2e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {t('mark_all_read')}
                </button>
              )}
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {notifications.filter(n => !n.read).length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#888888', fontSize: '0.8rem' }}>
                  {t('no_new_notifications')}
                </div>
              ) : (
                notifications.filter(n => !n.read).map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => toggleRead(n.id)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      borderBottom: '1px solid #f9f9f9', 
                      cursor: 'pointer',
                      background: 'rgba(122,12,46,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#222222', fontWeight: 600, lineHeight: 1.4 }}>
                      {n.text}
                    </p>
                    <span style={{ fontSize: '0.68rem', color: '#888888' }}>{n.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Settings Cog ── */}
      <button 
        onClick={() => setShowSettings(true)}
        style={{ 
          border: '1px solid var(--border-color, #e2e2e5)', 
          background: 'var(--card-bg, #ffffff)', 
          color: 'var(--text-color, #333333)',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Settings"
      >
        <Settings size={18} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 2000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1rem',
          backdropFilter: 'blur(4px)' 
        }}>
          <div className="modal-panel" style={{ 
            background: 'var(--card-bg, #ffffff)', 
            borderRadius: 14, 
            padding: '2rem', 
            width: '100%', 
            maxWidth: '420px', 
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            position: 'relative',
            borderTop: '4px solid #7a0c2e'
          }}>
            <button 
              onClick={() => setShowSettings(false)} 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
            >
              <XCircle size={22} />
            </button>

            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-color, #2c2c2c)', marginBottom: '1.5rem', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="#7a0c2e" /> System Settings
            </h3>

            {/* Language Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color, #444)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Globe size={15} /> System Language
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { code: 'en', name: 'English' },
                  { code: 'es', name: 'Español' },
                  { code: 'bz', name: 'Kriol (BZ)' },
                  { code: 'fr', name: 'Français' }
                ].map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: language === lang.code ? '#7a0c2e' : '#e5e7eb',
                      background: language === lang.code ? 'rgba(122, 12, 46, 0.08)' : 'transparent',
                      color: language === lang.code ? '#7a0c2e' : 'var(--text-color, #555)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    {lang.name}
                    {language === lang.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Light / Dark Mode Toggle */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color, #444)', display: 'block', marginBottom: 8 }}>
                Theme Customization
              </label>
              <button
                onClick={toggleTheme}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e5e7eb',
                  background: 'transparent',
                  color: 'var(--text-color, #444)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} /> Switch to Dark Mode
                  </>
                ) : (
                  <>
                    <Sun size={16} /> Switch to Light Mode
                  </>
                )}
              </button>
            </div>

            {/* Action buttons */}
            <button 
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: '#7a0c2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Apply Changes
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default HeaderActions;
