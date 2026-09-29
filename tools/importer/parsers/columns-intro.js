/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-intro. Base: columns.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: header.section.secondary-section > .container > .grid-layout
 *
 * Source structure (validated against block-context/columns-intro/source.html):
 *   <div class="grid-layout tablet-1-column grid-gap-xxl">
 *     <div> h1.h1-heading, p.subheading, div.button-group > a.button x2 </div>
 *     <div class="grid-layout ... grid-gap-xs"> img.cover-image x3 </div>
 *   </div>
 *
 * Output: 2 columns x 1 row -> [text cell, image collage cell].
 * xwalk: Columns blocks do not take field hints.
 */
export default function parse(element, { document }) {
  const children = Array.from(element.querySelectorAll(':scope > div'));

  // Media column: the child that holds images but no heading
  let mediaCol = children.find((c) => c.querySelector('img') && !c.querySelector('h1, h2, h3'));
  // Text column: the child holding the heading (fallback: first non-media child)
  let textCol = children.find((c) => c !== mediaCol && c.querySelector('h1, h2, h3, p'))
    || children.find((c) => c !== mediaCol);

  const textCell = [];
  if (textCol) {
    const heading = textCol.querySelector('h1, h2, h3');
    const description = Array.from(textCol.querySelectorAll('p'));
    const ctas = Array.from(textCol.querySelectorAll('.button-group a, a.button'));
    const uniqueCtas = ctas.filter((a, i) => ctas.indexOf(a) === i);
    if (heading) textCell.push(heading);
    textCell.push(...description);
    // Wrap CTAs so EDS buttonizes them: <strong> = primary, <em> = secondary
    uniqueCtas.forEach((a) => {
      const p = document.createElement('p');
      const wrap = document.createElement(a.classList.contains('secondary-button') ? 'em' : 'strong');
      wrap.append(a);
      p.append(wrap);
      textCell.push(p);
    });
  }

  const mediaCell = [];
  if (mediaCol) {
    mediaCol.querySelectorAll('img').forEach((img) => mediaCell.push(img));
  }

  if (!textCell.length && !mediaCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', mediaCell.length ? mediaCell : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-intro', cells });
  element.replaceWith(block);
}
