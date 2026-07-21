import { useState, useEffect } from 'react';
import { adminFormFields } from '../../services/adminService';

const inputStyle = {
  width: '100%', border: '1px solid #EAEAEA', borderRadius: 10,
  padding: '10px 12px', fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', marginBottom: 10, boxSizing: 'border-box',
};

const emptyForm = { label: '', type: 'text', options: '', required: false, displayOrder: 0 };

const AdminQuestionsTab = ({ college }) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reload = () => {
    setLoading(true);
    adminFormFields.list(college.id).then(({ data }) => {
      setFields(data?.fields || []);
      setLoading(false);
    });
  };

  useEffect(reload, [college.id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const startEdit = (f) => {
    setEditingId(f.id);
    setForm({
      label: f.label, type: f.type,
      options: (f.options || []).join(', '),
      required: f.required, displayOrder: f.display_order,
    });
  };

  const resetForm = () => { setEditingId(null); setForm(emptyForm); setError(null); };

  const needsOptions = form.type === 'select' || form.type === 'radio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fieldsPayload = {
      label: form.label,
      type: form.type,
      options: needsOptions ? form.options.split(',').map(o => o.trim()).filter(Boolean) : null,
      required: !!form.required,
      displayOrder: Number(form.displayOrder) || 0,
    };

    const { error: submitError } = editingId
      ? await adminFormFields.update(college.id, editingId, fieldsPayload)
      : await adminFormFields.create(college.id, fieldsPayload);

    setSubmitting(false);
    if (submitError) { setError(submitError); return; }
    resetForm();
    reload();
  };

  const handleDelete = async (fieldId) => {
    if (!window.confirm('Delete this question? Existing applications keep their old answers either way.')) return;
    await adminFormFields.remove(fieldId);
    reload();
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Campus Insider Questions — {college.short_name}</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
        These render live on the Campus Insider form, on top of the fixed fields (Role, Branch, Year, Hosteller, Reason). No code changes needed.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 24, alignItems: 'flex-start' }}>
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editingId ? 'Edit question' : 'Add a question'}</p>

          <input style={inputStyle} placeholder="Question label" value={form.label} onChange={set('label')} required />

          <select style={inputStyle} value={form.type} onChange={set('type')}>
            <option value="text">Short text</option>
            <option value="textarea">Long text</option>
            <option value="select">Dropdown</option>
            <option value="radio">Radio buttons</option>
            <option value="checkbox">Checkbox</option>
          </select>

          {needsOptions && (
            <input style={inputStyle} placeholder="Options, comma-separated (e.g. Yes, No)" value={form.options} onChange={set('options')} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.required} onChange={set('required')} /> Required
            </label>
            <div>
              <label style={{ fontSize: 11, color: '#9CA3AF' }}>Order</label>
              <input style={{ ...inputStyle, marginBottom: 0 }} type="number" value={form.displayOrder} onChange={set('displayOrder')} />
            </div>
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 10 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add question'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ background: '#fff', color: '#6B7280', border: '1px solid #EAEAEA', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #EAEAEA' }}>
                <th style={{ padding: '10px 14px' }}>Question</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
                <th style={{ padding: '10px 14px' }}>Required</th>
                <th style={{ padding: '10px 14px' }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{f.label}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{f.type}</td>
                  <td style={{ padding: '10px 14px' }}>{f.required ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 10 }}>
                    <button onClick={() => startEdit(f)} style={{ background: 'none', border: 'none', color: '#FF5A1F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(f.id)} style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && fields.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>No extra questions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsTab;
