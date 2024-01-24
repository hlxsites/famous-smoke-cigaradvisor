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

const LCP_BLOCKS = []; // add your LCP blocks to the list
const AUTHOR_INDEX_PATH = '/cigaradvisor/author/query-index.json';
const DEFAULT_INDEX_PATH = '/cigaradvisor/query-index.json';
const ARTICLE_INDEX_PATH = '/cigaradvisor/posts/query-index.json';
/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
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
  await buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  buildLayoutContainer(main);
}

/**
 * Checks if the given path is an external URL.
 * @param {string} path - The path to be checked.
 * @returns {boolean} - Returns true if the path is an external URL, false otherwise.
 */
export function isExternal(path) {
  try {
    const url = new URL(path);
    return window.location.hostname !== url.hostname;
  } catch (error) {
    return false;
  }
}

/**
 * Decorates external links by adding target="_blank" and rel="noopener".
 * @param {HTMLElement} element - The element containing the external links.
 */
export function decorateExternalLink(element) {
  const anchors = element.querySelectorAll('a');
  anchors.forEach((a) => {
    if (isExternal(a.getAttribute('href'))) {
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

let articleIndexData;
async function loadPosts() {
  if (!articleIndexData) {
    const resp = await fetch(ARTICLE_INDEX_PATH);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    articleIndexData = jsonData.data;
  }
  return articleIndexData;
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
  return articles.find((obj) => obj[filterParam] === filter);
}

/**
 * Fetches a post by a given index, starting at 1.
 * @param idx the index
 * @return {Promise<void>}
 */
export async function getPostByIdx(idx) {
  const articles = await loadPosts();
  if (articles.length >= idx) {
    return articles[idx - 1];
  }
  return undefined;
}

/**
 * Retrieves all posts and sorts them by published date.
 * @param {boolean} sort - Indicates whether to sort the posts by published date in ascending order.
 * @returns {Promise<Array>} - A promise that resolves to an array of post data.
 */
export async function getAllPosts() {
  const articles = await loadPosts();
  return articles;
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
  return authorIndexData;
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
  return authorIndexData.find((obj) => obj.path === filter);
}

let categoryIndexData;
/**
 * Fetches category information based on the provided category link.
 * @param {string} categoryLink - The link to the category.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
 * category objects matching the provided link.
 */
export async function fetchCategoryInfo(categoryLink) {
  const filter = getRelativePath(categoryLink);
  if (!categoryIndexData) {
    const resp = await fetch(DEFAULT_INDEX_PATH);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    categoryIndexData = jsonData.data;
  }
  return categoryIndexData.find((obj) => obj.path === filter);
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

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));
  loadReturnToTop(main);

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
