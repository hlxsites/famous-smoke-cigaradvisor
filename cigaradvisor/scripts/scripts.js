import {
  sampleRUM,
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
} from './aem.js';
import { loadReturnToTop } from '../blocks/return-to-top/return-to-top.js';
import addLinkingData from './linking-data.js';

const LCP_BLOCKS = ['hero', 'articleheader'];
const AUTHOR_INDEX_PATH = '/cigaradvisor/index/author-index.json';
const CATEGORY_INDEX_PATH = '/cigaradvisor/index/category-index.json';
const ARTICLE_INDEX_PATH = '/cigaradvisor/index/article-index.json';
const SEARCH_INDEX_PATH = '/cigaradvisor/index/search-index.json';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  if (getMetadata('template')) {
    return;
  }
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)
    && h1.parentElement === picture.closest('div')) {
    let section = document.createElement('div');
    if (h1.parentElement.childElementCount === 2) {
      section = h1.parentElement;
    }
    const p = picture.parentElement;
    section.replaceChildren(buildBlock('hero', { elems: [h1, picture] }));
    main.prepend(section);
    p.remove();
  }
}

/**
 * Imports a template specific JS file for decorating the page with auto-blocks, etc.
 * @param main
 */
async function decorateTemplate(main) {
  // Nothing to process
  const template = getMetadata('template');
  if (!template) {
    return;
  }

  // Protect against recursion from fragment block
  if (!main.closest(`.${template}`)) {
    return;
  }
  const name = template.replace('-template', '');
  try {
    const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/styles/templates/${name}.css`);
    const decorationComplete = new Promise((resolve) => {
      (async () => {
        try {
          const tpl = await import(`${window.hlx.codeBasePath}/scripts/templates/${name}.js`);
          if (tpl.default) {
            await tpl.default(main);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`failed to load template script for ${name}`, error);
        }
        resolve();
      })();
    });
    await Promise.all([cssLoaded, decorationComplete]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`failed to load template ${name}`, error);
  }
}

function decoratePictures(main) {
  main.querySelectorAll('.default-content-wrapper picture').forEach((picture) => {
    const img = picture.querySelector('img');
    const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
    picture.style.paddingBottom = `${ratio}%`;
    picture.style.maxWidth = `${img.width}px`; // Prevent pixelation
  });
}

/**
 * Updates an image to use a friendly file name; e
 * either one provided (override existing) or derived from the alt text.
 * @param {HTMLPictureElement} picture image to process
 * @param {string} override desired filename
 */
export function decorateSeoPicture(picture, override = undefined) {
  const update = (relUrl, name) => {
    const url = new URL(relUrl, window.location.href);
    const { pathname, search } = url;
    const ext = pathname.substring(pathname.lastIndexOf('.') + 1);

    const match = pathname.match(/^(.*\/media_[a-z0-9]+)[./]/);
    if (match) {
      return `${match[1]}/${name}.${ext}${search}`;
    }
    return relUrl;
  };

  const img = picture.querySelector('img');
  let name = override || img.alt;
  if (name) {
    name = name
      .substring(0, 40)
      .toLowerCase()
      .replace(/[^0-9a-z]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    picture.querySelectorAll('source').forEach((s) => {
      s.srcset = update(s.srcset, name);
    });
    img.src = update(img.getAttribute('src'), name);
  }
}

function decorateSeoPictures(main) {
  main.querySelectorAll('picture').forEach((picture) => decorateSeoPicture(picture));
}

const ICON_ALTS = new Map([
  ['magnifying-glass', 'Search'],
  ['bars', 'Toggle navigation'],
  ['x-twitter', 'X'],
  ['facebook-f', 'Facebook'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['pinterest-p', 'Pinterest'],
  ['monster', 'Cigar Monster'],
  ['auctioneer', 'Cigar Auctioneer'],
  ['famous', 'Famous Smoke'],
]);

/**
 * Decorates the block icons with metadata.
 * @param {HTMLElement} block - The block element.
 */
export function decorateIconMetadata(block) {
  block.querySelectorAll('span.icon > img[data-icon-name]').forEach((icon) => {
    const iconName = icon.getAttribute('data-icon-name');
    if (ICON_ALTS.has(iconName)) {
      icon.setAttribute('alt', ICON_ALTS.get(iconName));
    }
  });
}

/**
 * Builds two column grid.
 * @param {Element} main The container element
 */
function buildLayoutContainer(main) {
  main.querySelectorAll(':scope > .section[data-layout]').forEach((section) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('layout-wrapper');
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left-grid');
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right-grid');
    let current = leftDiv;
    [...section.children].forEach((child) => {
      if (child.classList.contains('separator-wrapper')) {
        current = rightDiv;
        child.remove();
        return;
      }
      current.append(child);
    });
    wrapper.append(leftDiv, rightDiv);
    section.append(wrapper);
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
async function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
    await decorateTemplate(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export async function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateSeoPictures(main);
  await buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decoratePictures(main);
  buildLayoutContainer(main);
}

/**
 * Checks if the given path is an external URL.
 * @param {string} path - The path to be checked.
 * @returns {boolean} - Returns true if the path is an external URL, false otherwise.
 */
export function isInternal(path) {
  try {
    const url = new URL(path);
    return (window.location.hostname === url.hostname && url.pathname.startsWith('/cigaradvisor'));
  } catch (error) {
    return true;
  }
}

/**
 * Decorates external links by adding target="_blank" and rel="noopener".
 * @param {HTMLElement} element - The element containing the external links.
 */
export function decorateExternalLink(element) {
  const anchors = element.querySelectorAll('a');
  anchors.forEach((a) => {
    if (!isInternal(a.getAttribute('href'))) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
}

/**
 * Returns the relative path from a given path.
 * If the path is a URL, it extracts the pathname.
 * @param {string} path - The path to get the relative path from.
 * @returns {string} - The relative path.
 */
export function getRelativePath(path) {
  let relPath = path;
  try {
    const url = new URL(path);
    relPath = url.pathname;
  } catch (error) {
    // do nothing
  }
  return relPath;
}

const articleIndexData = [];
/**
 * Loads posts from the specified path asynchronously.
 * @param {string} path - The path to fetch the posts from.
 * @param {boolean} recurse - Indicates whether to recursively load more articles.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of post objects.
 */
export async function loadPosts(path = ARTICLE_INDEX_PATH, recurse = false) {
  if (articleIndexData.length === 0 || recurse) {
    const resp = await fetch(path);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    jsonData.data.forEach((a) => {
      articleIndexData.push({ ...a });
    });
    // If there are more articles to load, load them
    if ((jsonData.total - jsonData.offset) > jsonData.limit) {
      const offset = jsonData.offset + jsonData.limit;
      const indexPath = `${ARTICLE_INDEX_PATH}?offset=${offset}&limit=${jsonData.total - offset}`;
      await loadPosts(indexPath, true);
    }
  }
  // Protected against callers modifying the objects
  const ret = [];
  if (articleIndexData) {
    articleIndexData.forEach((a) => {
      ret.push({ ...a });
    });
  }
  return ret;
}

const searchIndexData = [];
/**
 * Retrieves search index data from the server.
 * @returns {Promise<Object>} The search index data.
 */
export async function getSearchIndexData(path = SEARCH_INDEX_PATH, flag = false) {
  if (searchIndexData.length === 0 || flag) {
    const resp = await fetch(path);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    jsonData.data.forEach((a) => {
      searchIndexData.push({ ...a });
    });
    // If there are more items to load, load them
    if ((jsonData.total - jsonData.offset) > jsonData.limit) {
      const offset = jsonData.offset + jsonData.limit;
      const indexPath = `${SEARCH_INDEX_PATH}?offset=${offset}&limit=${jsonData.total - offset}`;
      await getSearchIndexData(indexPath, true);
    }
  }
  // Protected against callers modifying the objects
  const ret = [];
  if (searchIndexData) {
    searchIndexData.forEach((a) => {
      ret.push({ ...a });
    });
  }
  return ret;
}

/**
 * Fetches posts information based on the provided filter value and filter parameter.
 * @param {string} filterValue - The value to filter the posts by.
 * @param {string} [filterParam='path'] - The parameter to filter the posts by (default is 'path').
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of filtered post data.
 */
export async function fetchPostsInfo(filterValue, filterParam = 'path') {
  let filter = filterValue;
  filter = getRelativePath(filterValue);
  const articles = await loadPosts();
  return articles.filter((obj) => obj[filterParam] === filter);
}

export async function fetchPostsByCategory(category) {
  const categoryType = category.split('/').pop();
  const indexPath = `/cigaradvisor/index/article-index-${categoryType}.json`;
  const articles = await loadPosts(indexPath);
  return articles;
}

/**
 * Fetches a post by a given index, starting at 1.
 * @param idx the index
 * @return {Promise<Object>}
 */
export async function getPostByIdx(idx) {
  const articles = await loadPosts();
  if (articles.length >= idx) {
    return articles[idx - 1];
  }
  return undefined;
}

let authorIndexData;

/**
 * Retrieves all authors from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of author data.
 */
export async function getAllAuthors(sort = false) {
  if (!authorIndexData) {
    const resp = await fetch(AUTHOR_INDEX_PATH);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
      authorIndexData = jsonData.data;
    }
  }
  if (sort) {
    authorIndexData.sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      // eslint-disable-next-line no-nested-ternary
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });
  }

  // Protected against callers modifying the objects
  const ret = [];
  if (authorIndexData) {
    authorIndexData.forEach((a) => {
      ret.push({ ...a });
    });
  }
  return ret;
}

let categoryIndexData;

export async function fetchAllCategories() {
  if (!categoryIndexData) {
    const resp = await fetch(CATEGORY_INDEX_PATH);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
      categoryIndexData = jsonData.data;
    }
  }
}

/**
 * Fetches author information based on the provided author link.
 * @param {string} authorLink - The link to the author's page.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
 * author information objects.
 */
export async function fetchAuthorInfo(authorLink) {
  const filter = getRelativePath(authorLink);
  await getAllAuthors();
  if (!authorIndexData) {
    return undefined;
  }
  return authorIndexData.find((obj) => obj.path === filter);
}

/**
 * Fetches category information based on the provided category link.
 * @param {string} categoryLink - The link to the category.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
 * category objects matching the provided link.
 */
export async function fetchCategoryInfo(categoryLink) {
  const filter = getRelativePath(categoryLink);
  if (!categoryIndexData) {
    const resp = await fetch(CATEGORY_INDEX_PATH);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    categoryIndexData = jsonData.data;
  }
  // Protect against caller modifying object;
  if (!categoryIndexData) {
    return undefined;
  }
  const found = categoryIndexData.find((obj) => obj.path === filter);
  return { ...found };
}

/**
 * Decorates social links by adding classes based on their text content.
 * @param {HTMLElement} element - The element containing the social links.
 */
export function decorateSocialLinks(element) {
  const socialLinks = element.querySelectorAll('a');
  socialLinks.forEach((link) => {
    const text = link.textContent;
    const textToClass = text.trim().toLowerCase().replace(/\s/g, '-');
    if (textToClass) {
      link.classList.add(textToClass);
      link.textContent = '';
    }
  });
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    await decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);
  decorateIconMetadata(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadReturnToTop(main);
  addLinkingData(doc);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
