/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/columns-intro.js
  function parse(element, { document: document2 }) {
    const children = Array.from(element.querySelectorAll(":scope > div"));
    let mediaCol = children.find((c) => c.querySelector("img") && !c.querySelector("h1, h2, h3"));
    let textCol = children.find((c) => c !== mediaCol && c.querySelector("h1, h2, h3, p")) || children.find((c) => c !== mediaCol);
    const textCell = [];
    if (textCol) {
      const heading = textCol.querySelector("h1, h2, h3");
      const description = Array.from(textCol.querySelectorAll("p"));
      const ctas = Array.from(textCol.querySelectorAll(".button-group a, a.button"));
      const uniqueCtas = ctas.filter((a, i) => ctas.indexOf(a) === i);
      if (heading) textCell.push(heading);
      textCell.push(...description);
      uniqueCtas.forEach((a) => {
        const p = document2.createElement("p");
        const wrap = document2.createElement(a.classList.contains("secondary-button") ? "em" : "strong");
        wrap.append(a);
        p.append(wrap);
        textCell.push(p);
      });
    }
    const mediaCell = [];
    if (mediaCol) {
      mediaCol.querySelectorAll("img").forEach((img) => mediaCell.push(img));
    }
    if (!textCell.length && !mediaCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", mediaCell.length ? mediaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document: document2 }) {
    const children = Array.from(element.querySelectorAll(":scope > div"));
    const textCol = children.find((c) => c.querySelector("h1, h2, h3, h4"));
    const mediaCol = children.find((c) => c !== textCol && c.querySelector("img"));
    const mediaCell = [];
    if (mediaCol) {
      const img = mediaCol.querySelector("img");
      if (img) mediaCell.push(img);
    }
    const textCell = [];
    if (textCol) {
      const crumbs = Array.from(textCol.querySelectorAll('.breadcrumbs a, nav[aria-label*="readcrumb"] a'));
      if (crumbs.length) {
        const p = document2.createElement("p");
        crumbs.forEach((a, i) => {
          if (i > 0) p.append(document2.createTextNode(" "));
          p.append(a);
        });
        textCell.push(p);
      }
      const heading = textCol.querySelector("h1, h2, h3, h4");
      if (heading) textCell.push(heading);
      let metaRows = Array.from(textCol.querySelectorAll(".flex-horizontal"));
      if (!metaRows.length && heading) {
        metaRows = [];
        let next = heading.nextElementSibling;
        while (next) {
          metaRows.push(next);
          next = next.nextElementSibling;
        }
      }
      metaRows.forEach((row) => {
        const parts = Array.from(row.querySelectorAll("span")).map((s) => s.textContent.trim()).filter(Boolean);
        const text = parts.length ? parts.join(" ") : row.textContent.trim().replace(/\s+/g, " ");
        if (text) {
          const p = document2.createElement("p");
          p.textContent = text;
          textCell.push(p);
        }
      });
    }
    if (!textCell.length && !mediaCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[mediaCell.length ? mediaCell : "", textCell.length ? textCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gallery.js
  function parse3(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > .utility-aspect-1x1"));
    if (!items.length) {
      items = Array.from(element.querySelectorAll(":scope > div")).filter((d) => d.querySelector("img"));
    }
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(img);
      const textNodes = Array.from(item.querySelectorAll("h1, h2, h3, h4, h5, h6, p"));
      let textCell = "";
      if (textNodes.length) {
        textCell = document2.createDocumentFragment();
        textCell.appendChild(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.appendChild(n));
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-testimonial.js
  function nameAndRole(container, document2) {
    const out = [];
    if (!container) return out;
    const strong = container.querySelector("strong");
    if (strong) {
      const p = document2.createElement("p");
      const s = document2.createElement("strong");
      s.textContent = strong.textContent.trim();
      p.append(s);
      out.push(p);
    }
    const leafDivs = Array.from(container.querySelectorAll("div")).filter((d) => !d.querySelector("div, strong, img, p") && d.textContent.trim());
    leafDivs.forEach((d) => {
      const p = document2.createElement("p");
      p.textContent = d.textContent.trim();
      out.push(p);
    });
    return out;
  }
  function parse4(element, { document: document2 }) {
    var _a, _b;
    let panes = Array.from(element.querySelectorAll(".tabs-content > .tab-pane"));
    if (!panes.length) panes = Array.from(element.querySelectorAll('[role="tabpanel"], .tab-pane'));
    let tabs = Array.from(element.querySelectorAll(".tab-menu > .tab-menu-link"));
    if (!tabs.length) tabs = Array.from(element.querySelectorAll('[role="tab"], .tab-menu-link'));
    const count = Math.max(panes.length, tabs.length);
    const cells = [];
    for (let i = 0; i < count; i += 1) {
      const pane = panes[i];
      const tab = tabs[i];
      const labelCell = document2.createDocumentFragment();
      let hasLabel = false;
      if (tab) {
        const avatar = tab.querySelector(".avatar img, img");
        if (avatar) {
          if (!avatar.getAttribute("alt")) {
            const nm = tab.querySelector("strong");
            if (nm) avatar.setAttribute("alt", nm.textContent.trim());
          }
          labelCell.appendChild(document2.createComment(" field:tab_image "));
          labelCell.appendChild(avatar);
          hasLabel = true;
        }
        const textParts = nameAndRole(tab, document2);
        if (textParts.length) {
          labelCell.appendChild(document2.createComment(" field:tab_text "));
          textParts.forEach((p) => labelCell.appendChild(p));
          hasLabel = true;
        }
      }
      const contentCell = document2.createDocumentFragment();
      let hasContent = false;
      if (pane) {
        const img = pane.querySelector("img");
        if (img) {
          contentCell.appendChild(document2.createComment(" field:content_image "));
          contentCell.appendChild(img);
          hasContent = true;
        }
        const textParts = [];
        const nameContainer = (_b = (_a = pane.querySelector("strong")) == null ? void 0 : _a.closest("div")) == null ? void 0 : _b.parentElement;
        textParts.push(...nameAndRole(nameContainer, document2));
        pane.querySelectorAll("p").forEach((p) => textParts.push(p));
        if (textParts.length) {
          contentCell.appendChild(document2.createComment(" field:content_text "));
          textParts.forEach((p) => contentCell.appendChild(p));
          hasContent = true;
        }
      }
      if (hasLabel || hasContent) {
        cells.push([hasLabel ? labelCell : "", hasContent ? contentCell : ""]);
      }
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse5(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(".article-card-body")).map((body) => {
      var _a;
      return {
        body,
        image: body.parentElement ? body.parentElement.querySelector(".article-card-image img, img") : null,
        href: ((_a = body.closest("a")) == null ? void 0 : _a.getAttribute("href")) || ""
      };
    });
    if (!items.length) {
      items = Array.from(element.querySelectorAll(":scope > .article-card, :scope > a.card-link")).map((card) => ({
        body: card,
        image: card.querySelector("img"),
        href: card.getAttribute("href") || ""
      }));
    }
    const cells = [];
    items.forEach(({ body, image, href }) => {
      let imageCell = "";
      if (image) {
        imageCell = document2.createDocumentFragment();
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(image);
      }
      const textParts = [];
      const tag = body.querySelector(".tag");
      const metaSpans = Array.from(body.querySelectorAll(".article-card-meta span"));
      const date = metaSpans.find((s) => s !== tag);
      if (tag) {
        const p = document2.createElement("p");
        p.textContent = tag.textContent.trim();
        textParts.push(p);
      }
      if (date) {
        const p = document2.createElement("p");
        p.textContent = date.textContent.trim();
        textParts.push(p);
      }
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        if (href && !heading.querySelector("a")) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = heading.textContent.trim();
          heading.textContent = "";
          heading.append(a);
        }
        textParts.push(heading);
      } else if (href) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = href;
        p.append(a);
        textParts.push(p);
      }
      let textCell = "";
      if (textParts.length) {
        textCell = document2.createDocumentFragment();
        textCell.appendChild(document2.createComment(" field:text "));
        textParts.forEach((n) => textCell.appendChild(n));
      }
      if (imageCell || textCell) cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document: document2 }) {
    let items = Array.from(element.querySelectorAll(":scope > details.faq-item"));
    if (!items.length) items = Array.from(element.querySelectorAll("details, .faq-item"));
    const cells = [];
    items.forEach((item) => {
      var _a;
      const summary = item.querySelector("summary, .faq-question");
      const questionText = summary ? (((_a = summary.querySelector("span, h2, h3, h4")) == null ? void 0 : _a.textContent) || summary.textContent).trim() : "";
      const answer = item.querySelector(".faq-answer") || item.querySelector(":scope > div");
      let answerNodes = [];
      if (answer) {
        answerNodes = Array.from(answer.children);
        if (!answerNodes.length && answer.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = answer.textContent.trim();
          answerNodes = [p];
        }
      }
      let questionCell = "";
      if (questionText) {
        questionCell = document2.createDocumentFragment();
        questionCell.appendChild(document2.createComment(" field:summary "));
        const p = document2.createElement("p");
        p.textContent = questionText;
        questionCell.appendChild(p);
      }
      let answerCell = "";
      if (answerNodes.length) {
        answerCell = document2.createDocumentFragment();
        answerCell.appendChild(document2.createComment(" field:text "));
        answerNodes.forEach((n) => answerCell.appendChild(n));
      }
      if (questionCell || answerCell) cells.push([questionCell, answerCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse7(element, { document: document2 }) {
    const bgImage = element.querySelector(":scope > img") || Array.from(element.querySelectorAll("img")).find((img) => !img.closest(".card-body"));
    const body = element.querySelector(".card-body") || element;
    const heading = body.querySelector("h1, h2, h3");
    const paragraphs = Array.from(body.querySelectorAll("p"));
    const ctas = Array.from(body.querySelectorAll(".button-group a, a.button")).filter((a, i, arr) => arr.indexOf(a) === i);
    if (!bgImage && !heading && !paragraphs.length && !ctas.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(bgImage);
      cells.push([imageCell]);
    } else {
      cells.push([""]);
    }
    const textNodes = [];
    if (heading) textNodes.push(heading);
    textNodes.push(...paragraphs);
    ctas.forEach((a) => {
      const p = document2.createElement("p");
      const wrap = document2.createElement(a.classList.contains("secondary-button") ? "em" : "strong");
      wrap.append(a);
      p.append(wrap);
      textNodes.push(p);
    });
    if (textNodes.length) {
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      textNodes.forEach((n) => textCell.appendChild(n));
      cells.push([textCell]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "div.navbar",
        "footer.footer.inverse-footer"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "div.navbar",
        "footer.footer.inverse-footer",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        Array.from(el.attributes).filter((attr) => attr.name.startsWith("data-astro-cid")).forEach((attr) => el.removeAttribute(attr.name));
      });
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "columns-intro": parse,
    "columns-feature": parse2,
    "cards-gallery": parse3,
    "tabs-testimonial": parse4,
    "cards-article": parse5,
    "accordion-faq": parse6,
    "hero-banner": parse7
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Home page: intro with photo collage, featured story, photo gallery, testimonials, latest articles, FAQ and closing banner",
    urls: [
      "https://www.wknd-trendsetters.site/"
    ],
    blocks: [
      {
        name: "columns-intro",
        instances: ["header.section.secondary-section > .container > .grid-layout"]
      },
      {
        name: "columns-feature",
        instances: ["section.section:has(.breadcrumbs) > .container > .grid-layout"]
      },
      {
        name: "cards-gallery",
        instances: ["section.secondary-section .grid-layout:has(> .utility-aspect-1x1)"]
      },
      {
        name: "tabs-testimonial",
        instances: [".tabs-wrapper"]
      },
      {
        name: "cards-article",
        instances: ["section.secondary-section .grid-layout:has(> .article-card)"]
      },
      {
        name: "accordion-faq",
        instances: [".faq-list"]
      },
      {
        name: "hero-banner",
        instances: ["section.inverse-section .utility-position-relative.utility-radius-card"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "intro",
        selector: ["header.section.secondary-section", "#main-content > header.section.secondary-section"],
        style: "grey",
        blocks: ["columns-intro"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "featured-story",
        selector: ["section.section:has(.breadcrumbs)", "#main-content > section.section:nth-of-type(1)"],
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "gallery",
        selector: ["section.secondary-section:has(.utility-aspect-1x1)", "#main-content > section.section.secondary-section:nth-of-type(2)"],
        style: "grey",
        blocks: ["cards-gallery"],
        defaultContent: ["section.secondary-section:has(.utility-aspect-1x1) .container > .utility-text-align-center"]
      },
      {
        id: "rc4",
        name: "testimonials",
        selector: ["section.section:has(.tabs-wrapper)", "#main-content > section.section:nth-of-type(3)"],
        style: null,
        blocks: ["tabs-testimonial"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "latest-articles",
        selector: ["section.secondary-section:has(.article-card)", "#main-content > section.section.secondary-section:nth-of-type(4)"],
        style: "grey",
        blocks: ["cards-article"],
        defaultContent: ["section.secondary-section:has(.article-card) .container > .utility-text-align-center"]
      },
      {
        id: "rc6",
        name: "faq",
        selector: ["section.section:has(.faq-list)", "#main-content > section.section:nth-of-type(5)"],
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: ["section.section:has(.faq-list) .grid-layout > div:first-child"]
      },
      {
        id: "rc7",
        name: "closing-banner",
        selector: ["section.section.inverse-section", "#main-content > section.section.inverse-section"],
        style: "dark",
        blocks: ["hero-banner"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
