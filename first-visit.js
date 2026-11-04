/* Decorative, fail-open intro. Load asynchronously before the first stylesheet. */
(() => {
  'use strict';
  const root = document.documentElement;
  let deadline, readyTimer, motion;
  const clean = () => {
    root.removeAttribute('data-first-visit');
    document.getElementById('first-visit-intro')?.remove();
    clearTimeout(deadline);
    clearTimeout(readyTimer);
    document.removeEventListener('DOMContentLoaded', ready);
    document.removeEventListener('keydown', clean);
    document.removeEventListener('pointerdown', clean);
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', clean);
    motion?.removeEventListener?.('change', clean);
  };
  const fade = () => {
    root.setAttribute('data-first-visit', 'leaving');
    readyTimer = setTimeout(clean, 160);
  };
  const ready = () => {
    if (readyTimer !== undefined) return;
    document.removeEventListener('DOMContentLoaded', ready);
    readyTimer = setTimeout(fade, Math.max(0, 540 - (performance.now() - started)));
  };
  const visibility = () => { if (document.hidden) clean(); };
  const started = performance.now();
  try {
    const brand = document.currentScript.dataset.introBrand;
    if (brand !== 'editassist' && brand !== 'tsumuvoxel') return;
    const key = 's0miro.' + brand + '.first-visit.v1';
    if (sessionStorage.getItem(key)) return;
    // If storage is blocked/full, skip rather than replay on every navigation.
    sessionStorage.setItem(key, '1');
    motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Never cover content that has already painted, even if this async file is slow.
    if (motion.matches || document.hidden || performance.getEntriesByType('paint').length) return;
    deadline = setTimeout(clean, 800);
    document.addEventListener('DOMContentLoaded', ready, { once: true });
    document.addEventListener('keydown', clean, { once: true });
    document.addEventListener('pointerdown', clean, { once: true });
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', clean, { once: true });
    motion.addEventListener?.('change', clean, { once: true });
    root.setAttribute('data-first-visit', 'active');
    if (document.readyState !== 'loading') ready();
  } catch (_) {
    clean();
  }
})();
