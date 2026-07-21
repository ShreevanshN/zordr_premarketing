import { useState, useEffect } from 'react';
import { ROLES, DEPARTMENTS } from '../../utils/constants';

const initialForm = { name: '', email: '', phone: '', role: '', department: '', temporaryPassword: '', status: 'ACTIVE' };

const Label = ({ children }) => (
  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{children}</label>
);

const Input = ({ placeholder, type = 'text', value, onChange }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#111827', outline: 'none', background: '#fff', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
  />
);

const Select = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    style={{ width: '100%', border: '1px solid #EAEAEA', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: value ? '#111827' : '#9CA3AF', outline: 'none', background: '#fff', appearance: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
  >
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const EmployeeDrawer = ({ open, onClose, onSave, editData }) => {
  const [form, setForm] = useState(initialForm);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (editData) setForm(editData);
    else setForm(initialForm);
  }, [editData, open]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = () => {
    if (!form.name || !form.email || !form.role || !form.department) return;
    onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />

      {/* Drawer — full width on mobile, 400px on desktop */}
      <div style={{
        position: 'fixed', top: 0, right: 0, height: '100vh',
        width: 'min(400px, 100vw)',
        background: '#fff', zIndex: 50,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{editData ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B7280', padding: 4 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <Label>Full Name</Label>
            <Input placeholder="Enter full name" value={form.name} onChange={set('name')} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <Label>Email Address</Label>
            <Input placeholder="Enter email address" type="email" value={form.email} onChange={set('email')} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <Label>Phone Number</Label>
            <Input placeholder="Enter phone number" type="tel" value={form.phone} onChange={set('phone')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onChange={set('role')} options={Object.values(ROLES)} placeholder="Select role" />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={form.department} onChange={set('department')} options={DEPARTMENTS} placeholder="Select dept" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <Label>Temporary Password</Label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #EAEAEA', borderRadius: 10, overflow: 'hidden' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter temporary password"
                value={form.temporaryPassword}
                onChange={set('temporaryPassword')}
                style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', minWidth: 0 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', flexShrink: 0 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <Label>Status</Label>
            <Select value={form.status} onChange={set('status')} options={['ACTIVE', 'INACTIVE']} placeholder="Select status" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #EAEAEA', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', border: '1px solid #EAEAEA', borderRadius: 12, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: 12, background: '#FF5A1F', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
            Save Employee
          </button>
        </div>
      </div>
    </>
  );
};

export default EmployeeDrawer;
