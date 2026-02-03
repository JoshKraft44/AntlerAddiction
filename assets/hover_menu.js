(function () {
  function initHoverMenus() {
    const isDesktop = matchMedia('(min-width: 990px)').matches;
    const hasHover = matchMedia('(hover: hover)').matches;
    if (!isDesktop || !hasHover) return;

    // Grab all Dawn dropdown containers no matter which wrapper is used
    const detailsList = document.querySelectorAll(
      '#shopify-section-header header-menu details,' +
      '#shopify-section-header details-disclosure details,' +
      '#shopify-section-header .header__inline-menu details,' +
      'header details'
    );

    if (!detailsList.length) return;

    detailsList.forEach((d) => {
      const summary = d.querySelector('summary');
      if (!summary) return;

      let closeTimer;

      // Use pointerenter/leave for best Safari behavior
      d.addEventListener('pointerenter', () => {
        clearTimeout(closeTimer);
        d.setAttribute('open', '');
      });

      d.addEventListener('pointerleave', () => {
        closeTimer = setTimeout(() => d.removeAttribute('open'), 120);
      });

      // Keyboard support
      d.addEventListener('focusin', () => d.setAttribute('open', ''));
      d.addEventListener('focusout', (e) => {
        if (!d.contains(e.relatedTarget)) d.removeAttribute('open');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoverMenus);
  } else {
    initHoverMenus();
  }
})();
