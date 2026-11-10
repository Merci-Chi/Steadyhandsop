/* JS is reserved for interaction only. */
(() => {
  'use strict';

  const details = {
    new: {
      eyebrow: 'FOR NEW BUSINESSES',
      title: 'Build your business on a stronger foundation.',
      description: 'A starting point for turning your idea into an organized, professional operation.',
      list: ['Business setup and operational planning', 'Branding and a polished online presence', 'Digital tools, systems, and workflows', 'A practical roadmap for your next stage of growth']
    },
    existing: {
      eyebrow: 'FOR EXISTING BUSINESSES',
      title: 'Make your next stage of growth easier.',
      description: 'Improve the way your business operates, communicates, and scales.',
      list: ['Workflow and process improvements', 'Website and digital experience upgrades', 'Automation and operational organization', 'A clear plan for sustainable growth']
    },
    nonprofit: {
      eyebrow: 'FOR NON-PROFITS',
      title: 'Put more energy into your mission.',
      description: 'Create dependable systems and a professional digital presence that supports your community work.',
      list: ['Mission-focused digital presence', 'Streamlined internal processes', 'Community communication tools', 'Supporter and outreach experience']
    },
    systems: {
      eyebrow: 'OUR SERVICES', title: 'Systems & operations',
      description: 'Bring structure to everyday work with organized processes and tools.',
      list: ['Process mapping', 'Workflow organization', 'Team systems', 'Practical operational planning']
    },
    growth: {
      eyebrow: 'OUR SERVICES', title: 'Growth strategy',
      description: 'Plan the next phase with clear priorities and consistent execution.',
      list: ['Growth roadmaps', 'Service positioning', 'Customer journey improvements', 'Business performance planning']
    },
    technology: {
      eyebrow: 'OUR SERVICES', title: 'Digital solutions',
      description: 'Build the digital foundations that make your business easier to find and work with.',
      list: ['Website experiences', 'Digital workflows', 'Business integrations', 'Technical improvement planning']
    },
    resources: {
      eyebrow: 'RESOURCE CENTER', title: 'Business resources',
      description: 'Explore the three paths in the hero to find a starting point suited to your organization.',
      list: ['New business foundations', 'Existing business growth', 'Non-profit operations']
    },
    faq: {
      eyebrow: 'COMMON QUESTIONS', title: 'Where do I start?',
      description: 'Select the card that best describes your organization. The page will show a focused overview of how an operations agency may help.',
      list: ['New Business — for organizations just getting started', 'Existing Business — for established companies', 'Non-Profit — for mission-led organizations']
    },
    about: {
      eyebrow: 'ABOUT STEADY HANDS', title: 'Business operations, with room to grow.',
      description: 'Steady Hands is presented here as a business operations agency focused on making the work behind a business simpler and more effective.',
      list: ['Clear direction', 'Better systems', 'Thoughtful digital experiences']
    }
  };

  const overlay = document.querySelector('#dialog-overlay');
  const dialog = overlay.querySelector('.dialog');
  const eyebrow = document.querySelector('#dialog-eyebrow');
  const title = document.querySelector('#dialog-title');
  const description = document.querySelector('#dialog-description');
  const content = document.querySelector('#dialog-details');
  const footer = document.querySelector('#dialog-footer');
  let lastFocused = null;

  function showDialog() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    dialog.focus();
  }
  function closeDialog() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }
  function makeButton(label, className, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.addEventListener('click', callback);
    return button;
  }
  function showInfo(key) {
    const item = details[key];
    if (!item) return;
    eyebrow.textContent = item.eyebrow;
    title.textContent = item.title;
    description.textContent = item.description;
    content.replaceChildren();
    footer.replaceChildren();
    const list = document.createElement('ul');
    item.list.forEach(text => { const li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
    content.appendChild(list);
    footer.appendChild(makeButton('Book a Consultation', 'primary-btn', showBooking));
    footer.appendChild(makeButton('Explore Other Options', 'secondary-cta', () => {
      closeDialog();
      document.querySelector('#options').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }));
    showDialog();
  }
  function showBooking() {
    eyebrow.textContent = 'LET’S CONNECT';
    title.textContent = 'Book a Consultation';
    description.textContent = 'Share a little about your organization. This design preview does not send or store form submissions; connect your own booking service to enable live scheduling.';
    content.replaceChildren();
    footer.replaceChildren();
    const form = document.createElement('form');
    form.id = 'consultation-form';
    form.innerHTML = `
      <label>Your name <input name="name" required autocomplete="name" placeholder="Full name"></label>
      <label>Email address <input name="email" type="email" required autocomplete="email" placeholder="you@company.com"></label>
      <label>Organization type <select name="type"><option>New Business</option><option>Existing Business</option><option>Non-Profit</option></select></label>
      <label>What are you looking for? <textarea name="message" placeholder="Tell us what you are working on..."></textarea></label>
      <button type="submit" class="primary-btn">Review My Request <i class="bi bi-arrow-right action-arrow-icon" aria-hidden="true"></i></button>
      <p class="small-note">Demo interaction only — no details are transmitted.</p>`;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(form);
      const note = document.createElement('p');
      note.className = 'form-note';
      note.textContent = `Request prepared for ${values.get('name')} (${values.get('type')}). Connect a booking provider or form endpoint to receive requests.`;
      const existing = form.querySelector('.form-note');
      if (existing) existing.remove();
      form.appendChild(note);
    });
    content.appendChild(form);
    if (overlay.hidden) showDialog();
    else dialog.focus();
  }

  document.querySelectorAll('[data-get-started], [data-get-started-mobile]').forEach(button => button.addEventListener('click', () => { closeMobileMenu(); window.dispatchEvent(new Event('steady-open-review')); }));
  const incoming=new URLSearchParams(location.search);if(incoming.has('info')){showInfo(incoming.get('info'));history.replaceState(null,'',location.pathname);}
  document.querySelectorAll('[data-info]').forEach(button => button.addEventListener('click', () => { closeMobileMenu(); showInfo(button.dataset.info); }));
  document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => { closeMobileMenu(); showBooking(); }));
  overlay.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeDialog));
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll('button:not(:disabled), input, select, textarea, a[href]'));
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
      else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
    }
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  function closeMobileDropdowns() {
    mobileNav.querySelectorAll('.mobile-nav-trigger').forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
    });
  }
  function closeMobileMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileNav.hidden = true;
    closeMobileDropdowns();
  }
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    mobileNav.hidden = isOpen;
  });
  mobileNav.querySelectorAll('.mobile-nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';
      closeMobileDropdowns();
      if (shouldOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
      }
    });
  });
  document.addEventListener('click', event => {
    if (!mobileNav.hidden && !event.target.closest('#mobile-nav') && !event.target.closest('.menu-toggle')) {
      closeMobileMenu();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) {
      closeMobileMenu();
      menuToggle.focus();
    }
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
  document.querySelectorAll('.nav-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.nav-trigger').forEach(other => other.setAttribute('aria-expanded', 'false'));
      trigger.setAttribute('aria-expanded', String(!open));
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-dropdown')) document.querySelectorAll('.nav-trigger').forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  });
  // Escape closes any open desktop dropdown immediately.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openTrigger = document.querySelector('.nav-trigger[aria-expanded="true"]');
    if (openTrigger) {
      openTrigger.setAttribute('aria-expanded', 'false');
      openTrigger.focus();
    }
  });
  document.querySelectorAll('.dropdown-panel button:not(.services-group-trigger)').forEach(button => {
    button.addEventListener('click', () => {
      button.closest('.nav-dropdown').querySelector('.nav-trigger').setAttribute('aria-expanded', 'false');
    });
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 800) closeMobileMenu(); });
})();
