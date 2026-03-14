import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

export default function SplashScreen({ onComplete }) {
  const { storeName } = useTheme();
  const name = storeName || 'Our Store';
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('split'), 1800);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="splash-overlay" data-phase={phase}>
      <div className="splash-left" />
      <div className="splash-right" />
      <div className="splash-content">
        <div className="splash-logo">
          <Logo size={56} />
        </div>
        <p className="splash-welcome">Welcome to</p>
        <h1 className="splash-name">{name}</h1>
        <div className="splash-line" />
      </div>
    </div>
  );
}
