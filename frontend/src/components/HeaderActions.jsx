import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Sun, Moon, Check, XCircle, CheckCircle, Globe } from 'lucide-react';
import { useSettings } from '../contexts/ThemeLanguageContext';

const HeaderActions = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Simulated notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New official transcript request submitted by John Doe", read: false, time: "5m ago" },
    { id: 2, text: "Payment receipt uploaded for request #TR-4022", read: false, time: "20m ago" },
    { id: 3, text: "Verification card approved for Theodore Hayes", read: true, time: "2h ago" },
    { id: 4, text: "System security backup completed successfully", read: true, time: "1d ago" }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
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
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color, #2c2c2c)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: '#7a0c2e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => toggleRead(n.id)}
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderBottom: '1px solid #f9f9f9', 
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(122,12,46,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.8rem', color: n.read ? '#666' : '#222', fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>
                    {n.text}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: '#aaa' }}>{n.time}</span>
                </div>
              ))}
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
