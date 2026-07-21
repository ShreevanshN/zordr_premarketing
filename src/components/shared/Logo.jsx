const Logo = ({ size = 'md' }) => {
  const s = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  return (
    <div className={`flex items-center gap-1.5 font-bold ${s}`}>
      <span style={{ color: '#FF5A1F', fontSize: '1.2em', lineHeight: 1 }}>Z</span>
      <span style={{ color: '#111827' }}>zordr</span>
    </div>
  );
};

export default Logo;
