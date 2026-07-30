import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import { useCollege } from '../../context/CollegeContext';
import { createStudent } from '../../services/studentService';
import { detectDevicePlatform } from '../../utils/device';

const Field = ({ icon, placeholder, type = 'text', value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #EAEAEA', borderRadius: 12, padding: '14px 16px', background: '#fff', marginBottom: 12 }}>
    <span style={{ color: '#9CA3AF', fontSize: 16 }}>{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#111827', background: 'transparent' }}
    />
  </div>
);

const EarlyAccessSignup = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const claimed = college?.current_signup_count ?? 0;
  const total = college?.early_bird_limit ?? 500;

  useEffect(() => {
    if (college && claimed >= total) {
      navigate(`/${slug}`);
    }
  }, [college, claimed, total, navigate, slug]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const ref = searchParams.get('ref') || undefined;
    const deviceType = detectDevicePlatform();
    const { data, error: submitError } = await createStudent(slug, { ...form, ref, deviceType });

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    // Already claimed their reward earlier (e.g. resubmitted the form) --
    // skip straight to the success/referral page instead of re-running the
    // card-pick flow.
    navigate(data.hasClaimedReward ? `/${slug}/success` : `/${slug}/reward`);
  };

  return (
    <EarlyAccessLayout>
      <button onClick={() => navigate(`/${slug}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 24, padding: 0 }}>
        ← Back
      </button>

      <div style={{ fontSize: 32, marginBottom: 8 }}>🐦</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Become an<br />
        <span style={{ color: '#FF5A1F' }}>Early Bird</span>
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Reserve your spot before launch and unlock exclusive launch-week rewards.</p>

      <Field icon="👤" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <Field icon="✉️" placeholder="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <Field icon="📱" placeholder="Phone Number" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />

      {error && (
        <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{ width: '100%', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, marginTop: 8, marginBottom: 20 }}
      >
        {submitting ? 'Reserving…' : 'Reserve My Spot'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF' }}>
        We'll only use this to send you launch updates and your reward code.
      </p>
    </EarlyAccessLayout>
  );
};

export default EarlyAccessSignup;
