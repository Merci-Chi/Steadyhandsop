document.addEventListener('DOMContentLoaded', () => { if (window.lucide) lucide.createIcons(); });
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const form = document.querySelector('#estimateForm');
const status = document.querySelector('.form-status');
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const email = String(data.get('email') || '').trim();
  const service = String(data.get('service') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = `Free estimate request - ${service}`;
  const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\n\nProject details:\n${message || '(Not provided)'}`;
  const mailto = `mailto:greenhouseplumbing@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Your email app should open with the estimate request. Press Send there to submit it. If nothing opens, please email greenhouseplumbing@yahoo.com directly.';
  window.location.href = mailto;
  // Do not reset: the request has not been sent until the user confirms it in their email app.
});
