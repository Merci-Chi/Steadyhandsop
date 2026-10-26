/* Accessible mobile navigation. No desktop behavior changes. */
(() => {
  const header = document.querySelector('.site-header');
  const inner = header?.querySelector('.header-inner');
  const nav = inner?.querySelector('.primary-nav');
  const call = inner?.querySelector('.header-action');
  if (!header || !inner || !nav || !call) return;
  nav.id = nav.id || 'mobile-primary-navigation';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-menu-toggle';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation menu');
  toggle.innerHTML = '<svg class="menu-open-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="menu-close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  call.insertAdjacentElement('afterend', toggle);
  header.classList.add('mobile-nav-ready');
  const close = (restoreFocus = false) => {
    header.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('mobile-nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    if (isOpen) nav.querySelector('a')?.focus({ preventScroll: true });
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('mobile-nav-open')) close(true);
  });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) close();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) close();
  });
})();
