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
    search.classList.add('hero-search-bar');
    search.innerHTML = `<form action="https://www.famous-smoke.com/cigaradvisor/" class="hero-search-form" method="get">
    <label class="sr-only" for="main-search-term">Search</label>
    <input type="search" class="search__input predictiveSearch" id="main-search-term" maxlength="255" placeholder="SEARCH" name="s" data-url="GetSearchSuggestions" autocomplete="off" value="">
    <button type="submit" class="search__submit" value="Submit" title="Submit">submit</button>
    </form>`;
    heroContent.append(h1);
    heroContent.append(search);
    section.append(buildBlock('hero', { elems: [picture, heroContent] }));
    main.prepend(section);
  }
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
    buildHeroBlock(main);
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
