import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PortalLayout from '../components/layout/PortalLayout';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeDrawer from '../components/employees/EmployeeDrawer';
import { useAuth } from '../context/AuthContext';
import { can } from '../utils/permissions';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';

const Employees = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const deptParam = searchParams.get('department') || '';

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState(deptParam);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const refresh = () => setEmployees(getEmployees());

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setDept(deptParam); }, [deptParam]);

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.phone || '').includes(q);
    const matchDept = !dept || e.department === dept;
    const matchRole = !role || e.role === role;
    const matchStatus = !status || e.status === status;
    return matchSearch && matchDept && matchRole && matchStatus;
  });

  const handleSave = (form) => {
    if (editData) updateEmployee(editData.id, form);
    else addEmployee(form);
    refresh();
    setEditData(null);
  };

  const handleEdit = (emp) => { setEditData(emp); setDrawerOpen(true); };
  const handleDelete = (id) => { if (window.confirm('Delete this employee?')) { deleteEmployee(id); refresh(); } };
  const openAdd = () => { setEditData(null); setDrawerOpen(true); };
  const canAdd = can(user?.role, 'add_employee');

  return (
    <PortalLayout>
      {/* Header row — stacks on mobile */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, marginBottom: 4 }}>Insiders</h1>
          <p style={{ fontSize: 14, color: '#6B7280' }}>View and manage all insiders in the organization.</p>
        </div>
        {canAdd && (
          <button
            onClick={openAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            + Add Insider
          </button>
        )}
      </div>

      <EmployeeFilters
        search={search} onSearch={setSearch}
        dept={dept} onDept={setDept}
        role={role} onRole={setRole}
        status={status} onStatus={setStatus}
      />

      <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
        <EmployeeTable
          employees={filtered}
          userRole={user?.role}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', fontSize: 13, color: '#6B7280' }}>
          Showing {filtered.length} of {employees.length} Insiders
        </div>
      </div>

      <EmployeeDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditData(null); }}
        onSave={handleSave}
        editData={editData}
      />
    </PortalLayout>
  );
};

export default Employees;
