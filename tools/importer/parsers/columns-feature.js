/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: section.section:has(.breadcrumbs) > .container > .grid-layout
 *
 * Source structure (validated against block-context/columns-feature/source.html):
 *   <div class="grid-layout tablet-1-column grid-gap-lg">
 *     <div> img.cover-image </div>
 *     <div>
 *       div.breadcrumbs > a.text-link, img(svg chevron), a.text-link
 *       h2.h2-heading
 *       <div> div.flex-horizontal > span x2 (byline), div.flex-horizontal > span x3 (date • read time) </div>
 *     </div>
 *   </div>
 *
 * Output: 2 columns x 1 row -> [feature image, text cell].
 * Text cell: <p> breadcrumb links, heading, one <p> per meta line (block JS styles
 * paragraphs following the heading as meta, and a links-only first <p> as breadcrumbs).
 * xwalk: Columns blocks do not take field hints.
 */
export default function parse(element, { document }) {
  const children = Array.from(element.querySelectorAll(':scope > div'));

  const textCol = children.find((c) => c.querySelector('h1, h2, h3, h4'));
  const mediaCol = children.find((c) => c !== textCol && c.querySelector('img'));

  // Media cell
  const mediaCell = [];
  if (mediaCol) {
    const img = mediaCol.querySelector('img');
    if (img) mediaCell.push(img);
  }

  // Text cell
  const textCell = [];
  if (textCol) {
    // Breadcrumb links (drop decorative chevron svg images)
    const crumbs = Array.from(textCol.querySelectorAll('.breadcrumbs a, nav[aria-label*="readcrumb"] a'));
    if (crumbs.length) {
      const p = document.createElement('p');
      crumbs.forEach((a, i) => {
        if (i > 0) p.append(document.createTextNode(' '));
        p.append(a);
      });
      textCell.push(p);
    }

    const heading = textCol.querySelector('h1, h2, h3, h4');
    if (heading) textCell.push(heading);

    // Meta lines: each .flex-horizontal row becomes one paragraph
    let metaRows = Array.from(textCol.querySelectorAll('.flex-horizontal'));
    if (!metaRows.length && heading) {
      // Fallback: any sibling blocks after the heading
      metaRows = [];
      let next = heading.nextElementSibling;
      while (next) { metaRows.push(next); next = next.nextElementSibling; }
    }
    metaRows.forEach((row) => {
      const parts = Array.from(row.querySelectorAll('span'))
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      const text = parts.length ? parts.join(' ') : row.textContent.trim().replace(/\s+/g, ' ');
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        textCell.push(p);
      }
    });
  }

  if (!textCell.length && !mediaCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[mediaCell.length ? mediaCell : '', textCell.length ? textCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
