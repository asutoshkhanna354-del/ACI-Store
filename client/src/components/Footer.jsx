import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { storeName: themeStoreName } = useTheme();
  const storeName = themeStoreName || 'FF Panel';

  return (
    <footer className="footer">
      <div className="container">
        <p style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px', background: 'linear-gradient(135deg, #fff, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {storeName}
        </p>
        <p style={{ fontSize: '13px' }}>Premium FF Panels for iOS & Android</p>
        <p style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </p>
      </div>
      <div className="dev-credit">
        <p>Developed with passion by <strong>Ibrahim Prodhan</strong></p>
        <a href="https://wa.me/8801823373439" target="_blank" rel="noopener noreferrer" className="dev-contact">
          Contact Developer
        </a>
      </div>
    </footer>
  );
}
