import { readBlockConfig, loadCSS } from '../../scripts/aem.js';

import { renderPage } from '../article-list/article-list.js';

const searchParams = new URLSearchParams(window.location.search);

/**
 * Get details of each search result from the article-index.
 *
 * @param {Array} results - The search results.
 * @param {Array} allArticles - All the articles.
 * @param {HTMLElement} wrapper - The wrapper element to append the results.
 * @param {number} limit - The maximum number of articles to display.
 * @param {number} articlesCount - The total count of articles. This is needed for pagination.
 * @returns {Promise<void>} - A promise that resolves when the page is rendered.
 */
async function processSearchResults(articles, wrapper, limit, articlesCount) {
  await renderPage(wrapper, articles, limit, articlesCount);
  const loadingImageContainer = document.querySelector('.loading-image-container');
  const articleListWrapper = document.querySelector('.article-list-wrapper');
  articleListWrapper.style.transition = 'opacity 2s';
  articleListWrapper.style.opacity = 1;
  articleListWrapper.style.display = 'block';
  loadingImageContainer.style.transition = 'opacity 2s';
  loadingImageContainer.style.opacity = 0;
  loadingImageContainer.style.display = 'none';
}

async function handleSearch(searchValue, block, limit) {
  const wrapper = block.querySelector('.article-teaser-wrapper');
  const searchSummary = document.createElement('p');
  searchSummary.classList.add('search-summary');
  if (searchValue.length < 3 || !searchValue.match(/[a-z]/i)) {
    searchSummary.innerHTML = 'Please enter at least three (3) characters to search.';
    wrapper.replaceChildren(searchSummary);
    return;
  }

  // show loading spinner
  const loadingImageContainer = document.createElement('div');
  loadingImageContainer.classList.add('loading-image-container');
  const loadingImage = document.createElement('img');
  loadingImage.classList.add('loading-image');
  loadingImage.src = '/cigaradvisor/images/search/ca-search-results-loading.svg';
  loadingImageContainer.append(loadingImage);
  const spinner = document.createElement('span');
  spinner.classList.add('loader');
  loadingImageContainer.append(spinner);
  block.prepend(loadingImageContainer);

  if (window.Worker) {
    const worker = new Worker(`${window.hlx.codeBasePath}/blocks/search-results/search-worker.js`);
    worker.onmessage = async function handleWorker(event) {
      const { results } = event.data;
      const articlesCount = results.length;

      searchSummary.textContent = `Your search for "${searchValue}" resulted in ${results.length} articles`;
      if (results.length === 0) {
        const noResults = document.createElement('p');
        noResults.classList.add('no-results');
        noResults.textContent = 'Sorry, we couldn\'t find the information you requested!';
        wrapper.replaceChildren(searchSummary);
        wrapper.append(noResults);
        loadingImageContainer.style.display = 'none';
        return;
      }
      let filteredDataCopy = [...results];

      // load the first page of results
      let resultsToShow = filteredDataCopy.slice(0, limit);
      // eslint-disable-next-line max-len
      await processSearchResults(resultsToShow, wrapper, limit, articlesCount);

      wrapper.prepend(searchSummary);

      // handle pagination. Render each page of results when the hash changes
      window.addEventListener('hashchange', async () => {
        const heroSearch = document.querySelector('.hero-search');
        if (heroSearch) {
          heroSearch.querySelector('input').value = searchValue;
        }
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const page = hashParams.get('page');
        const start = (page - 1) * limit;
        const end = start + limit;
        filteredDataCopy = [...results];
        resultsToShow = filteredDataCopy.slice(start, end);
        await processSearchResults(resultsToShow, wrapper, limit, articlesCount);
        wrapper.prepend(searchSummary);
      });
    };

    // To perform a search
    worker.postMessage({ searchValue });
  }
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-list/article-list.css`);

  const configs = readBlockConfig(block);
  const limit = Number.isNaN(parseInt(configs.limit, 10)) ? 10 : parseInt(configs.limit, 10);

  const articleListWrapper = document.createElement('div');
  articleListWrapper.classList.add('article-list-wrapper');

  const articleList = document.createElement('div');
  articleList.classList.add('article-list', 'block');

  const articleTeaserWrapper = document.createElement('div');
  articleTeaserWrapper.classList.add('article-teaser-wrapper');

  articleList.append(articleTeaserWrapper);

  articleListWrapper.append(articleList);

  block.replaceChildren(articleListWrapper);

  const heroSearch = document.querySelector('.hero-search');

  if (searchParams.get('s')) {
    const searchValue = searchParams.get('s').trim();
    if (heroSearch) {
      heroSearch.querySelector('input').value = searchValue;
    }
    handleSearch(searchValue, block, limit);
  }

  if (window.location.pathname === '/cigaradvisor/search') {
    heroSearch.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      const searchValue = heroSearch.querySelector('input').value;
      if (searchValue) {
        window.history.pushState({ search: searchValue }, '', `?s=${searchValue}`);
        window.dispatchEvent(new Event('popstate'));
        articleTeaserWrapper.replaceChildren();
        handleSearch(searchValue, block, limit);
      }
    });
  }
}
