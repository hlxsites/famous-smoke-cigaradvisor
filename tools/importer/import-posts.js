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

const createMetadata = (main, document, url) => {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const articleBlurb = document.querySelector('[property="og:description"]');
  if (articleBlurb) {
    meta.articleBlurb = articleBlurb.content;
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
    meta.category = category.href;
  }

  const authorLink = document.querySelector('#articleNav > li:nth-child(1) > a');
  if (authorLink) {
    meta.author = authorLink.href;
    // meta.authorName = authorLink.textContent.substring(3);
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
export default {

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
    link.textContent = link.href;
    const cells = [['Author']];
    cells.push([link]);
    const author = WebImporter.DOMUtils.createTable(cells, document);
    article.append(author);

    // create the metadata block and append it to the article element
    createMetadata(article, document, url);
    createHero(article, document, url);

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
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
