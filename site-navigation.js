'use strict';
(() => {
  const script = document.currentScript;
  const root = new URL('./', script.src);
  const legacy = {
    features:'features/#features', subtitles:'features/#subtitles', start:'guide/#start',
    download:'guide/#download', 'development-title':'guide/#development-title', updates:'guide/#updates',
    responsibility:'safety/#responsibility', 'responsibility-title':'safety/#responsibility-title',
    faq:'faq/#faq', preregister:'preregister/', 'registration-privacy':'preregister/#registration-privacy'
  };
  function migrateLegacyAnchor() {
    if (![root.pathname,root.pathname+'index.html'].includes(location.pathname)) return;
    const destination = legacy[location.hash.slice(1)];
    if (destination) location.replace(new URL(destination,root).href);
  }
  migrateLegacyAnchor();
  addEventListener('hashchange',migrateLegacyAnchor);
  const header = document.querySelector('.site-header');
  const menuButton = header.querySelector('.nav-toggle');
  const navigation = header.querySelector('.primary-nav');
  const mobileNav = matchMedia('(max-width:900px)');
  const setMenu = open => {
    navigation.hidden = mobileNav.matches && !open;
    menuButton.setAttribute('aria-expanded', String(mobileNav.matches && open));
  };
  menuButton.hidden = false;
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(navigation.hidden));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNav.matches && !navigation.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setMenu(false);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  mobileNav.addEventListener('change', () => {
    // Keep focus visible when resizing an open menu to mobile or hiding the toggle on PC.
    if (mobileNav.matches && navigation.contains(document.activeElement)) menuButton.focus();
    if (!mobileNav.matches && document.activeElement === menuButton) navigation.querySelector('a[aria-current="page"]').focus();
    setMenu(false);
  });
  const updateOffset = () => document.documentElement.style.setProperty('--header-offset',Math.ceil(header.getBoundingClientRect().height+18)+'px');
  updateOffset();
  new ResizeObserver(updateOffset).observe(header);
  function alignDetailAnchor() {
    const id = location.hash.slice(1);
    const home = document.body.classList.contains('site-home');
    if (!document.body.classList.contains('detail-page') && !home) return;
    if (home && legacy[id]) return;
    const target = document.getElementById(id);
    for (let parent = target?.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    target?.scrollIntoView({block:'start'});
  }
  addEventListener('hashchange',() => requestAnimationFrame(alignDetailAnchor));
  const toc = document.querySelector('[data-toc]');
  if (toc) {
    const narrow = matchMedia('(max-width:900px)');
    const setTocLayout = () => { toc.open = !narrow.matches; };
    setTocLayout();
    narrow.addEventListener('change',setTocLayout);
    toc.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click',() => {
      const destination = document.getElementById(link.hash.slice(1));
      if (narrow.matches) toc.open = false;
      requestAnimationFrame(() => destination?.focus({preventScroll:true}));
    }));
  }
  requestAnimationFrame(alignDetailAnchor);
})();
