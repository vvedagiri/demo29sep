/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: https://www.wknd-trendsetters.site/
 * Instance selector: .faq-list
 *
 * Source structure (validated against block-context/accordion-faq/source.html):
 *   <div class="faq-list">
 *     <details class="faq-item">   x4
 *       <summary class="faq-question"> <span>Question</span> <img (decorative svg icon)> </summary>
 *       <div class="faq-answer"> <p>Answer</p> </div>
 *     </details>
 *   </div>
 *
 * Output: 2 columns, one row per item -> [question, answer].
 * xwalk model (accordion-faq-item): summary (text), text (richtext).
 */
export default function parse(element, { document }) {
  let items = Array.from(element.querySelectorAll(':scope > details.faq-item'));
  if (!items.length) items = Array.from(element.querySelectorAll('details, .faq-item'));

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary, .faq-question');
    const questionText = summary
      ? (summary.querySelector('span, h2, h3, h4')?.textContent || summary.textContent).trim()
      : '';

    const answer = item.querySelector('.faq-answer') || item.querySelector(':scope > div');
    let answerNodes = [];
    if (answer) {
      answerNodes = Array.from(answer.children);
      if (!answerNodes.length && answer.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = answer.textContent.trim();
        answerNodes = [p];
      }
    }

    let questionCell = '';
    if (questionText) {
      questionCell = document.createDocumentFragment();
      questionCell.appendChild(document.createComment(' field:summary '));
      const p = document.createElement('p');
      p.textContent = questionText;
      questionCell.appendChild(p);
    }

    let answerCell = '';
    if (answerNodes.length) {
      answerCell = document.createDocumentFragment();
      answerCell.appendChild(document.createComment(' field:text '));
      answerNodes.forEach((n) => answerCell.appendChild(n));
    }

    if (questionCell || answerCell) cells.push([questionCell, answerCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
