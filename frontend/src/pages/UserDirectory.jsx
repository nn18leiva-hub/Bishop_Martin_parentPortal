import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Filter, KeyRound, XCircle, CheckCircle,
  Users, ShieldCheck, UserX, Download
} from 'lucide-react';

/* ──────────────────────────────────────────
   Badge helpers
────────────────────────────────────────── */
const VerifiedBadge = ({ verified }) =>
  verified ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      <CheckCircle size={11} /> Verified
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      <UserX size={11} /> Unverified
    </span>
  );

const TypeBadge = ({ type }) =>
  type === 'past_student' ? (
    <span style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      Past Student
    </span>
  ) : (
    <span style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      Parent
    </span>
  );

/* ──────────────────────────────────────────
   Password Override Modal
────────────────────────────────────────── */
const OverrideModal = ({ target, onClose, onSuccess }) => {
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (pwd.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true); setErr('');
    try {
      await apiFetch('/superadmin/override-password', {
        method: 'POST',
        body: JSON.stringify({ targetEmail: target.email, newPassword: pwd })
      });
      onSuccess(`Password updated for ${target.email}`);
      onClose();
    } catch (e) {
      setErr(e.message || 'Override failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
          <XCircle size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={20} color="#d97706" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a1a' }}>Override Password</h3>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>{target.full_name}</p>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.25rem' }}>
          Set a new temporary password for <strong>{target.email}</strong>. The user should change it after logging in.
        </p>

        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>New Password</label>
        <input
          type="text"
          placeholder="e.g. Temp1234!"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setErr(''); }}
          style={{ width: '100%', border: '1.5px solid #ddd', borderRadius: 8, padding: '0.65rem 0.9rem', fontSize: '0.95rem', outline: 'none', marginBottom: 8, fontFamily: 'inherit' }}
        />
        {err && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: 8 }}>{err}</p>}

        <button
          onClick={submit}
          disabled={loading || pwd.length < 6}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: 8, border: 'none',
            background: pwd.length >= 6 ? '#7a0c2e' : '#e5e7eb',
            color: pwd.length >= 6 ? '#fff' : '#aaa',
            fontWeight: 700, fontSize: '0.9rem', cursor: pwd.length >= 6 ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s', marginTop: 4
          }}
        >
          {loading ? 'Updating…' : 'Set Password'}
        </button>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────
   Main Component
