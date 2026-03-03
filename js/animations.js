/* ============================================
   NextMove — Animations
   Constellation network + Typing effect
   ============================================ */

// --- Constellation Animation ---
const Constellation = (() => {
  const canvas = document.getElementById('constellation');
  if (!canvas) return { init() {}, destroy() {} };

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  let animId = null;
  let isRunning = false;

  const CONFIG = {
    particleCount: 60,
    maxDistance: 150,
    speed: 0.3,
    particleSize: 2,
    mouseRadius: 200,
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = window.innerWidth < 768 ? Math.floor(CONFIG.particleCount * 0.5) : CONFIG.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: Math.random() * CONFIG.particleSize + 1,
      });
    }
  }

  function getStyles() {
    const root = getComputedStyle(document.documentElement);
    return {
      dot: root.getPropertyValue('--kr-constellation-dot').trim() || 'rgba(26,35,126,0.15)',
      line: root.getPropertyValue('--kr-constellation-line').trim() || 'rgba(26,35,126,0.06)',
      glow: root.getPropertyValue('--kr-constellation-glow').trim() || 'rgba(0,137,123,0.4)',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const styles = getStyles();

    // Update + draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Mouse glow
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nearMouse = dist < CONFIG.mouseRadius;

      ctx.beginPath();
      ctx.arc(p.x, p.y, nearMouse ? p.size * 1.8 : p.size, 0, Math.PI * 2);
      ctx.fillStyle = nearMouse ? styles.glow : styles.dot;
      ctx.fill();
    }

    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.maxDistance) {
          const opacity = 1 - dist / CONFIG.maxDistance;

          // Check if either particle is near mouse
          const dxm1 = particles[i].x - mouse.x;
          const dym1 = particles[i].y - mouse.y;
          const dxm2 = particles[j].x - mouse.x;
          const dym2 = particles[j].y - mouse.y;
          const nearMouse = Math.sqrt(dxm1*dxm1 + dym1*dym1) < CONFIG.mouseRadius ||
                            Math.sqrt(dxm2*dxm2 + dym2*dym2) < CONFIG.mouseRadius;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = nearMouse
            ? styles.glow.replace(/[\d.]+\)$/, (opacity * 0.5) + ')')
            : styles.line.replace(/[\d.]+\)$/, (opacity * 0.15) + ')');
          ctx.lineWidth = nearMouse ? 1.2 : 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
  }

  function init() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (isRunning) return;

    resize();
    createParticles();
    isRunning = true;

    window.addEventListener('resize', () => { resize(); createParticles(); });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    draw();
  }

  function destroy() {
    if (animId) cancelAnimationFrame(animId);
    isRunning = false;
    window.removeEventListener('resize', resize);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
  }

  return { init, destroy };
})();


// --- Typing Effect ---
const TypingEffect = (() => {
  const phrases = [
    'Odkryj swoje powołanie...',
    'Kim chcesz zostać?',
    'Blisko 80 szczegółowych profili zawodów',
    'Zarobki, uczelnie, szkolenia i oferty pracy',
    'Znajdź swoją ścieżkę kariery',
  ];

  let element = null;
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let timeout = null;

  const SPEED_TYPE = 60;
  const SPEED_DELETE = 35;
  const PAUSE_END = 2000;
  const PAUSE_START = 500;

  function tick() {
    if (!element) return;

    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      charIdx--;
      element.textContent = currentPhrase.substring(0, charIdx);

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        timeout = setTimeout(tick, PAUSE_START);
        return;
      }
      timeout = setTimeout(tick, SPEED_DELETE);
    } else {
      charIdx++;
      element.textContent = currentPhrase.substring(0, charIdx);

      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        timeout = setTimeout(tick, PAUSE_END);
        return;
      }
      timeout = setTimeout(tick, SPEED_TYPE);
    }
  }

  function init() {
    // Respect prefers-reduced-motion — show static text instead
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element = document.getElementById('typingText');
      if (element) element.textContent = phrases[0].replace('...', '');
      return;
    }

    element = document.getElementById('typingText');
    if (!element) return;
    tick();
  }

  function destroy() {
    if (timeout) clearTimeout(timeout);
    element = null;
  }

  return { init, destroy };
})();
