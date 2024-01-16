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

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.classList.add('section--hero');
    const heroContent = document.createElement('div');
    heroContent.classList.add('hero-content');
    const search = document.createElement('div');
    search.classList.add('search');
    search.innerHTML = `<form action="/cigaradvisor/" class="hero-search" method="get">
    <label class="sr-only" for="main-search-term">Search</label>
    <div class="search-box">
    <input type="search" class="search__input predictiveSearch" id="main-search-term" maxlength="255" placeholder="SEARCH" name="s" data-url="GetSearchSuggestions" autocomplete="off" value="">
    <button type="submit" class="search__submit" value="Submit" title="Submit"></button>
    </div>
    </form>`;
    heroContent.append(h1);
    heroContent.append(search);
    section.append(buildBlock('hero', { elems: [picture, heroContent] }));
    main.prepend(section);
    // on-focus of input, add class to form
    const searchInput = main.querySelector('.hero-search input');
    searchInput.addEventListener('focus', () => {
      searchInput.parentNode.classList.add('focused');
    });
    // on-blur of input, remove class from form
    searchInput.addEventListener('blur', () => {
      searchInput.parentNode.classList.remove('focused');
    });
  }
}

/**
 * Builds the article header for the given main element.
 * @param {HTMLElement} mainEl - The main element to build the article header for.
 */
function buildArticleHeader(mainEl) {
  // eslint-disable-next-line no-use-before-define
  decorateExternalLink(mainEl);
  const paragraphs = mainEl.querySelectorAll('p');
  paragraphs.forEach((paragraph) => {
    if (paragraph.querySelector('picture') !== null) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('article-image-wrapper');
      if (paragraph.querySelector('a') !== null) {
        const a = paragraph.querySelector('a');
        a.replaceChildren(paragraph.querySelector('picture'));
        imageWrapper.append(a);
      } else {
        imageWrapper.append(paragraph.querySelector('picture'));
      }
      const nextSibling = paragraph.nextElementSibling;
      if (nextSibling && nextSibling.tagName === 'P' && nextSibling.querySelector('em')) {
        nextSibling.classList.add('article-image-caption');
        imageWrapper.append(nextSibling);
      }
      paragraph.replaceChildren(imageWrapper);
    }
  });
  const h3 = mainEl.querySelectorAll('h3');
  h3.forEach((heading) => {
    const p = document.createElement('p');
    p.innerHTML = '&nbsp;';
    heading.prepend(p);
  });
  const div = document.createElement('div');
  const h1 = mainEl.querySelector('h1');
  const picture = mainEl.querySelector('picture');
  const category = getMetadata('category');
  const authorLink = getMetadata('author');
  const publishedDate = getMetadata('publisheddate');
  const readTime = document.querySelector('meta[name="readingtime"]').content;
  const articleBlurb = getMetadata('articleblurb');

  const articleHeaderBlockEl = buildBlock('articleheader', [
    [picture],
    [`<p class="category">${category}</p>`],
    [h1],
    [`<p class="read-time">${readTime}</p>`],
    [`<p class="author">${authorLink}</p>`],
    [`<p class="published-date">${publishedDate}</p>`],
    [`<p class="article-blurb">${articleBlurb}</p>`],
  ]);
  div.append(articleHeaderBlockEl);
  mainEl.prepend(div);
}

/**
 * Builds two column grid.
 * @param {Element} main The container element
 */
function buildTwoColumnGrid(main) {
  main.querySelectorAll(':scope > .section[data-layout="50/50"]').forEach((section) => {
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
    section.append(leftDiv, rightDiv);
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
function buildAutoBlocks(main) {
  try {
    const isHome = document.querySelector('body.homepage');
    const isBlogPost = document.querySelector('body.blog-post-template');
    if (isHome) {
      buildHeroBlock(main);
    }
    if (isBlogPost) {
      buildArticleHeader(main);
    }
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
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  buildTwoColumnGrid(main);
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

let indexData = '';
let authorIndexData = '';
let articleIndexData = '';
/**
 * Fetches data from a specified URL and returns the filtered
 * data based on the provided filter path.
 * @param {string} filterPath - The path used to filter the data.
 * @param {string} [fetchUrl='/query-index.json'] - The URL to fetch the data
 *  from. Defaults to '/query-index.json'.
 * @returns {Promise<Object>} - A promise that resolves to the filtered data object.
 */
export async function fetchData(filterPath, fetchUrl = '/query-index.json') {
  let responeData = '';
  if (fetchUrl === '/query-index.json') {
    if (!indexData) {
      const resp = await fetch(fetchUrl);
      let jsonData = '';
      if (resp.ok) {
        jsonData = await resp.json();
      }
      indexData = jsonData.data;
    }
    responeData = indexData;
  }
  if (fetchUrl === '/cigaradvisor/posts/query-index.json') {
    if (!articleIndexData) {
      const resp = await fetch(fetchUrl);
      let jsonData = '';
      if (resp.ok) {
        jsonData = await resp.json();
      }
      articleIndexData = jsonData.data;
    }
    responeData = articleIndexData;
  }
  if (fetchUrl === '/cigaradvisor/author/query-index.json') {
    if (!authorIndexData) {
      const resp = await fetch(fetchUrl);
      let jsonData = '';
      if (resp.ok) {
        jsonData = await resp.json();
      }
      authorIndexData = jsonData.data;
    }
    responeData = authorIndexData;
  }
  let filteredData = '';
  if (responeData) {
    filteredData = responeData.find((obj) => obj.path === filterPath);
  }
  return filteredData;
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
    link.classList.add(textToClass);
    link.textContent = '';
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
    decorateMain(main);
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
