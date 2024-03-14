/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

import { metadata } from './metadata.mjs';
import { redirects } from './redirects.js';

const fixUrl = (a) => {
  let href = a.getAttribute('href');
  let text = a.textContent;

  const redirHref = redirects.get(href);
  if (redirHref) {
    href = redirHref;
  }

  if (href.startsWith('/cigaradvisor')) {
    const page = href.substring(href.lastIndexOf('/') + 1);
    if (metadata[page]) {
      href = `https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page/cigaradvisor/${metadata[page].category}/${page}`;
    } else {
      href = `https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page${href}`;
    }
  } else if (href.startsWith('/')) {
    href = `https://www.famous-smoke.com${href}`;
  }
  if (a.href === text) {
    a.textContent = href;
  }
  a.href = href;
  return a;
};

const createMetadata = (document, params) => {
  const meta = {};
  params.bucket = metadata[params.name].category;

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.textContent;
  }

  const description = document.querySelector('[property="og:description"]');
  if (description) {
    meta.description = description.content;
  }

  meta.articleBlurb =  metadata[params.name].blurb || '';

  const publishedDate = document.querySelector('meta[property="article:published_time"]');
  const date = new Date(publishedDate.getAttribute('content'));
  meta.publishedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  const authorLink = document.querySelector('#articleNav > li:nth-child(1) > a');
  if (authorLink) {
    const a = document.createElement('a');
    a.href = authorLink.getAttribute('href');
    a.textContent = authorLink.href;
    meta.author = a;
  }
  return meta;
};

const processFigure = (figure, document) => {
  const cells = [];
  cells.push(['Captioned Image']);
  const img = figure.querySelector('img');
  const a = figure.querySelector('a');
  cells.push(['image', img]);
  if (a) {
    const link = document.createElement('a');
    link.innerHTML = a.getAttribute('href');
    link.href = a.getAttribute('href');
    link.title = img.alt;
    cells.push(['link', link]);
  }

  const caption = figure.querySelector('figcaption');
  const p = document.createElement('p');
  p.innerHTML = caption.innerHTML;
  cells.push(['Caption', p]);
  return WebImporter.DOMUtils.createTable(cells, document);
};

const createImageCta = (p, document) => {
  const img = p.querySelector('a img');
  const anchor = img.closest('a');

  anchor.textContent = anchor.href;
  const cells = [];
  cells.push(['imagecta']);
  cells.push([img, anchor])
  return WebImporter.DOMUtils.createTable(cells, document);
}

const createVideo = (iframe, document) => {
  const a = document.createElement('a');
  a.href = iframe.getAttribute('data-src');
  a.textContent = a.href;
  const cells = [];
  cells.push(['video']);
  cells.push([a])
  iframe.replaceWith(WebImporter.DOMUtils.createTable(cells, document));
}


const createPostBody = (main, document) => {
  const body = document.querySelector('article div.newsArticle__content');
  // Fix bad formatting
  body.querySelectorAll(':scope h2 a img, :scope h3 a img, :scope h4 a img, :scope h5 a img').forEach((img) => {
    const heading = img.closest('h2, h3, h4, h5');
    const a = img.closest('a');
    const p = document.createElement('p');
    p.append(a);
    heading.insertAdjacentElement('afterend', p);
  })

  body.querySelectorAll(':scope > h2, :scope > h3, :scope > p, :scope > figure').forEach((ele) => {
    // Fix some bad formatting
    ele.querySelectorAll('em > br, strong > br').forEach((br) => {
      const parent = br.parentElement;
      parent.parentElement.insertBefore(br, parent);
    });

    if (ele.querySelector('iframe')) {
      createVideo(ele.querySelector('iframe'), document);
    }

    if (ele.nodeName === 'FIGURE') {
      const f = processFigure(ele, document);
      main.append(f);
      return;
    }

    const img = ele.querySelector('a img');
    if (img) {
      const anchor = img.closest('a');
      const idx = [...ele.childNodes].indexOf(anchor);

      const table = createImageCta(ele, document);
      if (ele.textContent.trim()) {
        main.append(ele);
        if (idx === 0) {
          ele.insertAdjacentElement('beforebegin', table);
        } else {
          ele.insertAdjacentElement('afterend', table);
        }
      } else {
        main.append(table);
      }
    } else if (ele.childNodes.length > 0 || ele.textContent.trim()) {
      main.append(ele);
    }
  });

}

const createAuthorTeaser = (main, document, meta) => {
  const cells = [['Author Teaser']];
  cells.push([meta.author.cloneNode(true)]);
  const author = WebImporter.DOMUtils.createTable(cells, document);
  main.append(author);
}

export default {
  preprocess: ({ document, url, html, params }) => {
    const path = new URL(url).pathname
    params.name = path.substring(path.lastIndexOf('/') + 1);
  },

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {

    WebImporter.DOMUtils.remove(document, [
      'noscript',
    ]);

    const metadata = createMetadata(document, params);
    const main = document.createElement('main');
    const heroimg = document.querySelector('main article img');
    main.append(heroimg);
    const h1 = document.querySelector('main article h1');
    main.append(h1);

    createPostBody(main, document);

    main.append(document.createElement('hr'));
    createAuthorTeaser(main, document, metadata);

    main.append(document.createElement('hr'));
    const metaBlock = WebImporter.Blocks.getMetadataBlock(document, metadata);
    main.append(metaBlock);

    // Fix URLs
    main.querySelectorAll('a').forEach(fixUrl);


    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    const path = WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''));
    const lastSlashIndex = path.lastIndexOf('/');
    return `${params.bucket}${path.slice(lastSlashIndex)}`;
  },
};
