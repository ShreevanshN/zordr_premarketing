import { useState, useEffect } from 'react';
import {
  getAmbassadorRoles,
  addAmbassadorRole,
  removeAmbassadorRole,
  resetAmbassadorRoles,
} from '../../services/roleService';

const EMOJI_SUGGESTIONS = ['📣', '🤝', '🧪', '📸', '🎪', '💻', '🎯', '🚀', '⭐', '🔥', '🎨', '📈'];

const AdminRolesTab = ({ college }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📣');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    const data = await getAmbassadorRoles(college.id);
    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRoles();
  }, [college.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a role name.');
      return;
    }
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const updated = await addAmbassadorRole(college.id, { name, icon, desc });
      setRoles(updated);
      setName('');
      setDesc('');
      setIcon('📣');
      setSuccess(`Role "${name.trim()}" added successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (roleId, roleName) => {
    if (!window.confirm(`Are you sure you want to remove the role "${roleName}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const updated = await removeAmbassadorRole(college.id, roleId);
      setRoles(updated);
      setSuccess(`Role "${roleName}" removed successfully.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove role');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all ambassador roles back to defaults?')) return;
    setError(null);
    const updated = await resetAmbassadorRoles(college.id);
    setRoles(updated);
    setSuccess('Roles reset to defaults.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>
            Campus Ambassador Roles — {college.short_name}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>
            Configure and customize ambassador roles that applicants can choose from.
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            background: '#fff',
            color: '#6B7280',
            border: '1px solid #EAEAEA',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 Reset to Defaults
        </button>
      </div>

      {/* Toast Feedback */}
      {success && (
        <div style={{ background: '#DCFCE7', color: '#166534', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Existing Roles List */}
      <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '20px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#111827' }}>
          Active Roles ({roles.length})
        </h3>

        {loading ? (
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading roles…</p>
        ) : roles.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>No roles defined. Add one below!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {roles.map((r) => (
              <div
                key={r.id || r.name}
                style={{
                  border: '1px solid #EAEAEA',
                  borderRadius: 14,
                  padding: '14px',
                  background: '#FAFAFA',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 24 }}>{r.icon || '🚀'}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{r.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4, marginBottom: 12 }}>
                    {r.desc || 'No description provided.'}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(r.id || r.name, r.name)}
                  style={{
                    alignSelf: 'flex-start',
                    background: '#FFF1F2',
                    color: '#E11D48',
                    border: '1px solid #FFE4E6',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🗑️ Remove Role
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Role Form */}
      <form onSubmit={handleAdd} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: '20px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#111827' }}>
          ➕ Add New Ambassador Role
        </h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            Role Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Event Captain, Social Media Lead, Tech Ambassador"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid #EAEAEA',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 14,
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            Role Icon / Emoji
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
              style={{
                width: 60,
                border: '1px solid #EAEAEA',
                borderRadius: 10,
                padding: '8px',
                fontSize: 18,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 12, color: '#6B7280' }}>Quick pick:</span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EMOJI_SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                style={{
                  fontSize: 16,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: `1px solid ${icon === emoji ? '#FF5A1F' : '#EAEAEA'}`,
                  background: icon === emoji ? '#FFF6F2' : '#fff',
                  cursor: 'pointer',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
            Short Description
          </label>
          <textarea
            placeholder="Briefly describe what this ambassador role entails..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              border: '1px solid #EAEAEA',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              boxSizing: 'border-box',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            background: '#FF5A1F',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Adding Role…' : 'Create Role'}
        </button>
      </form>
    </div>
  );
};

export default AdminRolesTab;
