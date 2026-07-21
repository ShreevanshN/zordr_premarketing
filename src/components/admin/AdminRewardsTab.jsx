import { useState, useEffect } from 'react';
import { adminRewards } from '../../services/adminService';

const inputStyle = {
  width: '100%', border: '1px solid #EAEAEA', borderRadius: 10,
  padding: '10px 12px', fontSize: 13, color: '#111827', background: '#fff',
  outline: 'none', marginBottom: 10, boxSizing: 'border-box',
};

const emptyForm = {
  title: '', description: '', rewardValue: '', minOrderValue: '',
  maxDiscountAmount: '', probability: '', active: true,
};

const AdminRewardsTab = ({ college }) => {
  const [rewards, setRewards] = useState([]);
  const [probabilitySum, setProbabilitySum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reload = () => {
    setLoading(true);
    adminRewards.list(college.id).then(({ data, error: err }) => {
      if (err) setError(err);
      else {
        setRewards(data.rewards);
        setProbabilitySum(data.activeProbabilitySum);
      }
      setLoading(false);
    });
  };

  useEffect(reload, [college.id]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({
      title: r.title, description: r.description || '',
      rewardValue: r.reward_value, minOrderValue: r.min_order_value,
      maxDiscountAmount: r.max_discount_amount ?? '', probability: r.probability,
      active: r.active,
    });
  };

  const resetForm = () => { setEditingId(null); setForm(emptyForm); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fields = {
      title: form.title,
      description: form.description || null,
      rewardValue: Number(form.rewardValue),
      minOrderValue: Number(form.minOrderValue),
      maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
      probability: Number(form.probability),
      active: form.active === true || form.active === 'true',
    };

    const { data, error: submitError } = editingId
      ? await adminRewards.update(college.id, editingId, fields)
      : await adminRewards.create(college.id, fields);

    setSubmitting(false);
    if (submitError) { setError(submitError); return; }
    setProbabilitySum(data.activeProbabilitySum);
    resetForm();
    reload();
  };

  const activeRewards = rewards.filter(r => r.active);
  const milestoneRewards = rewards.filter(r => !r.active);
  const probabilityOff = Math.abs(probabilitySum - 1) > 0.001;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Rewards — {college.short_name}</h1>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
        <strong>Active</strong> rewards are the random mystery-card pool. <strong>Inactive</strong> ones are reserved for referral milestones — they never get randomly assigned.
      </p>

      {!loading && probabilityOff && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
          ⚠️ Active reward probabilities sum to {(probabilitySum * 100).toFixed(1)}%, not 100%. The mystery-card pool won't behave as expected until this adds up to 100%.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editingId ? 'Edit reward' : 'Add a reward'}</p>

          <input style={inputStyle} placeholder="Title (e.g. 20% OFF)" value={form.title} onChange={set('title')} required />
          <input style={inputStyle} placeholder="Description (e.g. On bills above ₹200)" value={form.description} onChange={set('description')} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#9CA3AF' }}>% off</label>
              <input style={inputStyle} type="number" step="0.01" value={form.rewardValue} onChange={set('rewardValue')} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9CA3AF' }}>Min order (₹)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.minOrderValue} onChange={set('minOrderValue')} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#9CA3AF' }}>Max discount (₹, optional)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.maxDiscountAmount} onChange={set('maxDiscountAmount')} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9CA3AF' }}>Probability (0–1)</label>
              <input style={inputStyle} type="number" step="0.0001" min="0" max="1" value={form.probability} onChange={set('probability')} required />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.active === true || form.active === 'true'} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            In the mystery-card pool (uncheck for a milestone-only reward)
          </label>

          {error && <p style={{ color: '#DC2626', fontSize: 12, marginBottom: 10 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={submitting} style={{ flex: 1, background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add reward'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ background: '#fff', color: '#6B7280', border: '1px solid #EAEAEA', borderRadius: 10, padding: '11px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Lists */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>MYSTERY-CARD POOL ({(probabilitySum * 100).toFixed(1)}% total)</p>
          <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
            <RewardTable rewards={activeRewards} onEdit={startEdit} loading={loading} />
          </div>

          <p style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 8 }}>MILESTONE / OTHER REWARDS</p>
          <div style={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: 16, overflow: 'hidden' }}>
            <RewardTable rewards={milestoneRewards} onEdit={startEdit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardTable = ({ rewards, onEdit, loading }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
    <thead>
      <tr style={{ textAlign: 'left', color: '#9CA3AF', borderBottom: '1px solid #EAEAEA' }}>
        <th style={{ padding: '10px 14px' }}>Title</th>
        <th style={{ padding: '10px 14px' }}>Min order</th>
        <th style={{ padding: '10px 14px' }}>Cap</th>
        <th style={{ padding: '10px 14px' }}>Probability</th>
        <th style={{ padding: '10px 14px' }}></th>
      </tr>
    </thead>
    <tbody>
      {rewards.map(r => (
        <tr key={r.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{r.title}</td>
          <td style={{ padding: '10px 14px' }}>₹{r.min_order_value}+</td>
          <td style={{ padding: '10px 14px' }}>{r.max_discount_amount != null ? `₹${r.max_discount_amount}` : '—'}</td>
          <td style={{ padding: '10px 14px' }}>{(r.probability * 100).toFixed(1)}%</td>
          <td style={{ padding: '10px 14px' }}>
            <button onClick={() => onEdit(r)} style={{ background: 'none', border: 'none', color: '#FF5A1F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
          </td>
        </tr>
      ))}
      {!loading && rewards.length === 0 && (
        <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>None yet.</td></tr>
      )}
    </tbody>
  </table>
);

export default AdminRewardsTab;
