'use strict';
// This catalogue is public, just like the websites in sites/.
(() => {
  const form = document.querySelector('#custom-preview-form');
  if (!form) return;
  const select = form.querySelector('select');
  const button = form.querySelector('button');
  const message = document.querySelector('#custom-preview-message');
  const sites = new Map();

  for (const site of window.STEADY_HANDS?.customPreviews || []) {
    // Only published local site directories can be opened from this picker.
    if (!site || typeof site.name !== 'string' || !site.name.trim() ||
        !/^sites\/[a-z0-9-]+\/$/.test(site.path) || sites.has(site.path)) continue;
    sites.set(site.path, new URL(site.path, window.location.href).href);
    const option = document.createElement('option');
    option.value = site.path;
    option.textContent = site.name;
    select.append(option);
  }

  select.disabled = sites.size === 0;
  if (!sites.size) message.textContent = 'No custom previews are available yet. Contact us for your preview link.';
  select.addEventListener('change', () => {
    button.disabled = !sites.has(select.value);
    if (sites.size) message.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const url = sites.get(select.value);
    if (!url) {
      message.textContent = 'Choose your site to open its preview.';
      return;
    }
    message.textContent = 'Opening your preview…';
    window.location.assign(url);
  });
})();
