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

const createHero = (main, document) => {

  const contributor = document.querySelector('aside .contributorBlock');
  const bgimg = contributor.style.backgroundImage
  const tmp = bgimg.replace(/^.*(http:.*)".*$/, '$1');
  const img = document.createElement('img');
  img.src = tmp;
  const cells = [];
  cells.push(['Hero']);
  cells.push([img])
  const hero = WebImporter.DOMUtils.createTable(cells, document);
  main.append(hero);
  return hero;
}

const createAuthorBlock = (main, document) => {
  const contributor = document.querySelector('.contributorBlock');

  const cells = []
  cells.push(['Author'])
  const name = contributor.querySelector('[data-epi-property-name="ContributorName"]').textContent
  cells.push(['Name', name]);
  cells.push(['Image', contributor.querySelector('img')]);

  if (contributor.querySelector('[data-epi-property-name="ContributorTitle"]')) {
    cells.push(['Title', contributor.querySelector('[data-epi-property-name="ContributorTitle"]').textContent]);
  }

  cells.push(['Intro', contributor.querySelector('[data-epi-property-name="ContributorIntro"]').textContent]);

  const socialList = contributor.querySelector('ul.social__links');
  if (socialList) {
    const ul = document.createElement('ul');
    socialList.querySelectorAll('li').forEach((li) => {
      const site = li.getAttribute('data-epi-property-name').replace(/Contributor(.*)Link/, '$1');
      const link = li.querySelector('a');
      if (link) {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${link}">${name} on ${site}</a>`;
        ul.append(li);
      }
    })
    cells.push(['Social', ul]);
  }
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
  return table;
}

const createArticleListBlock = (main, document) => {
  const cells = [];
  cells.push(['Article List']);
  cells.push(['Author', '']);
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.append(table);
  return table;
}

const createMetadataBlock = (main, document, img) => {
  const meta = {}

  const title = document.querySelector('title');
  if (title) {
    meta.title = title.textContent;
  }

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    meta.description = description.getAttribute('content');
  }

  meta['og:image'] = img;
  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);
  return meta;
}

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
    const main = document.createElement('main');
    createHero(main, document);
    // main.querySelector('img').after(document.createElement('hr'));
    const author = createAuthorBlock(main, document);
    createArticleListBlock(main, document);
    createMetadataBlock(main, document, author.querySelector('img').cloneNode());

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
  }) => WebImporter.FileUtils.sanitizePath(new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, '')),
};
