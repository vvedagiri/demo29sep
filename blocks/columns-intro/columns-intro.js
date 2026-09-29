import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * True when a paragraph holds nothing but a single link (an authored CTA),
 * whether or not the global button decoration turned it into a button.
 * @param {Element} el
 */
function isCtaParagraph(el) {
  if (el.tagName !== 'P') return false;
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && !el.querySelector('picture, img')
    && el.textContent.trim() === links[0].textContent.trim();
}

/**
 * Group consecutive CTA paragraphs into one actions row.
 * @param {Element} col
 */
function groupCtas(col) {
  let group = null;
  [...col.children].forEach((el) => {
    if (isCtaParagraph(el)) {
      if (!group) {
        group = document.createElement('div');
        group.className = 'columns-intro-actions';
        el.before(group);
      }
      group.append(el);
    } else {
      group = null;
    }
  });
}

/**
 * Columns Intro: page intro with a text cell (heading, copy, CTAs)
 * beside a media cell holding an image collage.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const rows = [...block.children];
  const firstRow = rows[0];
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-intro-${cols.length}-cols`);

  rows.forEach((row) => {
    row.classList.add('columns-intro-row');
    [...row.children].forEach((col) => {
      const pictures = [...col.querySelectorAll('picture')];
      const hasText = col.textContent.trim() !== '';
      if (pictures.length && !hasText) {
        col.classList.add('columns-intro-media');
        if (pictures.length > 1) col.classList.add('columns-intro-collage');
        // pictures may arrive bare in the cell or grouped inside one <p>;
        // lift each into its own tile so the collage grid sees one item per image
        const tiles = pictures.map((pic) => {
          const wrapper = document.createElement('div');
          wrapper.className = 'columns-intro-image';
          const img = pic.querySelector('img');
          if (img) {
            const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
            moveInstrumentation(img, optimized.querySelector('img'));
            wrapper.append(optimized);
          } else {
            wrapper.append(pic);
          }
          return wrapper;
        });
        col.replaceChildren(...tiles);
      } else if (!hasText && !pictures.length) {
        col.classList.add('columns-intro-empty');
      } else {
        col.classList.add('columns-intro-content');
        groupCtas(col);
      }
    });
  });
}
