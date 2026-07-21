import { useState, useEffect } from 'react';
import { adminApplications } from '../../services/adminService';
import { getAmbassadorRoles } from '../../services/roleService';

const statusStyle = (status) => ({
  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize',
  background: status === 'accepted' ? '#DCFCE7' : status === 'rejected' ? '#FEE2E2' : '#F3F4F6',
  color: status === 'accepted' ? '#166534' : status === 'rejected' ? '#991B1B' : '#6B7280',
});

const AdminApplicationsTab = ({ college }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [availableRoles, setAvailableRoles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const reload = () => {
    setLoading(true);
    adminApplications.list(college.id, statusFilter || undefined).then(({ data }) => {
      setApplications(data?.applications || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, [college.id, statusFilter]);

  useEffect(() => {
    getAmbassadorRoles(college.id).then(roles => {
      setAvailableRoles(roles);
    });
  }, [college.id]);

  const handleStatus = async (applicationId, status) => {
    await adminApplications.updateStatus(applicationId, status);
    reload();
  };

  const filteredApplications = applications.filter(app => {
    if (!roleFilter) return true;
    return (app.role || '').toLowerCase() === roleFilter.toLowerCase();
  });

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Campus Insider Applications — {college.short_name}</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Review, filter by role, and decide who gets selected for the 10–15 spots.</p>

      {/* Filter Row: Status + Role */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', 'pending', 'accepted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                border: `1px solid ${statusFilter === s ? '#FF5A1F' : '#EAEAEA'}`,
                background: statusFilter === s ? '#FFF6F2' : '#fff',
                color: statusFilter === s ? '#FF5A1F' : '#6B7280',
              }}
            >
              {s || 'All Statuses'}
            </button>
          ))}
        </div>

        {/* Role Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>🏷️ Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              border: '1px solid #EAEAEA',
              borderRadius: 10,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: 600,
              color: '#111827',
              cursor: 'pointer',
              outline: 'none',
              background: '#fff',
            }}
          >
            <option value="">All Ambassador Roles ({applications.length})</option>
            {availableRoles.map(r => {
              const rName = r.name || r.id;
              const count = applications.filter(a => (a.role || '').toLowerCase() === rName.toLowerCase()).length;
              return (
                <option key={rName} value={rName}>
                  {r.icon || '🏷️'} {rName} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredApplications.map(app => {
          const s = app.students;
          const isOpen = expandedId === app.id;
          return (
            <div key={app.id} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedId(isOpen ? null : app.id)}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{s?.name || 'Applicant'}</span>
                    <span style={statusStyle(app.status)}>{app.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                    <span style={{ fontWeight: 700, color: '#FF5A1F' }}>🏷️ {app.role}</span> · {s?.branch || 'N/A'} · {s?.year || 'N/A'} · {s?.email}
                  </div>
                </div>
                <span style={{ color: '#9CA3AF', fontSize: 18 }}>{isOpen ? '−' : '+'}</span>
              </div>

              {isOpen && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 14, fontSize: 13 }}>
                    <div><span style={{ color: '#9CA3AF' }}>Phone:</span> {s?.phone}</div>
                    <div><span style={{ color: '#9CA3AF' }}>Hosteller:</span> {s?.hosteller ? 'Yes' : 'No'}</div>
                    <div><span style={{ color: '#9CA3AF' }}>Referral code:</span> {s?.referral_code}</div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    {Object.entries(app.answers || {}).map(([key, value]) => (
                      <div key={key} style={{ fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: '#9CA3AF' }}>{key === 'reason' ? 'Why they want to join:' : key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleStatus(app.id, 'accepted')} style={{ background: '#22C55E', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                    <button onClick={() => handleStatus(app.id, 'rejected')} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                    {app.status !== 'pending' && (
                      <button onClick={() => handleStatus(app.id, 'pending')} style={{ background: '#fff', color: '#6B7280', border: '1px solid #EAEAEA', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reset to pending</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filteredApplications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
            No applications found{statusFilter ? ` with status "${statusFilter}"` : ''}{roleFilter ? ` for role "${roleFilter}"` : ''}.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApplicationsTab;
