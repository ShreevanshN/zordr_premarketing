import { useState } from 'react';
import { adminColleges } from '../../services/adminService';

const inputStyle = {
  width: '100%', border: '1px solid #EAEAEA', borderRadius: 10,
  padding: '10px 12px', fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', marginBottom: 10, boxSizing: 'border-box',
};

const emptyForm = {
  name: '', shortName: '', slug: '', earlyBirdLimit: 500,
  campaignStatus: 'draft', launchDate: '', primaryColor: '#FF5A1F',
};

const AdminCollegesTab = ({ colleges, onChanged }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const startEdit = (college) => {
    setEditingId(college.id);
    setForm({
      name: college.name,
      shortName: college.short_name,
      slug: college.slug,
      earlyBirdLimit: college.early_bird_limit,
      campaignStatus: college.campaign_status,
      launchDate: college.launch_date ? college.launch_date.slice(0, 16) : '',
      primaryColor: college.theme?.primary || '#FF5A1F',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fields = {
      name: form.name,
      shortName: form.shortName,
      slug: form.slug,
      earlyBirdLimit: Number(form.earlyBirdLimit),
      campaignStatus: form.campaignStatus,
      launchDate: form.launchDate ? new Date(form.launchDate).toISOString() : null,
      theme: { primary: form.primaryColor },
    };

    const { error: submitError } = editingId
      ? await adminColleges.update(editingId, fields)
      : await adminColleges.create(fields);

    setSubmitting(false);
    if (submitError) { setError(submitError); return; }
    resetForm();
    onChanged();
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Colleges</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Onboard a new campus by filling this in — no code changes needed, <code>/&lt;slug&gt;</code> starts working immediately.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editingId ? 'Edit college' : 'Add a college'}</p>

          <input style={inputStyle} placeholder="Full name (e.g. KITS Warangal)" value={form.name} onChange={set('name')} required />
          <input style={inputStyle} placeholder="Short name (e.g. KITSW)" value={form.shortName} onChange={set('shortName')} required />
          <input style={inputStyle} placeholder="URL slug (e.g. kitsw)" value={form.slug} onChange={set('slug')} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input style={inputStyle} type="number" min="1" placeholder="Early Bird limit" value={form.earlyBirdLimit} onChange={set('earlyBirdLimit')} />
            <select style={inputStyle} value={form.campaignStatus} onChange={set('campaignStatus')}>
              <option value="draft">Draft</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          <label style={{ fontSize: 11, color: '#9CA3AF' }}>Launch date</label>
          <input style={inputStyle} type="datetime-local" value={form.launchDate} onChange={set('launchDate')} />

          <label style={{ fontSize: 11, color: '#9CA3AF' }}>Theme color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="color" value={form.primaryColor} onChange={set('primaryColor')} style={{ width: 40, height: 34, border: '1px solid #EAEAEA', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
            <span style={{ fontSize: 12, color: '#6B7280' }}>{form.primaryColor}</span>
          </div>

          {error && <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 10 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add college'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ background: '#fff', color: '#6B7280', border: '1px solid #EAEAEA', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #EAEAEA' }}>
                <th style={{ padding: '10px 14px' }}>College</th>
                <th style={{ padding: '10px 14px' }}>Slug</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Signups</th>
                <th style={{ padding: '10px 14px' }}></th>
              </tr>
            </thead>
            <tbody>
              {colleges.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>/{c.slug}</td>
                  <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{c.campaign_status}</td>
                  <td style={{ padding: '10px 14px' }}>{c.current_signup_count}/{c.early_bird_limit}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', color: '#FF5A1F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
              {colleges.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>No colleges yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCollegesTab;
