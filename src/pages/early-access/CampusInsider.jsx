import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import { useCollege } from '../../context/CollegeContext';
import { getDynamicFormFields } from '../../services/collegeService';
import { getStudentSession } from '../../services/studentService';
import { submitCampusInsider } from '../../services/insiderService';
import { getAmbassadorRoles, DEFAULT_AMBASSADOR_ROLES } from '../../services/roleService';
import { ACADEMIC_BRANCHES } from '../../utils/constants';

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const inputStyle = {
  width: '100%', border: '1px solid #EAEAEA', borderRadius: 12,
  padding: '13px 16px', fontSize: 14, color: '#111827', background: '#fff',
  outline: 'none', marginBottom: 12, fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

const readOnlyFieldStyle = {
  ...inputStyle,
  background: '#F9FAFB',
  color: '#6B7280',
};

const DynamicField = ({ field, value, onChange }) => {
  if (field.type === 'textarea') {
    return (
      <textarea
        placeholder={field.label}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'none' }}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
        <option value="">{field.label}</option>
        {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (field.type === 'radio') {
    return (
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>{field.label}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {(field.options || []).map(o => (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                border: `1.5px solid ${value === o ? '#FF5A1F' : '#EAEAEA'}`,
                background: value === o ? '#FFF6F2' : '#fff',
                color: value === o ? '#FF5A1F' : '#374151', fontWeight: value === o ? 600 : 400,
              }}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <input style={inputStyle} placeholder={field.label} value={value || ''} onChange={(e) => onChange(e.target.value)} />
  );
};

const CampusInsider = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();
  const primary = college?.theme?.primary || '#FF5A1F';
  const session = getStudentSession(slug);

  const [roles, setRoles] = useState(DEFAULT_AMBASSADOR_ROLES);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [form, setForm] = useState({ role: '', branch: '', year: '', hosteller: null, reason: '' });
  const [dynamicAnswers, setDynamicAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (college?.id) {
      getDynamicFormFields(college.id).then(setDynamicFields);
      getAmbassadorRoles(college.id).then((loadedRoles) => {
        setRoles(loadedRoles);
      });
    }
  }, [college?.id]);

  const setField = (key) => (val) => setForm({ ...form, [key]: val });

  const handleSubmit = async () => {
    if (!form.role || !form.branch || !form.year || form.hosteller === null || !form.reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { data, error: submitError } = await submitCampusInsider(slug, {
      role: form.role,
      branch: form.branch,
      year: form.year,
      hosteller: form.hosteller,
      reason: form.reason.trim(),
      answers: dynamicAnswers,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }
    setResult(data);
  };

  // Gate: this form auto-fills from an existing signup, so require one.
  if (!session?.studentId) {
    return (
      <EarlyAccessLayout>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Become an Early Bird first</h2>
          <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 14 }}>Campus Insider applications are only open to students who've already signed up.</p>
          <button onClick={() => navigate(`/${slug}/signup`)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Become an Early Bird
          </button>
        </div>
      </EarlyAccessLayout>
    );
  }

  if (result) return (
    <EarlyAccessLayout>
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          {result.alreadyApplied ? "You've already applied!" : 'Application received!'}
        </h2>
        <p style={{ color: '#6B7280', marginBottom: 8 }}>Role: <strong>{result.role}</strong> · Status: <strong style={{ textTransform: 'capitalize' }}>{result.status}</strong></p>
        <p style={{ color: '#6B7280', marginBottom: 24 }}>We'll contact you via email or WhatsApp.</p>
        <button onClick={() => navigate(`/${slug}`)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Back to Home</button>
      </div>
    </EarlyAccessLayout>
  );

  return (
    <EarlyAccessLayout>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 'clamp(22px, 6vw, 26px)', fontWeight: 800, marginBottom: 4 }}>
            Become a<br /><span style={{ color: primary }}>Campus Insider</span>
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Help launch Zordr at {college?.short_name || college?.name}.<br />Only 10–15 students will be selected.</p>
        </div>
        <span style={{ fontSize: 40, flexShrink: 0, marginLeft: 12 }}>🚀</span>
      </div>

      {/* Role picker */}
      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Choose your role</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {roles.map(r => {
          const roleTitle = r.name || r.id;
          const isSelected = form.role === roleTitle;
          return (
            <div
              key={roleTitle}
              onClick={() => setField('role')(roleTitle)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1.5px solid ${isSelected ? primary : '#EAEAEA'}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer', background: isSelected ? '#FFF6F2' : '#fff' }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon || '🚀'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{roleTitle}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{r.desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? primary : '#D1D5DB'}`, background: isSelected ? primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-filled, read-only -- "don't ask again" per PRD */}
      <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>Your details (from your Early Bird signup)</p>
      <input style={readOnlyFieldStyle} value={session.name || ''} disabled />
      <input style={readOnlyFieldStyle} value={session.email || ''} disabled />
      <input style={readOnlyFieldStyle} value={session.phone || ''} disabled />

      {/* Branch + Year */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <select value={form.branch} onChange={(e) => setField('branch')(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
          <option value="">Branch</option>
          {ACADEMIC_BRANCHES.map(o => <option key={o}>{o}</option>)}
        </select>
        <select value={form.year} onChange={(e) => setField('year')(e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
          <option value="">Year</option>
          {years.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Hosteller / Day Scholar */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>Hosteller or Day Scholar?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ label: 'Hosteller', val: true }, { label: 'Day Scholar', val: false }].map(o => (
            <button
              key={o.label}
              type="button"
              onClick={() => setField('hosteller')(o.val)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
                border: `1.5px solid ${form.hosteller === o.val ? primary : '#EAEAEA'}`,
                background: form.hosteller === o.val ? '#FFF6F2' : '#fff',
                color: form.hosteller === o.val ? primary : '#374151', fontWeight: form.hosteller === o.val ? 600 : 400,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <textarea
        placeholder="Why do you want to become a Campus Insider?"
        value={form.reason}
        onChange={(e) => setField('reason')(e.target.value)}
        rows={3}
        style={{ ...inputStyle, resize: 'none' }}
      />

      {/* Dynamic, admin-configurable questions */}
      {dynamicFields.length > 0 && (
        <>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '4px 0 8px' }}>A few more questions</p>
          {dynamicFields.map(f => (
            <DynamicField
              key={f.id}
              field={f}
              value={dynamicAnswers[f.id]}
              onChange={(val) => setDynamicAnswers({ ...dynamicAnswers, [f.id]: val })}
            />
          ))}
        </>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, marginTop: 4, marginBottom: 16 }}
      >
        {submitting ? 'Submitting…' : 'Apply Now'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF' }}>🔒 Selected students will be contacted via email or WhatsApp.</p>
    </EarlyAccessLayout>
  );
};

export default CampusInsider;
