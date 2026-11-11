'use strict';
(() => {
  const form = document.querySelector('#home-preview-code-form');
  if (!form) return;
  const input = document.querySelector('#home-preview-code');
  const status = document.querySelector('#home-preview-code-message');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = input.value.trim();
    if (!code) return;
    // Use the existing public preview map for known codes. Otherwise let the
    // original preview page resolve site keys (including portal-backed keys).
    const previews = window.STEADY_HANDS?.previews || {};
    const match = Object.entries(previews).find(([key]) => key.toLowerCase() === code.toLowerCase());
    if (match) {
      const destination = new URL(match[1], location.href);
      if (destination.protocol === 'https:' || destination.protocol === 'http:') {
        location.assign(destination.href);
        return;
      }
    }
    status.textContent = 'Checking your preview code…';
    location.assign('preview.html?code=' + encodeURIComponent(code));
  });
})();
