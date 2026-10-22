'use strict';

// Add the business's confirmed social URLs here. Empty entries stay hidden.
// These are the only values you need to change to enable the extra icons.
const SOCIAL_LINKS = {
  instagram: '',
  facebook: ''
};

document.getElementById('year').textContent = new Date().getFullYear();

const socialContainer = document.querySelector('.socials');
Object.entries(SOCIAL_LINKS).forEach(([name, url]) => {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const domains = name === 'instagram' ? ['instagram.com', 'www.instagram.com'] : ['facebook.com', 'www.facebook.com', 'fb.com'];
    if (parsed.protocol !== 'https:' || !domains.includes(parsed.hostname)) return;
    const link = document.createElement('a');
    link.href = parsed.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Anka Jewelry on ${name === 'instagram' ? 'Instagram' : 'Facebook'}`);
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.classList.add('icon');
    icon.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#i-${name}`);
    icon.append(use);
    link.append(icon);
    socialContainer.prepend(link);
  } catch { /* Ignore invalid configuration rather than rendering a broken link. */ }
});

// Responsive navigation.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

// Keep only one FAQ open. Native <details> also works with JavaScript disabled.
const questions = [...document.querySelectorAll('.faq-list details')];
questions.forEach(question => question.addEventListener('toggle', () => {
  if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
}));

// Accessible full-size photo viewer: native dialog traps focus and restores it
// to the initiating photo. Escape, arrow keys and touch swipes are supported.
const viewer = document.getElementById('photo-viewer');
const viewerImage = document.getElementById('viewer-image');
const caption = document.getElementById('photo-caption');
const counter = document.getElementById('photo-counter');
const photos = [...document.querySelectorAll('[data-photo]')];
let photoIndex = 0;
let touchStart = null;

function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  viewerImage.src = photo.dataset.photo;
  viewerImage.alt = photo.querySelector('img').alt;
  caption.textContent = photo.dataset.caption;
  counter.textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
}
photos.forEach((photo, index) => photo.addEventListener('click', () => {
  if (typeof viewer.showModal !== 'function') {
    window.open(photo.dataset.photo, '_blank', 'noopener');
    return;
  }
  showPhoto(index);
  viewer.showModal();
  document.body.classList.add('modal-open');
}));
document.getElementById('close-photo').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => document.body.classList.remove('modal-open'));
viewer.addEventListener('click', event => {
  if (event.target === viewer) {
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
  }
});
viewer.querySelector('.photo-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
viewer.querySelector('.photo-next').addEventListener('click', () => showPhoto(photoIndex + 1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
viewerImage.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
viewerImage.addEventListener('touchend', event => {
  if (touchStart === null) return;
  const difference = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(difference) > 55) showPhoto(photoIndex + (difference < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

// AMBIENT FILM: forward/reverse motion with gradual eased turnarounds is encoded in the MP4.
// Native playback gives smooth, silent looping independent of page scrolling.
(() => {
  const video = document.getElementById('hero-video');
  const toggle = document.getElementById('film-toggle');
  if (!video || !toggle) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let allowMotion = false;
  video.muted = true;
  video.defaultMuted = true;
  toggle.hidden = false;

  function updateButton() {
    toggle.textContent = video.paused ? 'Play film' : 'Pause film';
    toggle.setAttribute('aria-label', video.paused ? 'Play background film' : 'Pause background film');
  }

  function syncPlayback() {
    const shouldPlay = !userPaused && !document.hidden && (!motion.matches || allowMotion);
    if (!shouldPlay) { video.pause(); updateButton(); return; }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(updateButton);
  }

  toggle.addEventListener('click', () => {
    userPaused = !video.paused;
    if (!userPaused) allowMotion = true;
    syncPlayback();
  });
  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => { toggle.hidden = true; });
  video.addEventListener('canplay', syncPlayback);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pageshow', syncPlayback);
  motion.addEventListener('change', () => { allowMotion = false; syncPlayback(); });
  updateButton();
  syncPlayback();
})();

// Adaptive cursor: white difference blending inverts the pixels beneath it.
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  if (!window.CSS || !CSS.supports('mix-blend-mode', 'difference')) return;
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const edge = document.createElement('div');
  edge.className = 'custom-cursor custom-cursor-edge';
  edge.setAttribute('aria-hidden', 'true');
  document.body.append(edge, cursor);
  const interactive = 'a[href], button, summary, label[for], select, input, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  let x = 0;
  let y = 0;
  let visible = false;

  function hide() {
    visible = false;
    document.documentElement.classList.remove('custom-cursor-active');
  }
  function updateTarget(target) {
    const control = target instanceof Element ? target.closest(interactive) : null;
    const selectable = !!control && !control.matches(':disabled, [aria-disabled="true"], [inert], [inert] *');
    cursor.classList.toggle('is-selectable', selectable);
    edge.classList.toggle('is-selectable', selectable);
    // Cross-origin maps keep their own native pointer and interaction behavior.
    if (target instanceof Element && target.closest('iframe')) hide();
  }
  function move(event) {
    if (event.pointerType !== 'mouse' || !finePointer.matches || forcedColors.matches) { hide(); return; }
    x = event.clientX;
    y = event.clientY;
    for (const layer of [edge, cursor]) {
      layer.style.left = `${x}px`;
      layer.style.top = `${y}px`;
    }
    visible = true;
    document.documentElement.classList.add('custom-cursor-active');
    updateTarget(event.target);
  }
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', event => { if (visible) updateTarget(event.target); }, { passive: true });
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); });
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hide(); }, { passive: true });
  document.addEventListener('keydown', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', hide);
  document.addEventListener('scroll', () => { if (visible) updateTarget(document.elementFromPoint(x, y)); }, { passive: true, capture: true });
  finePointer.addEventListener('change', hide);
  forcedColors.addEventListener('change', hide);

  // A modal dialog lives above ordinary page layers; move the cursor with it.
  const dialog = document.getElementById('photo-viewer');
  if (dialog && typeof MutationObserver !== 'undefined') {
    new MutationObserver(() => {
      (dialog.open ? dialog : document.body).append(edge, cursor);
      if (visible) updateTarget(document.elementFromPoint(x, y));
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }
})();

// Every card enters once as it comes into view; content stays available
// if animation APIs are unavailable or the visitor prefers reduced motion.
(() => {
  const cards = [...document.querySelectorAll('.service, .photo-card, .watch-banner, .faq-list details, .platform-rating, .review-card, .contact-row, .map-panel')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (typeof IntersectionObserver === 'undefined' || !Element.prototype.animate) return;
  const running = new Set();
  const observer = new IntersectionObserver(entries => {
    const entering = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    entering.forEach((entry, index) => {
      observer.unobserve(entry.target);
      if (motion.matches) return;
      const animation = entry.target.animate([
        { opacity: 0, translate: '0 28px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 650, delay: Math.min(index, 3) * 75, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'backwards' });
      running.add(animation);
      animation.finished.then(() => running.delete(animation), () => running.delete(animation));
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  cards.forEach(card => observer.observe(card));
  motion.addEventListener('change', () => {
    if (motion.matches) { running.forEach(animation => animation.cancel()); running.clear(); }
  });
  // Keyboard navigation reveals the focused card immediately.
  document.addEventListener('focusin', event => {
    for (const animation of running) {
      if (animation.effect.target.contains(event.target)) animation.finish();
    }
  });
})();
