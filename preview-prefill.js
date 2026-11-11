'use strict';
(() => {
  const code = new URLSearchParams(location.search).get('code');
  const form = document.querySelector('#preview-page-form');
  const input = document.querySelector('#preview-page-code');
  if (!code || !form || !input) return;
  input.value = code;
  // Submit after the existing preview handlers have been attached by defer scripts.
  form.requestSubmit();
})();
