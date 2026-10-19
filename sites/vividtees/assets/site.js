/* Vivid — portable, dependency-free interactions. Works from index.html. */
(function () {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const projects = window.VIVID_PROJECTS || [];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let toastTimer;
  function toast(message) {
    const el = $('.toast'); if (!el) return;
    el.textContent = message; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Keyboard-accessible mobile navigation.
  const menuButton = $('.menu-toggle'), nav = $('.nav');
  function closeMenu() {
    if (!menuButton || !nav) return;
    nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-wrap')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  }

  // Page progress and back-to-top.
  const progress = $('.scroll-progress'), topButton = $('.back-top');
  let scrollQueued = false;
  function updateScroll() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (height > 0 ? Math.min(100, window.scrollY / height * 100) : 0) + '%';
    if (topButton) topButton.classList.toggle('visible', window.scrollY > 600);
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { requestAnimationFrame(updateScroll); scrollQueued = true; }
  }, { passive: true });
  window.addEventListener('resize', updateScroll); updateScroll();
  if (topButton) topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    const focusTarget = $('.brand'); if (focusTarget) focusTarget.focus({ preventScroll: true });
  });

  // Compact outline cursor; click targets shrink it to a solid dot.
  const cursorToggle = $('.cursor-toggle'), ring = $('.cursor-ring');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const forcedColors = window.matchMedia('(forced-colors: active)');
  let cursorEnabled = true;
  try { cursorEnabled = localStorage.getItem('vivid-cursor') !== 'off'; } catch (_) { /* optional preference */ }
  function canUseCursor() { return cursorEnabled && finePointer.matches && !reducedMotion.matches && !forcedColors.matches; }
  function updateCursor() {
    document.documentElement.classList.remove('custom-cursor');
    if (cursorToggle) {
      cursorToggle.textContent = 'Custom cursor: ' + (cursorEnabled ? 'on' : 'off');
      cursorToggle.setAttribute('aria-pressed', String(cursorEnabled));
    }
  }
  function cursorContrast(target) {
    if (!ring) return;
    // Difference blending inverts the rendered pixels on photos and gradients.
    // Flat surfaces instead use the higher-contrast black/white option.
    let el = target;
    for (let i = 0; el && i < 12; i++, el = el.parentElement) {
      if (el.tagName === 'IMG' || el.tagName === 'CANVAS' || el.tagName === 'IFRAME') break;
      const style = getComputedStyle(el);
      if (style.backgroundImage && style.backgroundImage !== 'none') break;
      const channels = style.backgroundColor.match(/[\d.]+/g);
      if (!channels || channels.length < 3) continue;
      const alpha = channels.length > 3 ? Number(channels[3]) : 1;
      if (alpha < 0.97) continue; // A translucent layer needs the rendered backdrop.
      const rgb = channels.slice(0, 3).map(Number).map(c => {
        const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      ring.style.setProperty('--cursor-color', luminance > 0.179 ? '#08050e' : '#ffffff');
      ring.style.mixBlendMode = 'normal'; return;
    }
    ring.style.setProperty('--cursor-color', '#ffffff');
    ring.style.mixBlendMode = 'difference';
  }
  let lastSurface = null, lastContrastAt = 0;
  document.addEventListener('pointermove', event => {
    if (!canUseCursor() || event.pointerType === 'touch' || !ring) return;
    document.documentElement.classList.add('custom-cursor');
    ring.style.left = event.clientX + 'px'; ring.style.top = event.clientY + 'px';
    ring.textContent = '';
    const editable = event.target.closest('input:not([type="radio"]):not([type="checkbox"]),textarea');
    ring.classList.toggle('hide', Boolean(editable));
    const interactive = event.target.closest('a,button,summary,label,select,[role="button"],input[type="radio"],input[type="checkbox"]');
    const disabled = interactive && (interactive.disabled || interactive.getAttribute('aria-disabled') === 'true');
    ring.classList.toggle('is-interactive', Boolean(interactive && !disabled));
    const now = performance.now();
    if (event.target !== lastSurface || now - lastContrastAt > 60) {
      cursorContrast(event.target); lastSurface = event.target; lastContrastAt = now;
    }
  }, { passive: true });
  document.addEventListener('pointerdown', event => { if (ring && canUseCursor() && event.pointerType !== 'touch') ring.classList.add('is-pressed'); });
  document.addEventListener('pointerup', () => { if (ring) ring.classList.remove('is-pressed'); });
  document.addEventListener('pointercancel', () => { if (ring) ring.classList.remove('is-pressed'); });
  document.documentElement.addEventListener('pointerleave', () => { document.documentElement.classList.remove('custom-cursor');if(ring)ring.classList.remove('is-pressed'); });
  window.addEventListener('blur', () => { document.documentElement.classList.remove('custom-cursor');if(ring)ring.classList.remove('is-pressed'); });
  if (cursorToggle) cursorToggle.addEventListener('click', () => {
    cursorEnabled = !cursorEnabled;
    try { localStorage.setItem('vivid-cursor', cursorEnabled ? 'on' : 'off'); } catch (_) { /* optional preference */ }
    updateCursor();
  });
  [finePointer,reducedMotion,forcedColors].forEach(media => {
    if (media.addEventListener) media.addEventListener('change',updateCursor);
  });
  updateCursor();

  // Shared project cards and full-size image viewer.
  const dialog = $('#project-dialog');
  let viewerItems = [], viewerIndex = 0;
  function renderViewer() {
    const item = viewerItems[viewerIndex]; if (!item || !dialog) return;
    $('#project-full').src = 'assets/images/' + item.file + '.webp';
    $('#project-full').alt = item.description;
    $('#project-title').textContent = item.title;
    $('#project-category').textContent = item.category + ' / Vivid collection';
    $('#project-description').textContent = item.description;
    $('.lightbox-count').textContent = (viewerIndex + 1) + ' / ' + viewerItems.length;
    const service = { Apparel: 'Custom apparel', Engraving: 'Laser engraving', Promotional: 'Promotional products', Gifts: 'Personalized gifts' }[item.category] || 'Promotional products';
    $('#project-quote').href = 'contact.html?service=' + encodeURIComponent(service) + '&inspiration=' + encodeURIComponent(item.title);
    $('#project-original').href = 'assets/originals/' + item.file + '.jpg';
  }
  function openViewer(item, collection) {
    if (!dialog || typeof dialog.showModal !== 'function') { window.open('assets/originals/' + item.file + '.jpg', '_blank', 'noopener'); return; }
    viewerItems = collection; viewerIndex = Math.max(0, collection.findIndex(p => p.id === item.id));
    renderViewer(); dialog.showModal(); if (ring) dialog.appendChild(ring); document.body.classList.add('locked');
  }
  function projectCard(item, collection) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'project';
    button.setAttribute('aria-label', 'View ' + item.title);
    button.innerHTML = '<div class="project-image"><img src="assets/images/' + escapeHTML(item.file) + '-thumb.webp" alt="' + escapeHTML(item.description) + '" loading="lazy" decoding="async"><span class="round-arrow">' + arrow + '</span></div><div class="project-caption"><div><h3>' + escapeHTML(item.title) + '</h3><span>' + escapeHTML(item.category === 'Brand' ? 'Brand visual' : item.category) + '</span></div><small>↗</small></div>';
    button.addEventListener('click', () => openViewer(item, collection));
    return button;
  }
  if (dialog) {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.classList.remove('locked'); if (ring) document.body.appendChild(ring); });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      }
    });
    function changeImage(delta) { viewerIndex = (viewerIndex + delta + viewerItems.length) % viewerItems.length; renderViewer(); }
    $('#previous-project').addEventListener('click', () => changeImage(-1));
    $('#next-project').addEventListener('click', () => changeImage(1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); changeImage(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); changeImage(1); }
    });
  }
  $$('.curated-gallery').forEach(grid => {
    let list;
    if (grid.dataset.ids) list = grid.dataset.ids.split(',').map(id => projects.find(p => p.id === id)).filter(Boolean);
    else list = projects.filter(p => p.tags.includes(grid.dataset.category)).slice(0, 6);
    list.forEach(item => grid.appendChild(projectCard(item, list)));
  });
  const fullGallery = $('#full-gallery');
  if (fullGallery) {
    let filter = 'All', query = '', limit = 12;
    const more = $('#load-more'), count = $('#gallery-count'), search = $('#project-search');
    function renderGallery() {
      const list = projects.filter(p => (filter === 'All' || p.tags.includes(filter)) && (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().includes(query));
      fullGallery.replaceChildren();
      list.slice(0, limit).forEach(item => fullGallery.appendChild(projectCard(item, list)));
      if (!list.length) {
        const empty = document.createElement('p'); empty.className = 'empty';
        empty.textContent = 'No projects found. Try another word or choose a different category.';
        fullGallery.appendChild(empty);
      }
      count.textContent = list.length + (list.length === 1 ? ' image' : ' images') + (filter === 'All' ? ' in the collection' : ' matching ' + filter.toLowerCase());
      $('#gallery-progress').textContent = 'Showing ' + Math.min(limit, list.length) + ' of ' + list.length;
      more.hidden = list.length <= limit;
      // hidden must win over .btn display.
      more.style.display = list.length <= limit ? 'none' : '';
      updateScroll();
    }
    $$('.filter-btn').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter; limit = 12;
      $$('.filter-btn').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
      renderGallery();
    }));
    if (search) search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); limit = 12; renderGallery(); });
    more.addEventListener('click', () => {
      const previous = Math.min(limit, projects.length); limit += 12; renderGallery();
      const nextCard = $$('.project', fullGallery)[previous]; if (nextCard) nextCard.focus({ preventScroll: true });
    });
    renderGallery();
  }

  // Three-step enquiry builder. No backend or simulated form delivery.
  const form = $('#quote-form');
  if (form) {
    let step = 0;
    const panels = $$('.form-panel', form), next = $('#quote-next'), back = $('#quote-back');
    const status = $('#form-status'), preview = $('#quote-preview');
    const url = new URLSearchParams(window.location.search);
    if (url.get('service')) {
      const option = $$('input[name="service"]', form).find(input => input.value.toLowerCase() === url.get('service').toLowerCase());
      if (option) option.checked = true;
    }
    if (url.get('inspiration')) form.elements.idea.value = 'I’m inspired by your project: ' + url.get('inspiration') + '.\n\nMy idea: ';
    function enquiry() {
      const data = new FormData(form);
      return 'Hello Vivid,\n\nI’d like to discuss a custom project.\n\n' +
        'Project type: ' + (data.get('service') || 'To be discussed') + '\n' +
        'Name: ' + String(data.get('name') || '').trim() + '\n' +
        'Email: ' + String(data.get('email') || '').trim() + '\n' +
        'Quantity: ' + (String(data.get('quantity') || '').trim() || 'To be discussed') + '\n' +
        'Preferred deadline: ' + (data.get('deadline') || 'To be discussed') + '\n' +
        'Colors, sizes, preferences: ' + (String(data.get('preferences') || '').trim() || 'To be discussed') + '\n\n' +
        'My idea / wording:\n' + String(data.get('idea') || '').trim() + '\n\n' +
        'Please let me know the available options, pricing, and timing.\n\nThank you!';
    }
    function validPanel() {
      if (step === 0 && !$('input[name="service"]:checked', form)) {
        status.textContent = 'Please choose a project type to continue.';
        $('input[name="service"]', form).focus(); return false;
      }
      for (const input of $$('input,textarea,select', panels[step])) {
        if (!input.checkValidity()) { input.reportValidity(); return false; }
        if (input.required && input.type !== 'radio' && !input.value.trim()) {
          status.textContent = 'Please fill in ' + input.name + ' before continuing.'; input.focus(); return false;
        }
      }
      return true;
    }
    function renderStep(focus = true) {
      panels.forEach((panel, index) => { panel.hidden = index !== step; });
      $('#step-label').textContent = 'Step ' + (step + 1) + ' of 3';
      $('.form-progress span', form).style.width = ((step + 1) / 3 * 100) + '%';
      back.hidden = step === 0; back.style.display = step === 0 ? 'none' : '';
      next.hidden = step === 2; next.style.display = step === 2 ? 'none' : '';
      next.innerHTML = (step === 0 ? 'Next: the details ' : 'Review your enquiry ') + arrow;
      $('#form-footnote').textContent = step === 2 ? 'Ready when you are.' : 'No payment. Just possibilities.';
      status.textContent = '';
      if (step === 2) {
        const body = enquiry(); preview.textContent = body;
        const subject = 'Custom project enquiry — ' + ($('input[name="service"]:checked', form)?.value || 'Vivid');
        $('#email-quote').href = 'mailto:vividteesllc@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }
      if (focus) { const h = $('h3', panels[step]); h.tabIndex = -1; h.focus({ preventScroll: true }); }
      updateScroll();
    }
    next.addEventListener('click', () => { if (validPanel()) { step = Math.min(2, step + 1); renderStep(); } });
    back.addEventListener('click', () => { step = Math.max(0, step - 1); renderStep(); });
    form.addEventListener('submit', event => { event.preventDefault(); if (step < 2 && validPanel()) { step++; renderStep(); } });
    $('#email-quote').addEventListener('click', () => { status.textContent = 'Your email app should open with the draft. Review, attach artwork if needed, and send it there. If nothing opens, copy the enquiry and email vividteesllc@gmail.com.'; });
    $('#copy-quote').addEventListener('click', async () => {
      const text = enquiry();
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        toast('Enquiry copied. Paste it into your email or Facebook message.');
      } catch (_) {
        const copy = document.createElement('textarea'); copy.value = text;
        copy.style.position = 'fixed'; copy.style.left = '-9999px'; document.body.appendChild(copy);
        copy.select(); let copied = false;
        try { copied = document.execCommand('copy'); } catch (_) { /* select visible preview below */ }
        copy.remove();
        if (copied) toast('Enquiry copied. Paste it into your email or Facebook message.');
        else {
          const selection = window.getSelection(), range = document.createRange(); range.selectNodeContents(preview);
          if (selection) { selection.removeAllRanges(); selection.addRange(range); }
          status.textContent = 'Select and copy the highlighted enquiry, then email vividteesllc@gmail.com.';
        }
      }
    });
    renderStep(false);
  }

  // Load Facebook only on request. A permanent direct link remains outside every embed.
  $$('.load-embed').forEach(button => button.addEventListener('click', () => {
    const stage = button.closest('.embed-stage');
    const type = stage.dataset.embedType;
    let href = stage.dataset.embedUrl;
    if (type === 'page') href = 'https://www.facebook.com/61585211831500/';
    const width = Math.max(220, Math.min(500, Math.round(stage.getBoundingClientRect().width)));
    const params = new URLSearchParams({ href, width: String(width), show_text: 'true' });
    if (type === 'page') { params.set('tabs', 'timeline'); params.set('height', '500'); params.set('small_header', 'false'); params.set('adapt_container_width', 'true'); params.set('hide_cover', 'false'); params.set('show_facepile', 'false'); }
    if (type === 'video') { params.set('autoplay', 'false'); params.set('height', '430'); }
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.facebook.com/plugins/' + (type === 'page' ? 'page' : type === 'video' ? 'video' : 'post') + '.php?' + params.toString();
    iframe.title = stage.dataset.embedTitle + ' — Facebook ' + type;
    iframe.loading = 'lazy'; iframe.allow = 'encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.height = type === 'page' ? '500px' : type === 'video' ? '430px' : '520px';
    stage.classList.add('loaded'); if (type === 'video') stage.classList.add('video');
    stage.replaceChildren(iframe);
    updateScroll();
  }));
})();
