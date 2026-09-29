import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = [];

/**
 * Accordion FAQ: each row is one question/answer item.
 * Cell 1 = question (summary), cell 2 = answer (body).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  [...block.children].forEach((row) => {
    const label = row.children[0];
    if (!label) return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    // <summary> only allows phrasing/heading content: unwrap the <p> the
    // question field arrives in, keeping its UE instrumentation on a span
    [...label.childNodes].forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
        const span = document.createElement('span');
        moveInstrumentation(node, span);
        span.append(...node.childNodes);
        summary.append(span);
      } else {
        summary.append(node);
      }
    });

    let body = row.children[1];
    if (!body) {
      body = document.createElement('div');
    }
    body.className = 'accordion-faq-item-body';

    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
