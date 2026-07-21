import { can } from '../../utils/permissions';

const deptColors = {
  'Finance': '#FF990020', 'Legal & Compliance': '#8B5CF620',
  'Operations': '#22C55E20', 'Marketing & Sales': '#3B82F620',
};
const deptText = {
  'Finance': '#FF9900', 'Legal & Compliance': '#8B5CF6',
  'Operations': '#22C55E', 'Marketing & Sales': '#3B82F6',
};
const roleColors = { 'SUPER_ADMIN': '#FF5A1F', 'ADMIN': '#3B82F6', 'EXECUTIVE': '#8B5CF6' };

const Badge = ({ label, bg, color }) => (
  <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap', display: 'inline-block' }}>{label}</span>
);

const StatusDot = ({ status }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'ACTIVE' ? '#22C55E' : '#EF4444', display: 'inline-block', flexShrink: 0 }} />
    <span style={{ fontSize: 12, color: status === 'ACTIVE' ? '#22C55E' : '#EF4444', fontWeight: 500 }}>{status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
  </div>
);

const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

// Mobile card view for each employee
const EmployeeCard = ({ emp, canEdit, canDelete, onEdit, onDelete }) => (
  <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FF5A1F20', color: '#FF5A1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {initials(emp.name)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{emp.name}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{emp.email}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {canEdit && (
          <button onClick={() => onEdit(emp)} style={{ background: '#F9FAFB', border: '1px solid #EAEAEA', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', fontSize: 14 }} title="Edit">✏️</button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(emp.id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', padding: '6px 8px', fontSize: 14 }} title="Delete">🗑️</button>
        )}
      </div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Badge label={emp.department} bg={deptColors[emp.department] || '#F3F4F6'} color={deptText[emp.department] || '#6B7280'} />
      <Badge label={emp.role} bg={`${roleColors[emp.role]}20`} color={roleColors[emp.role] || '#6B7280'} />
      <StatusDot status={emp.status} />
      {emp.phone && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{emp.phone}</span>}
    </div>
  </div>
);

const EmployeeTable = ({ employees, userRole, onEdit, onDelete }) => {
  const canEdit = can(userRole, 'edit_employee');
  const canDelete = can(userRole, 'delete_employee');

  if (employees.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#9CA3AF' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>No employees found</p>
        <p style={{ fontSize: 13 }}>Try adjusting your filters or add a new employee.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="employee-cards">
        <div style={{ padding: '12px' }}>
          {employees.map(emp => (
            <EmployeeCard key={emp.id} emp={emp} canEdit={canEdit} canDelete={canDelete} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>

      {/* Desktop table view */}
      <div className="employee-table" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #EAEAEA' }}>
              {['Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#6B7280', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF5A1F20', color: '#FF5A1F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {initials(emp.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{emp.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{emp.email}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{emp.phone || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={emp.department} bg={deptColors[emp.department] || '#F3F4F6'} color={deptText[emp.department] || '#6B7280'} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge label={emp.role} bg={`${roleColors[emp.role]}20`} color={roleColors[emp.role] || '#6B7280'} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusDot status={emp.status} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {canEdit && (
                      <button onClick={() => onEdit(emp)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#6B7280' }} title="Edit">✏️</button>
                    )}
                    {canDelete && (
                      <button onClick={() => onDelete(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#EF4444' }} title="Delete">🗑️</button>
                    )}
                    {!canEdit && !canDelete && <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default EmployeeTable;
