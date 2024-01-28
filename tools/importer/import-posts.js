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

import { blurbs } from './blurbs.js';

const famousUrl = (a) => {
  if (a.host !== 'www.famous-smoke.com') {
    return a.href;
  }
  const baseUri = a.pathname.startsWith('/cigaradvisor')
    ? 'https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page'
    : 'https://www.famous-smoke.com';
  return `${baseUri}${a.pathname}`;
};
const createMetadata = (document, params) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.textContent;
  }

  const description = document.querySelector('[property="og:description"]');
  if (description) {
    meta.description = description.content;
  }

  meta.articleBlurb = blurbs[params.name] || '';

  const publishedDate = document.querySelector('meta[property="article:published_time"]');
  if (publishedDate) {
    const date = new Date(publishedDate.getAttribute('content'));
    meta.publishedDate = date.toLocaleDateString();
    params.bucket = `${date.getFullYear()}/${date.getMonth()+1}`;
  } else {
    params.bucket = '';
  }

  const readingTime = document.querySelector('.rt-time');
  if (readingTime) {
    meta.readingTime = readingTime.textContent;
  }

  const readingTimeUnit = document.querySelector('.rt-label.rt-postfix');
  if (readingTimeUnit) {
    meta.readingTime += ` ${readingTimeUnit.textContent}`;
  }

  const category = document.querySelector('main article .tag');
  if (category) {
    meta.category = famousUrl(category);
  }

  const authorLink = document.querySelector('#articleNav > li:nth-child(1) > a');
  if (authorLink) {
    meta.author = famousUrl(authorLink);
  }
  return meta;
};

const processFigure = (figure, document) => {
  const cells = [];
  cells.push(['Captioned Image']);
  const img = figure.querySelector('img');
  const a = figure.querySelector('a');
  const link = document.createElement('a');
  link.innerHTML = a.href;
  link.href = a.href;
  link.title = img.alt;
  cells.push([img, link]);

  const caption = figure.querySelector('figcaption');
  cells.push(['Caption', caption.innerHTML]);

  return WebImporter.DOMUtils.createTable(cells, document);
};

const createPostBody = (main, document) => {
  const body = document.querySelector('article div.newsArticle__content');
  body.querySelectorAll(':scope > h2, :scope > h3, :scope > p, :scope > figure').forEach((ele) => {
    // Fix some bad formatting
    ele.querySelectorAll('em > br, strong > br').forEach((br) => {
      const parent = br.parentElement;
      ele.insertBefore(br, parent);
    });
    main.append(ele);
  });
  main.querySelectorAll('figure').forEach((f) => {
    f.replaceWith(processFigure(f, document));
  })
}

const createAuthorTeaser = (main, document, meta) => {
  const cells = [['Author-teaser']];
  cells.push([meta.author]);
  const author = WebImporter.DOMUtils.createTable(cells, document);
  main.append(author);
}

const createRelatedArticles = (main, document) => {
  const title = document.querySelector('main div.newsArticle__related h3').textContent;
  const h3 = document.createElement('h3');
  h3.textContent = title;
  main.append(h3);

  const wrapper = document.querySelector('article')?.nextElementSibling?.nextElementSibling?.nextElementSibling;
  const articleList = [];
  articleList.push(['Article List']);

  let list = '';
  wrapper.querySelectorAll('article').forEach((article) => {
    const href = article.querySelector('.read_more').href;
    const date = new Date(article.querySelector('.article__pubdate').getAttribute('datetime'));
    const link = href.replace(/(.*)\/cigaradvisor\/(.*)/, `$1/cigaradvisor/${date.getFullYear()}/${date.getMonth()+1}/$2`);
    const li = document.createElement('li');
    li.innerHTML = link;
    list += li.outerHTML;
  })
  articleList.push(['Articles', list]);
  main.append(WebImporter.DOMUtils.createTable(articleList, document));
}

export default {
  preprocess: ({ document, url, html, params }) => {
    // TODO: This isn't the right source for the blurb, gonna have to find the correct one.
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      const ld = JSON.parse(script.innerHTML);
      if (!Array.isArray(ld) && ld.description) {
        params.articleBlurb = ld.description;
      }
    });
    params.name = url.substring(url.lastIndexOf('/') + 1);
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
    createRelatedArticles(main, document);

    main.append(document.createElement('hr'));
    const metaBlock = WebImporter.Blocks.getMetadataBlock(document, metadata);
    main.append(metaBlock);

    createMetadata(main, document, url, params);

    // Fix URLs
    main.querySelectorAll('a').forEach((a) => {
      a.href = famousUrl(a);
    });

    WebImporter.DOMUtils.remove(main, [
      'noscript',
    ]);

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
