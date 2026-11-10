(() => {
  'use strict';
  const menus = [...document.querySelectorAll('#services-menu, #mobile-services-menu')];
  if (!menus.length) return;
  for (const menu of menus) {
    const toggles = [...menu.querySelectorAll('.services-group-trigger')];
    const closeAll = () => toggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
      const panel = document.getElementById(toggle.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
    toggles.forEach(toggle => toggle.addEventListener('click', event => {
      event.stopPropagation();
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      closeAll();
      if (opening) {
        toggle.setAttribute('aria-expanded', 'true');
        document.getElementById(toggle.getAttribute('aria-controls')).hidden = false;
      }
    }));
    // Whenever the entire services menu closes, reset nested disclosure state.
    const rootId = menu.id === 'services-menu' ? 'services-menu' : 'mobile-services-menu';
    const outer = document.querySelector(`[aria-controls="${rootId}"]`);
    if (outer) {
      new MutationObserver(() => {
        if (outer.getAttribute('aria-expanded') !== 'true') closeAll();
      }).observe(outer, {attributes:true, attributeFilter:['aria-expanded']});
    }
  }
})();
