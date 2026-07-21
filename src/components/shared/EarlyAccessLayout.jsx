import Logo from './Logo';
import ProgressSteps from './ProgressSteps';

const EarlyAccessLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#ffffff', borderBottom: '1px solid #EAEAEA', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <Logo />
        <ProgressSteps />
      </header>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default EarlyAccessLayout;

