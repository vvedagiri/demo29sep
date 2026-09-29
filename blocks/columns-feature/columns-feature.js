import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * Columns Feature: large feature image beside a text cell
 * (breadcrumb links, heading, byline and meta line).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const rows = [...block.children];
  const cols = rows[0] ? [...rows[0].children] : [];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-feature-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const textOnly = !pic;
      if (pic && col.textContent.trim() === '') {
        col.classList.add('columns-feature-media');
        const img = pic.querySelector('img');
        if (img) {
          const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]);
          moveInstrumentation(img, optimized.querySelector('img'));
          pic.replaceWith(optimized);
        }
      } else if (textOnly || col.textContent.trim()) {
        col.classList.add('columns-feature-content');
        // first paragraph made only of links is treated as breadcrumbs
        const first = col.firstElementChild;
        if (first && first.tagName === 'P') {
          const links = first.querySelectorAll('a');
          const nonLinkText = [...first.childNodes]
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent.replace(/[/>•·|]/g, '').trim())
            .join('');
          if (links.length > 1 && !nonLinkText) {
            const nav = document.createElement('nav');
            nav.className = 'columns-feature-breadcrumbs';
            nav.setAttribute('aria-label', 'Breadcrumb');
            const ol = document.createElement('ol');
            links.forEach((a) => {
              a.classList.remove('button', 'primary', 'secondary', 'accent');
              const li = document.createElement('li');
              li.append(a);
              ol.append(li);
            });
            nav.append(ol);
            moveInstrumentation(first, nav);
            first.replaceWith(nav);
          }
        }
        // paragraphs after the heading are byline / meta
        const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          let next = heading.nextElementSibling;
          while (next) {
            if (next.tagName === 'P') next.classList.add('columns-feature-meta');
            next = next.nextElementSibling;
          }
        }
      }
    });
  });
}
