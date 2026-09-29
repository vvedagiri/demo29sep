/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: section.inverse-section .utility-position-relative.utility-radius-card
 *
 * Source structure (validated against block-context/hero-banner/source.html):
 *   <div class="utility-position-relative utility-radius-card utility-overflow-clip">
 *     <img class="cover-image utility-overlay ..."> (background)
 *     <div class="overlay"></div>                     (decorative)
 *     <div class="card-body ...">
 *       h2.h1-heading, p.subheading, div.button-group > a.button
 *     </div>
 *   </div>
 *
 * Output: 1 column, 2 rows -> [image], [heading, subheading, CTA].
 * xwalk model (hero-banner): image (reference; imageAlt collapsed into img alt), text (richtext).
 */
export default function parse(element, { document }) {
  // Background image: direct-child cover image, fallback to any image outside the text body
  const bgImage = element.querySelector(':scope > img')
    || Array.from(element.querySelectorAll('img')).find((img) => !img.closest('.card-body'));

  const body = element.querySelector('.card-body') || element;
  const heading = body.querySelector('h1, h2, h3');
  const paragraphs = Array.from(body.querySelectorAll('p'));
  const ctas = Array.from(body.querySelectorAll('.button-group a, a.button'))
    .filter((a, i, arr) => arr.indexOf(a) === i);

  if (!bgImage && !heading && !paragraphs.length && !ctas.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image (row always present for xwalk; empty cell if no image)
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  } else {
    cells.push(['']);
  }

  // Row 2: text (heading, subheading, CTA)
  const textNodes = [];
  if (heading) textNodes.push(heading);
  textNodes.push(...paragraphs);
  // Wrap CTAs so EDS buttonizes them: <strong> = primary, <em> = secondary
  ctas.forEach((a) => {
    const p = document.createElement('p');
    const wrap = document.createElement(a.classList.contains('secondary-button') ? 'em' : 'strong');
    wrap.append(a);
    p.append(wrap);
    textNodes.push(p);
  });
  if (textNodes.length) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textCell.appendChild(n));
    cells.push([textCell]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
