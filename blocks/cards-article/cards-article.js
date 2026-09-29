import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * Cards Article: linked article cards. Each row is one card:
 * cell 1 image, cell 2 rich text (tag, date, linked heading).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-article-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('img')) {
        // authors may leave the image (or text) field empty
        div.remove();
      } else {
        div.className = 'cards-article-card-body';
      }
    });

    const body = li.querySelector('.cards-article-card-body');
    if (body) {
      const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
      // paragraphs before the heading form the tag/date meta line
      const metaEls = [];
      let el = body.firstElementChild;
      while (el && el !== heading && heading) {
        if (el.tagName === 'P') metaEls.push(el);
        el = el.nextElementSibling;
      }
      if (metaEls.length) {
        const meta = document.createElement('div');
        meta.className = 'cards-article-meta';
        metaEls[0].before(meta);
        metaEls.forEach((p, i) => {
          p.classList.add(i === 0 && metaEls.length > 1 ? 'cards-article-tag' : 'cards-article-date');
          meta.append(p);
        });
      }
      // the heading link makes the whole card clickable
      const link = (heading && heading.querySelector('a')) || body.querySelector('a');
      if (link) {
        link.classList.remove('button', 'primary', 'secondary', 'accent');
        link.closest('.button-wrapper')?.classList.remove('button-wrapper');
        link.classList.add('cards-article-link');
        li.classList.add('cards-article-linked');
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}
