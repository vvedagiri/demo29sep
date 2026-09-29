import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * Hero Banner: contained banner with a cover background image,
 * overlay, and heading / copy / CTA on top.
 * Row 1 = image, row 2 = rich text. Also tolerates a single row
 * that holds both the picture and the text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const pic = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  if (pic) {
    const img = pic.querySelector('img');
    const picParent = pic.parentElement;
    if (img) {
      // only load eagerly when the banner is in the first section (LCP candidate)
      const firstSection = block.closest('main > .section, main > div');
      const eager = !!firstSection && !firstSection.previousElementSibling;
      const optimized = createOptimizedPicture(img.src, img.alt, eager, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]);
      moveInstrumentation(img, optimized.querySelector('img'));
      media.append(optimized);
      pic.remove();
    } else {
      media.append(pic);
    }
    // drop wrappers the picture left empty
    let el = picParent;
    while (el && el !== block && !el.textContent.trim() && !el.querySelector('picture, img')) {
      const parent = el.parentElement;
      el.remove();
      el = parent;
    }
  }

  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim() || cell.children.length) {
        while (cell.firstChild) content.append(cell.firstChild);
      }
    });
  });

  // group consecutive link-only paragraphs (CTAs) into one actions row
  let group = null;
  [...content.children].forEach((el) => {
    const links = el.tagName === 'P' ? el.querySelectorAll('a[href]') : [];
    const isCta = links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
    if (isCta) {
      if (!group) {
        group = document.createElement('div');
        group.className = 'hero-banner-actions';
        el.before(group);
      }
      group.append(el);
    } else {
      group = null;
    }
  });

  block.replaceChildren(...(pic ? [media] : []), content);
  if (!pic) block.classList.add('hero-banner-no-image');
}