────────────────────────────────────────── */
const UserDirectory = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('all');   // all | parent | past_student
  const [filterVerified, setFilterVerified] = useState('all'); // all | verified | unverified

  const [overrideTarget, setOverrideTarget] = useState(null);
  const [toast, setToast]             = useState('');

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/superadmin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadUsers(); }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list = users;
    if (filterType !== 'all') list = list.filter(u => u.user_type === filterType);
    if (filterVerified === 'verified')   list = list.filter(u => u.verified);
    if (filterVerified === 'unverified') list = list.filter(u => !u.verified);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').includes(q)
      );
    }
    return list;
  }, [users, search, filterType, filterVerified]);

  /* ── Avatar initials ── */
  const initials = (name) => name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U';

  /* ── Avatar colour based on name hash ── */
  const avatarColor = (name) => {
    const colors = ['#7a0c2e','#6366f1','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899'];
    let hash = 0;
    for (let c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['ID','Name','Email','Type','Verified','Phone','DOB','Joined'];
    const rows = filtered.map(u => [
      u.id, u.full_name, u.email, u.user_type,
      u.verified ? 'Yes' : 'No',
      u.phone || '',
      u.dob ? new Date(u.dob).toLocaleDateString() : '',
      new Date(u.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `user-directory-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 300,
          background: '#1a1a1a', color: '#fff', borderRadius: 10, padding: '0.75rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          fontSize: '0.875rem', fontWeight: 600, animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle size={16} color="#10b981" /> {toast}
        </div>
      )}

      {/* Page Header */}
      <div className="db-page-header" style={{ marginBottom: '1.75rem' }}>
        <div className="db-page-eyebrow">ADMINISTRATION</div>
        <div className="db-page-title-row">
          <h1 className="db-page-title">User Directory</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={exportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid #ddd', background: '#fff', color: '#444', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
        <p style={{ color: '#888', fontSize: '0.875rem', marginTop: 4 }}>
          {users.length} registered accounts · {users.filter(u => u.verified).length} verified
        </p>
      </div>

      {/* Summary Chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'All Users',     count: users.length,                              key: 'all',          color: '#6366f1' },
          { label: 'Parents',       count: users.filter(u => u.user_type === 'parent').length, key: 'parent', color: '#3b82f6' },
          { label: 'Past Students', count: users.filter(u => u.user_type === 'past_student').length, key: 'past_student', color: '#8b5cf6' },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setFilterType(chip.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.4rem 1rem', borderRadius: 20, border: '1.5px solid',
              borderColor: filterType === chip.key ? chip.color : '#e5e7eb',
              background: filterType === chip.key ? chip.color + '15' : '#fff',
              color: filterType === chip.key ? chip.color : '#666',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            <Users size={13} />
            {chip.label}
            <span style={{
              background: filterType === chip.key ? chip.color : '#f0f0f0',
              color: filterType === chip.key ? '#fff' : '#666',
              borderRadius: 20, padding: '0 7px', fontSize: '0.7rem', fontWeight: 700
            }}>{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Search & Filter bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '0.55rem 0.9rem' }}>
          <Search size={15} color="#aaa" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '100%', fontFamily: 'inherit', color: '#222' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', display: 'flex' }}>
              <XCircle size={15} />
            </button>
          )}
        </div>

        <select
          value={filterVerified}
          onChange={e => setFilterVerified(e.target.value)}
          style={{ padding: '0.55rem 0.9rem', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: '0.875rem', color: '#444', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="all">All verification</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>
      </div>

      {/* Result count */}
      <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.75rem' }}>
        Showing {filtered.length} of {users.length} users
      </p>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#999' }}>
          <div className="db-loading-spinner" style={{ marginRight: 12 }}></div> Loading users…
        </div>
      ) : error ? (
        <div style={{ padding: '1.5rem', color: '#ef4444', background: '#fff5f5', borderRadius: 10, border: '1px solid #fecaca' }}>
          {error}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {/* Desktop table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', display: 'table' }} className="ud-table">
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #eaeaea' }}>
                {['User', 'Email', 'Type', 'Status', 'Phone', 'Joined', isSuperAdmin ? 'Actions' : ''].filter(Boolean).map(h => (
                  <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#aaa' }}>
                    No users match your search or filters.
                  </td>
                </tr>
              ) : filtered.map((u, idx) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid #f5f5f5',
                    transition: 'background 0.1s',
                    cursor: 'default',
                    background: idx % 2 === 0 ? '#fff' : '#fafafa'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9f5f6'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                >
                  {/* User cell */}
                  <td style={{ padding: '0.9rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: avatarColor(u.full_name),
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                      }}>
                        {initials(u.full_name)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a' }}>{u.full_name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#aaa' }}>ID #{u.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: '#555' }}>{u.email}</td>

                  {/* Type */}
                  <td style={{ padding: '0.9rem 1rem' }}><TypeBadge type={u.user_type} /></td>

                  {/* Verified */}
                  <td style={{ padding: '0.9rem 1rem' }}><VerifiedBadge verified={u.verified} /></td>

                  {/* Phone */}
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem', color: u.phone ? '#555' : '#ccc' }}>
                    {u.phone || '—'}
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>

                  {/* Actions */}
                  {isSuperAdmin && (
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <button
                        onClick={() => setOverrideTarget(u)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '0.4rem 0.85rem', borderRadius: 6,
                          border: '1.5px solid rgba(245,158,11,0.3)',
                          background: 'rgba(245,158,11,0.07)',
                          color: '#d97706', fontWeight: 600, fontSize: '0.78rem',
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.07)'}
                      >
                        <KeyRound size={13} /> Reset pw
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile card list (hidden on desktop) */}
          <div className="ud-mobile">
            {filtered.length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#aaa' }}>No users found</p>
            ) : filtered.map(u => (
              <div key={u.id} style={{ padding: '1.1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: avatarColor(u.full_name), color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, flexShrink: 0
                }}>
                  {initials(u.full_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a', marginBottom: 2 }}>{u.full_name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <TypeBadge type={u.user_type} />
                    <VerifiedBadge verified={u.verified} />
                  </div>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => setOverrideTarget(u)}
                    style={{ background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#d97706', display: 'flex' }}
                    title="Override password"
                  >
                    <KeyRound size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Override Modal */}
      {overrideTarget && (
        <OverrideModal
          target={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onSuccess={showToast}
        />
      )}
    </div>
  );
};

export default UserDirectory;
