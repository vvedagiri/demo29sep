/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-testimonial. Base: tabs.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: .tabs-wrapper
 *
 * Source structure (validated against block-context/tabs-testimonial/source.html):
 *   .tabs-wrapper
 *     .tabs-content > .tab-pane x4
 *        .grid-layout > div > img.cover-image
 *                     > div > div > (div > strong name), (div role)
 *                           > p.paragraph-xl quote
 *     .tab-menu > button.tab-menu-link x4
 *        .avatar > img ; div > (div > strong name), (div role)
 *
 * Output: 2 columns, one row per testimonial -> [tab label, panel content].
 * Iteration is keyed on the block-level .tab-pane wrappers; each is paired with the
 * tab button at the same index (buttons are not nested, iterationSafe per structure.json).
 * xwalk model (tabs-testimonial-item): grouped fields
 *   cell 1: tab_image, tab_text   cell 2: content_image, content_text
 */

function nameAndRole(container, document) {
  const out = [];
  if (!container) return out;
  const strong = container.querySelector('strong');
  if (strong) {
    const p = document.createElement('p');
    const s = document.createElement('strong');
    s.textContent = strong.textContent.trim();
    p.append(s);
    out.push(p);
  }
  // Role: leaf divs without <strong> and without a paragraph
  const leafDivs = Array.from(container.querySelectorAll('div'))
    .filter((d) => !d.querySelector('div, strong, img, p') && d.textContent.trim());
  leafDivs.forEach((d) => {
    const p = document.createElement('p');
    p.textContent = d.textContent.trim();
    out.push(p);
  });
  return out;
}

export default function parse(element, { document }) {
  let panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  if (!panes.length) panes = Array.from(element.querySelectorAll('[role="tabpanel"], .tab-pane'));
  let tabs = Array.from(element.querySelectorAll('.tab-menu > .tab-menu-link'));
  if (!tabs.length) tabs = Array.from(element.querySelectorAll('[role="tab"], .tab-menu-link'));

  const count = Math.max(panes.length, tabs.length);
  const cells = [];

  for (let i = 0; i < count; i += 1) {
    const pane = panes[i];
    const tab = tabs[i];

    // Cell 1: tab label (avatar + name/role)
    const labelCell = document.createDocumentFragment();
    let hasLabel = false;
    if (tab) {
      const avatar = tab.querySelector('.avatar img, img');
      if (avatar) {
        if (!avatar.getAttribute('alt')) {
          const nm = tab.querySelector('strong');
          if (nm) avatar.setAttribute('alt', nm.textContent.trim());
        }
        labelCell.appendChild(document.createComment(' field:tab_image '));
        labelCell.appendChild(avatar);
        hasLabel = true;
      }
      const textParts = nameAndRole(tab, document);
      if (textParts.length) {
        labelCell.appendChild(document.createComment(' field:tab_text '));
        textParts.forEach((p) => labelCell.appendChild(p));
        hasLabel = true;
      }
    }

    // Cell 2: panel content (image + name/role/quote)
    const contentCell = document.createDocumentFragment();
    let hasContent = false;
    if (pane) {
      const img = pane.querySelector('img');
      if (img) {
        contentCell.appendChild(document.createComment(' field:content_image '));
        contentCell.appendChild(img);
        hasContent = true;
      }
      const textParts = [];
      const nameContainer = pane.querySelector('strong')?.closest('div')?.parentElement;
      textParts.push(...nameAndRole(nameContainer, document));
      pane.querySelectorAll('p').forEach((p) => textParts.push(p));
      if (textParts.length) {
        contentCell.appendChild(document.createComment(' field:content_text '));
        textParts.forEach((p) => contentCell.appendChild(p));
        hasContent = true;
      }
    }

    if (hasLabel || hasContent) {
      cells.push([hasLabel ? labelCell : '', hasContent ? contentCell : '']);
    }
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
