/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html:
 *   <a href="#main-content" class="skip-link">          (skip link)
 *   <div class="navbar">                                 (global header / nav + mega menu)
 *   <footer class="footer inverse-footer">               (global footer)
 * NOTE: do NOT remove bare `header` — the first content section is
 * <header class="section secondary-section"> inside #main-content.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global chrome removed early so nav/mega-menu markup can't match block selectors
    // (e.g. .grid-layout, .card-link used inside the navbar mega menu).
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer.inverse-footer',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable leftovers (safe element removal)
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      'div.navbar',
      'footer.footer.inverse-footer',
      'noscript',
      'link',
      'iframe',
    ]);

    // Astro scoping attributes (e.g. data-astro-cid-37fxchfa on <body>) are not authorable
    element.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes)
        .filter((attr) => attr.name.startsWith('data-astro-cid'))
        .forEach((attr) => el.removeAttribute(attr.name));
    });
  }
}
