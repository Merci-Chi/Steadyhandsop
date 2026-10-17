'use strict';
(() => {
  const trigger = document.querySelector('#translate-toggle');
  const panel = document.querySelector('#language-dialog');
  if (!trigger || !panel) return;
  const search = panel.querySelector('input');
  const list = panel.querySelector('.language-options');
  const status = document.querySelector('#translation-status');
  const popular = ['en', 'es', 'zh-CN', 'hi', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur'];
  const languages = new Map((window.EL_JEFE_LANGUAGES || []).map(item => [item.code, item.name]));
  languages.set('en', 'English');
  languages.set('es', 'Spanish');
  let selected = 'en';
  let provider;
  let selectionVersion = 0;
  let offsetFrame = 0;
  try { selected = localStorage.getItem('el-jefe-language') || 'en'; } catch {}
  const restoreRequested = new URLSearchParams(location.search).get('lang') === 'en';
  if (restoreRequested) {
    selected = 'en';
    try { localStorage.setItem('el-jefe-language', 'en'); } catch {}
  }

  function label(code, name) {
    if (code === 'es') return 'Español / Spanish';
    return name;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const ordered = [...popular.filter(code => languages.has(code)),
      ...[...languages.keys()].filter(code => !popular.includes(code))
        .sort((a, b) => languages.get(a).localeCompare(languages.get(b), 'en'))];
    list.replaceChildren();
    let group = '';
    let count = 0;
    for (const code of ordered) {
      const name = languages.get(code);
      let native = '';
      try { native = new Intl.DisplayNames([code], { type: 'language' }).of(code); } catch {}
      if (query && !`${code} ${name} ${native} ${label(code, name)}`.toLocaleLowerCase().includes(query)) continue;
      const heading = popular.includes(code) ? 'TOP 10 LANGUAGES' : 'ALL OTHER LANGUAGES';
      if (heading !== group) {
        const title = document.createElement('h3');
        title.textContent = heading;
        list.append(title);
        group = heading;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'language-option';
      button.dataset.language = code;
      button.setAttribute('aria-pressed', String(code === selected));
      const text = document.createElement('span');
      text.textContent = label(code, name);
      const mark = document.createElement('span');
      mark.className = 'language-code';
      mark.textContent = code === selected ? '✓' : code.toUpperCase();
      mark.setAttribute('aria-hidden', 'true');
      button.append(text, mark);
      button.addEventListener('click', () => choose(code));
      list.append(button);
      count++;
    }
    if (!count) {
      const empty = document.createElement('p');
      empty.className = 'language-empty';
      empty.textContent = 'No languages match. Try another name.';
      list.append(empty);
    }
  }
  function positionPanel() {
    const top = Math.max(12, Math.min(trigger.getBoundingClientRect().bottom + 10, innerHeight - 180));
    const value = top + 'px';
    if (panel.style.getPropertyValue('--language-panel-top') !== value) {
      panel.style.setProperty('--language-panel-top', value);
    }
  }
  function closePanel() {
    panel.close();
  }
  trigger.addEventListener('click', () => {
    if (panel.open) { closePanel(); return; }
    search.value = '';
    render();
    positionPanel();
    panel.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    search.focus();
    loadProvider();
  });
  panel.querySelector('.language-close').addEventListener('click', closePanel);
  panel.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closePanel();
  });
  panel.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || event.target === search) return;
    const buttons = [...list.querySelectorAll('button')];
    if (!buttons.length) return;
    let index = buttons.indexOf(document.activeElement);
    if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = buttons.length - 1;
    else index = (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    event.preventDefault();
    buttons[index].focus();
  });
  search.addEventListener('input', render);

  function loadProvider() {
    if (provider) return provider;
    provider = new Promise(resolve => {
      let settled = false;
      const finish = combo => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        observer.disconnect();
        if (combo) {
          for (const option of combo.options) {
            if (option.value) languages.set(option.value, option.textContent.trim());
          }
          if (panel.open) render();
        }
        resolve(combo);
      };
      const findCombo = () => {
        const combo = document.querySelector('#google-translate-provider .goog-te-combo');
        if (combo?.options.length > 1) finish(combo);
      };
      const observer = new MutationObserver(findCombo);
      observer.observe(document.querySelector('#google-translate-provider'), { childList: true, subtree: true });
      const timer = setTimeout(() => finish(null), 8000);
      window.elJefeGoogleTranslateReady = () => {
        try {
          new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google-translate-provider');
          findCombo();
        } catch { finish(null); }
      };
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=elJefeGoogleTranslateReady';
      script.async = true;
      script.addEventListener('error', () => finish(null));
      document.head.append(script);
    });
    return provider;
  }
  function clearTranslationCookies() {
    const source = new URL(trigger.dataset.sourceUrl);
    const paths = ['/', source.pathname.slice(0, source.pathname.lastIndexOf('/') + 1)];
    const domains = ['', location.hostname, '.' + location.hostname];
    const parts = location.hostname.split('.');
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    for (const path of paths) for (const domain of domains) {
      document.cookie = `googtrans=; Max-Age=0; path=${path}; SameSite=Lax${domain ? '; domain=' + domain : ''}`;
    }
  }
  if (restoreRequested) clearTranslationCookies();
  function restoreEnglish() {
    clearTranslationCookies();
    const source = new URL(trigger.dataset.sourceUrl);
    source.searchParams.set('lang', 'en');
    window.location.assign(source.href);
  }
  async function choose(code) {
    if (!languages.has(code)) return;
    const version = ++selectionVersion;
    selected = code;
    try { localStorage.setItem('el-jefe-language', code); } catch {}
    closePanel();
    if (code === 'en') { restoreEnglish(); return; }
    status.textContent = 'Translating with Google…';
    const combo = await loadProvider();
    if (version !== selectionVersion) return;
    if (combo && [...combo.options].some(option => option.value === code)) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      status.textContent = 'Translation requested. Use the Translate button to change language.';
      return;
    }
    // Google's own website translator remains available when the widget cannot load.
    const url = new URL('https://translate.google.com/translate');
    url.searchParams.set('sl', 'en');
    url.searchParams.set('tl', code);
    url.searchParams.set('u', trigger.dataset.sourceUrl);
    window.location.assign(url.href);
  }

  function syncToolbar() {
    offsetFrame = 0;
    let height = 0;
    for (const frame of document.querySelectorAll('iframe.goog-te-banner-frame,iframe.VIpgJd-ZVi9od-ORHb-OEVmcd')) {
      const rect = frame.getBoundingClientRect();
      if (getComputedStyle(frame).visibility !== 'hidden' && rect.width > innerWidth / 2 && rect.height > 0 && rect.top >= -1 && rect.top < 80) {
        height = Math.max(height, Math.ceil(rect.bottom));
      }
    }
    const value = height + 'px';
    if (document.documentElement.style.getPropertyValue('--google-bar-height') !== value) {
      document.documentElement.style.setProperty('--google-bar-height', value);
    }
    if (panel.open) positionPanel();
  }
  const queueToolbar = () => { if (!offsetFrame) offsetFrame = requestAnimationFrame(syncToolbar); };
  new MutationObserver(queueToolbar).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  window.addEventListener('resize', queueToolbar, { passive: true });
  queueToolbar();
  if (selected !== 'en') loadProvider();
})();
