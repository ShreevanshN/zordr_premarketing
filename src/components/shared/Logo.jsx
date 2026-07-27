import logoImg from '../../assets/zordr-logo.png';

const Logo = ({ size = 'md' }) => {
  const height = size === 'sm' ? 20 : size === 'lg' ? 36 : 28;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={logoImg} alt="zordr" style={{ height, display: 'block' }} />
    </div>
  );
};

export default Logo;
