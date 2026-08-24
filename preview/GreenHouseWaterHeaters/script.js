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
form?.addEventListener('submit', event => {
  event.preventDefault();
  status.textContent = 'Thanks! Your estimate request is ready to be connected to your form backend.';
  form.reset();
});
