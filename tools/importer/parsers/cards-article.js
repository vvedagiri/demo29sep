/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: section.secondary-section .grid-layout:has(> .article-card)
 *
 * Source structure (validated against block-context/cards-article/source.html):
 *   <div class="grid-layout desktop-4-column ...">
 *     <a href="/blog/..." class="article-card card-link">   x4
 *       div.article-card-image > img.cover-image
 *       div.article-card-body
 *         div.article-card-meta > span.tag, span.paragraph-sm (date)
 *         h3.h4-heading
 *     </a>
 *   </div>
 *
 * Iteration: keyed on the inner block wrapper .article-card-body (not the <a> card
 * wrapper, which html2md preprocessing may merge when adjacent), paired with its sibling
 * .article-card-image. The card href is re-attached to the heading.
 *
 * Output: 2 columns, one row per card -> [image, text (tag, date, linked title)].
 * xwalk model (cards-article-item): image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll('.article-card-body')).map((body) => ({
    body,
    image: body.parentElement ? body.parentElement.querySelector('.article-card-image img, img') : null,
    href: body.closest('a')?.getAttribute('href') || '',
  }));
  if (!items.length) {
    // Fallback: card wrappers intact
    items = Array.from(element.querySelectorAll(':scope > .article-card, :scope > a.card-link')).map((card) => ({
      body: card,
      image: card.querySelector('img'),
      href: card.getAttribute('href') || '',
    }));
  }

  const cells = [];
  items.forEach(({ body, image, href }) => {
    // Image cell
    let imageCell = '';
    if (image) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(image);
    }

    // Text cell: tag, date, linked title
    const textParts = [];
    const tag = body.querySelector('.tag');
    const metaSpans = Array.from(body.querySelectorAll('.article-card-meta span'));
    const date = metaSpans.find((s) => s !== tag);
    if (tag) {
      const p = document.createElement('p');
      p.textContent = tag.textContent.trim();
      textParts.push(p);
    }
    if (date) {
      const p = document.createElement('p');
      p.textContent = date.textContent.trim();
      textParts.push(p);
    }
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      if (href && !heading.querySelector('a')) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = heading.textContent.trim();
        heading.textContent = '';
        heading.append(a);
      }
      textParts.push(heading);
    } else if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = href;
      p.append(a);
      textParts.push(p);
    }

    let textCell = '';
    if (textParts.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      textParts.forEach((n) => textCell.appendChild(n));
    }

    if (imageCell || textCell) cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
