import { useNavigate } from 'react-router-dom';
import PortalLayout from '../components/layout/PortalLayout';

const depts = [
  { name: 'Finance', icon: '💼', color: '#FF9900' },
  { name: 'Legal & Compliance', icon: '⚖️', color: '#8B5CF6' },
  { name: 'Operations', icon: '⚙️', color: '#22C55E' },
  { name: 'Marketing & Sales', icon: '📈', color: '#3B82F6' },
];

const Departments = () => {
  const navigate = useNavigate();

  return (
    <PortalLayout>
      <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, marginBottom: 4 }}>Departments</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Select a department to manage its Insiders.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, maxWidth: 640 }}>
        {depts.map(d => (
          <button
            key={d.name}
            onClick={() => navigate(`/employees?department=${encodeURIComponent(d.name)}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px', border: '1px solid #EAEAEA', borderRadius: 18, background: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${d.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {d.icon}
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{d.name}</span>
            </div>
            <span style={{ color: '#FF5A1F', fontSize: 18, flexShrink: 0 }}>→</span>
          </button>
        ))}
      </div>
    </PortalLayout>
  );
};

export default Departments;
