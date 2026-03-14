import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(standalone);
    if (standalone) return;

    const dismissed = localStorage.getItem('ff_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return;

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => setShowBanner(true), 2000);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (!ios && !('onbeforeinstallprompt' in window)) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('ff_install_dismissed', String(Date.now()));
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-inner">
        <div className="install-banner-icon">
          <img src="/icon-192.png" alt="FF Panel" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
        </div>
        <div className="install-banner-text">
          <strong>Install FF Panel</strong>
          {isIOS ? (
            <p>
              Tap <span style={{ fontWeight: '700' }}>Share</span> then <span style={{ fontWeight: '700' }}>Add to Home Screen</span>
            </p>
          ) : deferredPrompt ? (
            <p>Get quick access from your home screen</p>
          ) : (
            <p>
              Use your browser menu → <span style={{ fontWeight: '700' }}>Add to Home Screen</span>
            </p>
          )}
        </div>
        <div className="install-banner-actions">
          {deferredPrompt && (
            <button className="btn btn-primary btn-sm" onClick={handleInstall}>Install</button>
          )}
          <button className="install-banner-close" onClick={dismiss}>✕</button>
        </div>
      </div>
    </div>
  );
}
