import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

function hexToRGB(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}

const effects = {
  fire: (ctx, w, h, particles, color) => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y -= p.vy;
      p.x += Math.sin(p.life * 0.05) * 0.5;
      p.life--;
      p.size *= 0.98;
      const alpha = (p.life / p.maxLife) * 0.6;
      const progress = 1 - p.life / p.maxLife;
      let r, g, b;
      if (progress < 0.3) {
        r = 255; g = 200 + Math.random() * 55; b = 50;
      } else if (progress < 0.6) {
        r = 255; g = 100 + Math.random() * 80; b = 0;
      } else {
        r = 200; g = 30; b = 0;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
      if (p.life <= 0 || p.size < 0.5) {
        particles[i] = createFireParticle(w, h);
      }
    }
  },
  snow: (ctx, w, h, particles, color) => {
    for (const p of particles) {
      p.y += p.vy;
      p.x += Math.sin(p.drift) * 0.3;
      p.drift += 0.01;
      if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
    }
  },
  bubbles: (ctx, w, h, particles, color) => {
    const c = hexToRGB(color);
    for (const p of particles) {
      p.y -= p.vy;
      p.x += Math.sin(p.wobble) * 0.5;
      p.wobble += 0.02;
      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${p.alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.4})`;
      ctx.fill();
    }
  },
  stars: (ctx, w, h, particles, color) => {
    const c = hexToRGB(color);
    for (const p of particles) {
      p.twinkle += p.twinkleSpeed;
      const alpha = (Math.sin(p.twinkle) + 1) / 2 * 0.7 + 0.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      ctx.shadowBlur = p.size * 3;
      ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  },
  sparkles: (ctx, w, h, particles, color) => {
    const c = hexToRGB(color);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.life--;
      const alpha = (p.life / p.maxLife) * 0.8;
      const size = p.size * (p.life / p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      ctx.fillRect(-size / 2, -1, size, 2);
      ctx.fillRect(-1, -size / 2, 2, size);
      ctx.restore();
      p.angle += 0.05;
      if (p.life <= 0) {
        particles[i] = createSparkle(w, h);
      }
    }
  },
  matrix: (ctx, w, h, particles, color) => {
    const c = hexToRGB(color);
    ctx.font = '14px monospace';
    for (const p of particles) {
      const char = String.fromCharCode(0x30A0 + Math.random() * 96);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${p.alpha})`;
      ctx.fillText(char, p.x, p.y);
      p.y += p.vy;
      if (p.y > h) { p.y = -20; p.alpha = 0.1 + Math.random() * 0.3; }
    }
  }
};

function createFireParticle(w, h) {
  return { x: Math.random() * w, y: h + 10, vy: 1 + Math.random() * 3, size: 2 + Math.random() * 4, life: 60 + Math.random() * 60, maxLife: 120 };
}

function createSparkle(w, h) {
  return { x: Math.random() * w, y: Math.random() * h, size: 3 + Math.random() * 6, life: 30 + Math.random() * 60, maxLife: 90, angle: Math.random() * Math.PI * 2 };
}

function initParticles(effect, w, h) {
  const count = effect === 'matrix' ? Math.floor(w / 20) : effect === 'fire' ? 80 : effect === 'stars' ? 60 : effect === 'sparkles' ? 40 : 50;
  const arr = [];
  for (let i = 0; i < count; i++) {
    switch (effect) {
      case 'fire': arr.push(createFireParticle(w, h)); break;
      case 'snow': arr.push({ x: Math.random() * w, y: Math.random() * h, size: 1 + Math.random() * 3, vy: 0.3 + Math.random() * 1, alpha: 0.2 + Math.random() * 0.4, drift: Math.random() * Math.PI * 2 }); break;
      case 'bubbles': arr.push({ x: Math.random() * w, y: Math.random() * h, size: 4 + Math.random() * 12, vy: 0.3 + Math.random() * 0.8, alpha: 0.2 + Math.random() * 0.3, wobble: Math.random() * Math.PI * 2 }); break;
      case 'stars': arr.push({ x: Math.random() * w, y: Math.random() * h, size: 1 + Math.random() * 2, twinkle: Math.random() * Math.PI * 2, twinkleSpeed: 0.02 + Math.random() * 0.04 }); break;
      case 'sparkles': arr.push(createSparkle(w, h)); break;
      case 'matrix': arr.push({ x: i * 20, y: Math.random() * h, vy: 2 + Math.random() * 4, alpha: 0.1 + Math.random() * 0.3 }); break;
    }
  }
  return arr;
}

export default function ParticleCanvas() {
  const { particleEffect, themeColor } = useTheme();
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (particleEffect === 'none' || !effects[particleEffect]) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(particleEffect, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      effects[particleEffect](ctx, canvas.width, canvas.height, particlesRef.current, themeColor);
      animRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [particleEffect, themeColor]);

  if (particleEffect === 'none' || !effects[particleEffect]) return null;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.7
      }}
    />
  );
}
