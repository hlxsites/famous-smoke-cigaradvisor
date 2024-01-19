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

const famousUrl = (a) => {
  const baseUri = a.pathname.startsWith('/cigaradvisor')
    ? 'https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page'
    : 'https://www.famous-smoke.com';
  return `${baseUri}${a.pathname}`;
};
const createMetadata = (main, document, url, params) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const description = document.querySelector('[property="og:description"]');
  if (description) {
    meta.description = description.content;
  }

  if (params.articleBlurb) {
    meta.articleBlurb = params.articleBlurb;
  }

  const img = document.querySelector('[property="og:image"]');
  if (img && img.content) {
    const el = document.createElement('img');
    el.src = img.content;
    meta.image = el;
  }

  const publishedDate = document.querySelector('#articleNav > li:nth-child(2)');
  if (publishedDate) {
    meta.publishedDate = publishedDate.textContent;
  }

  const publishedTime = document.querySelector('[property="article:published_time"]');
  if (publishedTime) {
    const date = new Date(publishedTime.content);
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

  const category = document.querySelector('.tag');
  if (category) {
    meta.category = famousUrl(category);
  }

  const authorLink = document.querySelector('#articleNav > li:nth-child(1) > a');
  if (authorLink) {
    meta.author = famousUrl(authorLink);
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
};

const createHero = (main, document, url) => {
  const image = document.querySelector('.newsArticle__image');
  if (image) {
    image.after(document.createElement('hr'));
  }
};

const handleTextMediaBlock = (figure, document, url) => {
  const caption = figure.querySelector('figure figcaption');
  const emCaption = document.createElement('em');
  emCaption.textContent = caption.textContent;
  const div = document.createElement('div');
  div.appendChild(emCaption);
  figure.append(div);
  caption.remove();
};
export default {

  preprocess: ({ document, url, html, params }) => {
    document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
      const ld = JSON.parse(script.innerHTML);
      if (!Array.isArray(ld) && ld.description) {
        params.articleBlurb = ld.description;
      }
    });
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
    const main = document.body;

    const article = main.querySelector('article');

    // contributor block
    const block = main.querySelector('.contributorBlock');
    const link = block.querySelector('.intro > a');
    const u = famousUrl(link);
    link.href = u;
    link.textContent = u;
    const cells = [['Author-teaser']];
    cells.push([link]);
    const author = WebImporter.DOMUtils.createTable(cells, document);
    article.append(author);

    // create the metadata block and append it to the article element
    createMetadata(article, document, url, params);
    createHero(article, document, url);
    // Text-media autoblocks to image + <em> text
    document.querySelectorAll('figure').forEach((figure) => {
      handleTextMediaBlock(figure, document, url);
    });
    article.querySelectorAll('a').forEach((a) => {
      a.href = famousUrl(a);
    });
    // Fix image located inside a h3 tag
    article.querySelectorAll('h3 a > img').forEach((img) => {
      const a = img.closest('a');
      const h3 = a.closest('h3');
      const picture = document.createElement('picture');
      picture.appendChild(a);
      h3.after(picture);
    });

    WebImporter.DOMUtils.remove(article, [
      'noscript',
      '#comments',
      '.rt-reading-time',
      '#articleNav',
      '.tag',
    ]);

    return article;
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
