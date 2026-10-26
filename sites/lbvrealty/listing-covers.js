// Listing cards show just one cover image; galleries on detail pages are unchanged.
(() => {
  document.querySelectorAll('a.rental-visual img, a.featured-card-photo img').forEach((img) => {
    const markFailed = () => {
      img.classList.add('listing-image-failed');
      img.closest('a')?.classList.add('has-failed-image');
    };
    img.addEventListener('error', markFailed, { once: true });
    if (img.complete && img.naturalWidth === 0) markFailed();
  });
})();
