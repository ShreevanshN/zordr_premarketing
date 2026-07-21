import { DEPARTMENTS, ROLES } from '../../utils/constants';

const Select = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    style={{ border: '1px solid #EAEAEA', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#111827', background: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none', width: '100%', fontFamily: 'Inter, sans-serif' }}
  >
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const EmployeeFilters = ({ search, onSearch, dept, onDept, role, onRole, status, onStatus }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
    {/* Search - full width always */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #EAEAEA', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
      <input
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        style={{ border: 'none', outline: 'none', fontSize: 13, color: '#111827', background: 'transparent', width: '100%', fontFamily: 'Inter, sans-serif' }}
      />
    </div>

    {/* Filters row - wraps on mobile */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
      <Select value={dept} onChange={e => onDept(e.target.value)} options={DEPARTMENTS} placeholder="All Departments" />
      <Select value={role} onChange={e => onRole(e.target.value)} options={Object.values(ROLES)} placeholder="All Roles" />
      <Select value={status} onChange={e => onStatus(e.target.value)} options={['ACTIVE', 'INACTIVE']} placeholder="All Status" />
    </div>
  </div>
);

export default EmployeeFilters;
