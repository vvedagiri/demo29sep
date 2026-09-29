import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

// keep track globally of the number of tabs-testimonial blocks on the page
let blockCnt = 0;

function optimizeImages(root, width) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

/**
 * Tabs Testimonial: each row is one testimonial.
 * Cell 1 = tab label (optional avatar image, name, role).
 * Cell 2 = panel content (image, name, role, quote).
 * Panels render first, the tab buttons render as a row below.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  blockCnt += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-testimonial-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Testimonials');
  tablist.id = `tabs-testimonial-list-${blockCnt}`;

  const rows = [...block.children].filter((row) => row.firstElementChild
    && (row.firstElementChild.children.length > 0 || row.firstElementChild.textContent.trim()));

  const buttons = [];
  const select = (index, focus = false) => {
    rows.forEach((panel, i) => panel.setAttribute('aria-hidden', i !== index));
    buttons.forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === index);
      btn.tabIndex = i === index ? 0 : -1;
    });
    if (focus) buttons[index].focus();
  };

  rows.forEach((row, i) => {
    const id = `tabs-testimonial-${blockCnt}-panel-${i + 1}`;
    const label = row.firstElementChild;

    // panel = remaining cells
    row.className = 'tabs-testimonial-panel';
    row.id = id;
    row.setAttribute('role', 'tabpanel');
    row.setAttribute('aria-labelledby', `tab-${id}`);
    [...row.children].forEach((cell) => {
      if (cell !== label) cell.classList.add('tabs-testimonial-content');
    });
    const content = row.querySelector('.tabs-testimonial-content');
    if (content) {
      const pic = content.querySelector('picture');
      if (pic) {
        const media = document.createElement('div');
        media.className = 'tabs-testimonial-image';
        const picParent = pic.parentElement;
        media.append(pic);
        if (picParent !== content && !picParent.textContent.trim() && !picParent.children.length) {
          picParent.remove();
        }
        const text = document.createElement('div');
        text.className = 'tabs-testimonial-text';
        while (content.firstChild) text.append(content.firstChild);
        content.append(media, text);
      }
    }

    // tab button from label cell
    const button = document.createElement('button');
    button.className = 'tabs-testimonial-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id);
    // move (not copy) the label nodes so UE instrumentation stays unique;
    // <button> only allows phrasing content, so <p> becomes <span>
    [...label.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
        const onlyPic = node.querySelector('picture');
        if (onlyPic && !node.textContent.trim()) {
          moveInstrumentation(node, onlyPic);
          button.append(onlyPic);
          return;
        }
        const span = document.createElement('span');
        moveInstrumentation(node, span);
        span.append(...node.childNodes);
        button.append(span);
      } else {
        button.append(node);
      }
    });
    // the avatar is decorative next to the visible name: keep the tab's
    // accessible name from repeating it ("Alex Rivera Alex Rivera ...")
    if (button.textContent.trim()) {
      button.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
    }
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', (e) => {
      const last = rows.length - 1;
      let next = null;
      if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
      else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = last;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    });
    buttons.push(button);
    tablist.append(button);

    // panel is focusable so keyboard users can reach its content from the tab
    row.tabIndex = 0;

    // remove the (now empty) label cell from the panel
    label.remove();
  });

  optimizeImages(block, '750');
  optimizeImages(tablist, '96');

  block.append(tablist);
  if (rows.length) select(0);
}
