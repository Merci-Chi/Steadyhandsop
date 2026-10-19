'use strict';
// Public website previews are discovered from the GitHub sites/ directory.
(() => {
  const form = document.querySelector('#custom-preview-form');
  if (!form) return;

  const select = form.querySelector('select');
  const button = form.querySelector('button');
  const message = document.querySelector('#custom-preview-message');
  const codeForm = document.querySelector('#preview-page-form');
  const codeInput = document.querySelector('#preview-page-code');
  const codeMessage = document.querySelector('#preview-page-message');
  const sites = new Map();
  const names = new Map(
    (window.STEADY_HANDS?.customPreviews || [])
      .filter(site => site && typeof site.path === 'string')
      .map(site => [site.path.replace(/^sites\//, '').replace(/\/$/, '').toLowerCase(), site.name])
  );
  const validFolder = name => typeof name === 'string' &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(name) && name !== '.' && name !== '..';
  const urlFor = name => new URL('sites/' + encodeURIComponent(name) + '/', window.location.href).href;

  function addSite(name) {
    if (!validFolder(name) || sites.has(name.toLowerCase())) return;
    sites.set(name.toLowerCase(), urlFor(name));
    const option = document.createElement('option');
    option.value = name;
    option.textContent = names.get(name.toLowerCase()) || name;
    select.append(option);
  }

  function refreshPicker() {
    select.disabled = sites.size === 0;
    button.disabled = !sites.has(select.value.toLowerCase());
  }

  // Catch folder-name preview codes before the existing generic site-key handler.
  // Other preview codes still use the original handler unchanged.
  if (codeForm && codeInput) {
    codeForm.addEventListener('submit', event => {
      const code = codeInput.value.trim().toLowerCase();
      const destination = sites.get(code);
      if (!destination) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (codeMessage) codeMessage.textContent = 'Opening your preview…';
      window.location.assign(destination);
    }, true);
  }

  select.addEventListener('change', () => {
    refreshPicker();
    message.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const destination = sites.get(select.value.toLowerCase());
    if (!destination) {
      message.textContent = 'Choose your site to open its preview.';
      return;
    }
    message.textContent = 'Opening your preview…';
    window.location.assign(destination);
  });

  async function loadSites() {
    // Populate the published fallback list immediately. Discovery adds new folders.
    for (const site of window.STEADY_HANDS?.customPreviews || []) {
      const match = /^sites\/([^/]+)\/$/.exec(site?.path || '');
      if (match) addSite(match[1]);
    }
    refreshPicker();

    try {
      const response = await fetch(
        'https://api.github.com/repos/Merci-Chi/Steadyhandsop/contents/sites?ref=main',
        { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' }
      );
      if (!response.ok) throw new Error('GitHub directory request failed: ' + response.status);
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error('Unexpected GitHub directory response');

      // GitHub's directory listing is the authority: exclude plain files.
      const folders = entries.filter(entry => entry?.type === 'dir' && validFolder(entry.name));
      sites.clear();
      select.replaceChildren(new Option('Choose your site', ''));
      folders.forEach(entry => addSite(entry.name));
      refreshPicker();
      message.textContent = folders.length ? '' : 'No website folders have been published yet.';
    } catch (error) {
      console.warn('Unable to refresh website list from GitHub:', error);
      message.textContent = sites.size
        ? 'Showing saved previews. New sites may take a moment to appear.'
        : 'Unable to load previews right now. Please try again later.';
    }
  }

  loadSites();
})();
