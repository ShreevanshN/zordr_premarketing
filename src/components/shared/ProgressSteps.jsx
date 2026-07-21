import { useLocation, useParams } from 'react-router-dom';

const ProgressSteps = () => {
  const { pathname } = useLocation();
  const { collegeSlug } = useParams();

  const steps = [
    { label: 'Early Bird', path: `/${collegeSlug}` },
    { label: 'Signup', path: `/${collegeSlug}/signup` },
    { label: 'Reward', path: `/${collegeSlug}/reward` },
    { label: 'Success', path: `/${collegeSlug}/success` },
    { label: 'Insider', path: `/${collegeSlug}/campus-insider` },
  ];

  const currentIdx = steps.findIndex(s => s.path === pathname);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === currentIdx ? '#FF5A1F' : i < currentIdx ? '#FF5A1F' : '#EAEAEA',
              opacity: i < currentIdx ? 0.5 : 1,
            }} />
            <span style={{ fontSize: 9, color: i === currentIdx ? '#FF5A1F' : '#9CA3AF', fontWeight: i === currentIdx ? 600 : 400, whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: 16, height: 1, background: '#EAEAEA', marginBottom: 14 }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
