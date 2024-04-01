import { readBlockConfig, loadCSS } from '../../scripts/aem.js';

import { getSearchIndexData, loadPosts, getRelativePath } from '../../scripts/scripts.js';
import { renderPage } from '../article-list/article-list.js';

const searchParams = new URLSearchParams(window.location.search);

function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInText = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      // eslint-disable-next-line max-len
      const idx = (result.heading || result.title || result.description || result.blurb || result.path.split('/').pop()).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const fullText = result.text ? result.text.toLowerCase() : '';
    searchTerms.forEach((term) => {
      const idx = fullText.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInText.push({ minIdx, result });
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInText.sort(compareFound),
  ].map((item) => item.result);
}

/**
 * Get details of each search result from the artile-index.
 *
 * @param {Array} results - The search results.
 * @param {Array} allArticles - All the articles.
 * @param {HTMLElement} wrapper - The wrapper element to append the results.
 * @param {number} limit - The maximum number of articles to display.
 * @param {number} articlesCount - The total count of articles. This is needed for pagination.
 * @returns {Promise<void>} - A promise that resolves when the page is rendered.
 */
async function processSearchResults(results, allArticles, wrapper, limit, articlesCount) {
  const articles = [];
  results.forEach((post) => {
    const filteredArticles = allArticles.filter((obj) => obj.path === getRelativePath(post.path));
    articles.push(filteredArticles[0]);
  });
  if (articles.length === 0) {
    const noResults = document.createElement('p');
    noResults.classList.add('no-results');
    noResults.textContent = 'Sorry, we couldn\'t find the information you requested!';
    wrapper.append(noResults);
  } else {
    await renderPage(wrapper, articles, limit, articlesCount);
  }
}

async function handleSearch(searchValue, wrapper, limit) {
  const searchSummary = document.createElement('p');
  searchSummary.classList.add('search-summary');
  if (searchValue.length < 3 || !searchValue.match(/[a-z]/i)) {
    searchSummary.innerHTML = 'Please enter at least three (3) characters to search.';
    wrapper.prepend(searchSummary);
    return;
  }
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => (!!term));
  for (let i = 0; i < searchTerms.length; i += 1) {
    if (searchTerms[i].length < 3) {
      if (i + 1 < searchTerms.length) {
        searchTerms[i] = `${searchTerms[i]} ${searchTerms[i + 1]}`;
      }
    }
  }
  const data = await getSearchIndexData();
  const filteredData = filterData(searchTerms, data);
  const articlesCount = filteredData.length;

  const allArticles = await loadPosts();

  searchSummary.textContent = `Your search for "${searchValue}" resulted in ${filteredData.length} articles`;
  let filteredDataCopy = [...filteredData];

  // load the first page of results
  let resultsToShow = filteredDataCopy.slice(0, limit);

  // eslint-disable-next-line max-len
  await processSearchResults(resultsToShow, allArticles, wrapper, limit, articlesCount);

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
    filteredDataCopy = [...filteredData];
    resultsToShow = filteredDataCopy.slice(start, end);
    await processSearchResults(resultsToShow, allArticles, wrapper, limit, articlesCount);
    wrapper.prepend(searchSummary);
  });
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

  if (searchParams.get('s')) {
    const searchValue = searchParams.get('s');
    const heroSearch = document.querySelector('.hero-search');
    if (heroSearch) {
      heroSearch.querySelector('input').value = searchValue;
    }
    await handleSearch(searchValue, articleTeaserWrapper, limit);
  }

  articleList.append(articleTeaserWrapper);

  articleListWrapper.append(articleList);

  block.replaceChildren(articleListWrapper);
}
