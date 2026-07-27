import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminColleges } from '../../services/adminService';
import AdminOverviewTab from '../../components/admin/AdminOverviewTab';
import AdminCollegesTab from '../../components/admin/AdminCollegesTab';
import AdminRewardsTab from '../../components/admin/AdminRewardsTab';

import logoImg from '../../assets/zordr-logo.png';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'colleges', label: 'Colleges', icon: '🏫' },
  { id: 'rewards', label: 'Rewards', icon: '🎁' },
];

const AdminConsole = () => {
  const { session, logout } = useAdminAuth();
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  const [tab, setTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadColleges = () => {
    setCollegesLoading(true);
    adminColleges.list().then(({ data }) => {
      setColleges(data?.colleges || []);
      setCollegesLoading(false);
      setSelectedCollegeId(prev => prev || data?.colleges?.[0]?.id || null);
    });
  };

  useEffect(reloadColleges, [refreshKey]);

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId) || null;

  const navBtnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 12, border: 'none', background: active ? '#FFF6F2' : 'transparent',
    color: active ? '#FF5A1F' : '#6B7280', fontSize: 14, fontWeight: active ? 600 : 500,
    cursor: 'pointer', textAlign: 'left', width: '100%',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, borderRight: '1px solid #EAEAEA', background: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <img src={logoImg} alt="zordr" style={{ height: 22 }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: '#4B5563' }}>Admin</span>
        </div>

        {/* College selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>CAMPAIGN</p>
          {collegesLoading ? (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Loading…</p>
          ) : colleges.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>No colleges yet — add one in the Colleges tab.</p>
          ) : (
            <select
              value={selectedCollegeId || ''}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: 10, padding: '8px 10px', fontSize: 13, cursor: 'pointer' }}
            >
              {colleges.map(c => <option key={c.id} value={c.id}>{c.short_name} ({c.campaign_status})</option>)}
            </select>
          )}
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={navBtnStyle(tab === t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #EAEAEA', paddingTop: 16 }}>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, wordBreak: 'break-all' }}>{session?.user?.email}</p>
          <button onClick={logout} style={{ ...navBtnStyle(false), color: '#DC2626' }}>↩ Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px clamp(16px, 4vw, 40px)', overflowY: 'auto', minWidth: 0 }}>
        {tab === 'colleges' && (
          <AdminCollegesTab
            colleges={colleges}
            onChanged={() => setRefreshKey(k => k + 1)}
          />
        )}

        {tab !== 'colleges' && !selectedCollege && !collegesLoading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
            Add a college first in the Colleges tab.
          </div>
        )}

        {tab === 'overview' && selectedCollege && <AdminOverviewTab college={selectedCollege} />}
        {tab === 'rewards' && selectedCollege && <AdminRewardsTab college={selectedCollege} />}
      </main>
    </div>
  );
};

export default AdminConsole;
