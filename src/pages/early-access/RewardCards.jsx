import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EarlyAccessLayout from '../../components/shared/EarlyAccessLayout';
import { useCollege } from '../../context/CollegeContext';
import { claimReward } from '../../services/studentService';
import { handleDownloadNow, detectDevicePlatform } from '../../utils/device';
import { FaGooglePlay, FaApple } from 'react-icons/fa';

const CARD_COUNT = 6;

const CARD_ICONS = ['🎁', '✨', '⚡', '🍀', '💎', '🏆'];

const generateParticles = () => {
  const colors = ['#FF5A1F', '#FFD700', '#FF4081', '#00E676', '#3D5AFE', '#FF9100'];
  return Array.from({ length: 22 }).map((_, i) => {
    const angle = (i / 22) * 360 + (Math.random() * 20 - 10);
    const distance = 55 + Math.random() * 85;
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = Math.sin((angle * Math.PI) / 180) * distance;
    const size = 5 + Math.random() * 7;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rot = (Math.random() - 0.5) * 540;
    return { id: i, tx: `${tx}px`, ty: `${ty}px`, size, color, rot: `${rot}deg` };
  });
};

const RewardCards = () => {
  const navigate = useNavigate();
  const { college, slug } = useCollege();
  const primary = college?.theme?.primary || '#FF5A1F';

  const [phase, setPhase] = useState('picking'); // picking -> revealing -> revealed -> celebrate
  const [chosenIndex, setChosenIndex] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [particles, setParticles] = useState([]);
  const claimPromise = useRef(null);

  const handlePick = async (index) => {
    if (phase !== 'picking') return;

    setChosenIndex(index);
    setPhase('revealing');
    setError(null);
    setParticles(generateParticles());

    // Trigger 3D flip transition
    setTimeout(() => {
      setIsFlipped(true);
    }, 150);

    claimPromise.current = claimReward(slug);
    const { data, error: claimError } = await claimPromise.current;

    if (claimError) {
      setError(claimError);
      setPhase('picking');
      setChosenIndex(null);
      setIsFlipped(false);
      return;
    }

    setReward(data);
    setTimeout(() => {
      setParticles(generateParticles()); // Second burst of confetti when reward resolves
      setPhase('revealed');
    }, 600);
  };

  const copyCode = () => {
    if (!reward?.couponCode) return;
    navigator.clipboard.writeText(reward.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    setPhase('celebrate');
  };

  const cardGrid = (
    <div
      className="reward-cards-grid"
      style={{
        '--card-primary': primary,
        '--card-primary-alpha': `${primary}44`,
      }}
    >
      {Array.from({ length: CARD_COUNT }).map((_, i) => {
        const isChosen = chosenIndex === i;
        const isDimmed = phase !== 'picking' && !isChosen;
        const cardFlipped = isChosen && isFlipped;

        return (
          <div
            key={i}
            className="reward-card-3d-wrapper reward-card-deal-in"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div
              onClick={() => handlePick(i)}
              className={`reward-card-3d-inner ${cardFlipped ? 'is-flipped' : ''} ${isDimmed ? 'is-dimmed' : ''} ${isChosen ? 'is-chosen' : ''}`}
            >
              {/* Card Back Face (Mystery Side) */}
              <div
                className="reward-card-face reward-card-face-back"
                style={{
                  borderColor: isChosen ? '#ffffff' : `${primary}44`,
                }}
              >
                <div className="reward-card-shimmer" />

                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                  }}
                >
                  CARD {String(i + 1).padStart(2, '0')}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 'auto',
                  }}
                >
                  <span
                    style={{
                      fontSize: 32,
                      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                      transform: isChosen ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {CARD_ICONS[i % CARD_ICONS.length]}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#fff',
                    background: isChosen ? primary : 'rgba(255,255,255,0.12)',
                    padding: '3px 8px',
                    borderRadius: 10,
                    letterSpacing: '0.04em',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {isChosen ? 'LUCKY CHOICE' : 'TAP TO PICK'}
                </div>
              </div>

              {/* Card Front Face (Revealed Side) */}
              <div
                className="reward-card-face reward-card-face-front"
                style={{
                  borderColor: primary,
                  background: `linear-gradient(150deg, ${primary}22 0%, #0F172A 100%)`,
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: primary,
                    textTransform: 'uppercase',
                  }}
                >
                  ✨ UNLOCKED
                </div>

                <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                  {reward ? (
                    <>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#ffffff',
                          lineHeight: 1.2,
                          marginBottom: 4,
                        }}
                      >
                        {reward.rewardTitle}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: primary,
                          letterSpacing: '0.05em',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '3px 6px',
                          borderRadius: 6,
                          display: 'inline-block',
                        }}
                      >
                        {reward.couponCode}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          border: `3px solid ${primary}`,
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          margin: '0 auto 6px',
                        }}
                      />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                        REVEALING...
                      </span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#22C55E',
                  }}
                >
                  🎉 REWARD
                </div>
              </div>
            </div>

            {/* Particle Burst for Chosen Card */}
            {isChosen && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  pointerEvents: 'none',
                }}
              >
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color,
                      '--tx': p.tx,
                      '--ty': p.ty,
                      '--rot': p.rot,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <EarlyAccessLayout>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {(phase === 'picking' || phase === 'revealing') && (
        <>
          <h1 style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
            {phase === 'picking' ? 'Pick Your Mystery Card' : 'Unlocking Your Reward! 🎉'}
          </h1>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {phase === 'picking' ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    background: `${primary}15`,
                    color: primary,
                    fontSize: 12,
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: 20,
                    letterSpacing: '0.05em',
                    marginBottom: 6,
                  }}
                >
                  SELECT 1 CARD
                </span>
                <p style={{ fontSize: 13, color: '#6B7280' }}>Every card contains a guaranteed launch perk! 🍀</p>
              </>
            ) : (
              <p style={{ fontSize: 14, color: primary, fontWeight: 700 }}>Flipping your lucky card...</p>
            )}
          </div>

          <div style={{ margin: '0 auto 16px' }}>{cardGrid}</div>

          {error && <p style={{ textAlign: 'center', color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{error}</p>}

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
            🔒 1 reward per student account
          </p>
        </>
      )}

      {phase === 'revealed' && reward && (
        <>
          <h1 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            Pick Your Reward
          </h1>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 4, animation: 'cardDeal 0.5s ease' }}>🎉</div>
            <p style={{ fontSize: 22, fontWeight: 900, color: primary, marginBottom: 2 }}>CONGRATULATIONS!</p>
            <p style={{ fontSize: 14, color: '#4B5563' }}>Here is your exclusive launch reward</p>
          </div>

          {/* Featured Reward Card View */}
          <div
            style={{
              background: `linear-gradient(150deg, ${primary} 0%, ${primary}DD 100%)`,
              borderRadius: 24,
              padding: '32px 24px',
              textAlign: 'center',
              color: '#fff',
              marginBottom: 20,
              maxWidth: 360,
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: `0 16px 36px ${primary}40, 0 4px 12px rgba(0,0,0,0.1)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
              {reward.rewardTitle}
            </div>

            <p style={{ fontSize: 13, opacity: 0.95, marginTop: 10, marginBottom: 22, lineHeight: 1.4 }}>
              {reward.rewardDescription}
            </p>

            <div
              onClick={copyCode}
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                border: '1.5px dashed rgba(255,255,255,0.6)',
                borderRadius: 14,
                padding: '12px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.1em' }}>{reward.couponCode}</span>
              <span style={{ fontSize: 16 }}>{copied ? '✅' : '📋'}</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
            ⏱ Valid during launch week only.
          </p>

          <button
            onClick={copyCode}
            style={{
              width: '100%',
              background: primary,
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 16,
              marginBottom: 12,
              boxShadow: `0 4px 16px ${primary}35`,
            }}
          >
            {copied ? 'Copied to Clipboard!' : '📋 Copy Reward Code'}
          </button>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              background: '#fff',
              color: '#111827',
              border: '1px solid #EAEAEA',
              borderRadius: 14,
              padding: '14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue →
          </button>
        </>
      )}

      {phase === 'celebrate' && reward && (
        <>
          <h1 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
            Pick Your Reward
          </h1>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🎉</div>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>Awesome!</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
              You unlocked a great reward.
            </p>
            <span
              style={{
                display: 'inline-block',
                border: `1.5px solid ${primary}`,
                borderRadius: 20,
                padding: '6px 18px',
                fontSize: 14,
                fontWeight: 800,
                color: primary,
                background: `${primary}10`,
              }}
            >
              {reward.couponCode}
            </span>
          </div>

          <div style={{ background: primary, borderRadius: 18, padding: 20, color: '#fff', marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, opacity: 0.9 }}>What's Next?</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🛍️</span>
              <span style={{ fontSize: 13 }}>Use your code during launch week on orders above ₹{reward.minOrderValue}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>👥</span>
              <span style={{ fontSize: 13 }}>Share with friends and grow the Zordr community</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <span style={{ fontSize: 13 }}>Stay tuned for more surprises!</span>
            </div>
          </div>

          <button
            onClick={() => handleDownloadNow(college?.app_links)}
            style={{
              width: '100%',
              background: '#111827',
              color: '#fff',
              border: `1.5px solid ${primary}`,
              borderRadius: 14,
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
              <FaGooglePlay size={18} />
              <FaApple size={18} />
            </div>
            <span>Download Now</span>
          </button>

          <button
            onClick={() => navigate(`/${slug}/success`)}
            style={{
              width: '100%',
              background: primary,
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginBottom: 12,
              boxShadow: `0 4px 16px ${primary}35`,
            }}
          >
            🔗 Share with Friends
          </button>

        </>
      )}
    </EarlyAccessLayout>
  );
};

export default RewardCards;

