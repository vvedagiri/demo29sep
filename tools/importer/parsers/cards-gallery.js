/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gallery. Base: cards.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: section.secondary-section .grid-layout:has(> .utility-aspect-1x1)
 *
 * Source structure (validated against block-context/cards-gallery/source.html):
 *   <div class="grid-layout desktop-4-column ...">
 *     <div class="utility-aspect-1x1"> <img class="cover-image" alt="..."> </div>  x8
 *   </div>
 *
 * Output: 2 columns, one row per card -> [image, text].
 * Gallery cards are image-only, so the text cell is left empty (no hint on empty cells).
 * xwalk model (cards-gallery-item): image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Iterate the block-level tile wrappers (iterationSafe per structure.json)
  let items = Array.from(element.querySelectorAll(':scope > .utility-aspect-1x1'));
  if (!items.length) {
    // Fallback: any direct child tile holding an image
    items = Array.from(element.querySelectorAll(':scope > div')).filter((d) => d.querySelector('img'));
  }

  const cells = [];
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);

    // Optional caption / text if present in variations
    const textNodes = Array.from(item.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    let textCell = '';
    if (textNodes.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.appendChild(n));
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
