import { readBlockConfig, loadCSS } from '../../scripts/aem.js';

import { getSearchIndexData, loadPosts, getRelativePath } from '../../scripts/scripts.js';
import { renderPage } from '../article-list/article-list.js';

const searchParams = new URLSearchParams(window.location.search);

function filterData(searchTerms, data) {
  // Object
  // {
  //    priority: Number
  //    article:  article
  //    count: Number
  // }
  const results = [];

  // Create 10 promises and divide all blogs into those ten.
  data.forEach((result) => {
    let rank;
    let count = 0;

    searchTerms.forEach((term) => {
      const regex = new RegExp(term, 'gi');
      // Search in rank order
      const titleParts = result.title ? result.title.split(regex) : [];
      let found = result.title ? [...result.title.matchAll(regex)] : [];
      if (found.length || titleParts.length > 1) {
        rank = 1;
        count += 1;
        count += titleParts.length - 1;
      }

      found = result.heading ? [...result.heading.matchAll(regex)] : [];
      if (found.length) {
        rank ||= 2;
        count += 1;
      }

      found = result.description ? [...result.description.matchAll(regex)] : [];
      if (found.length) {
        rank ||= 3;
        count += 1;
      }

      found = result.blurb ? [...result.blurb.matchAll(regex)] : [];
      if (found.length) {
        rank ||= 4;
        count += 1;
      }

      found = result.text ? [...result.text.matchAll(regex)] : [];
      if (found.length) {
        rank ||= 5;
      }
    });

    if (rank) {
      results.push({ rank, article: result, count });
    }
  });

  return results.sort((l, r) => {
    if (l.rank < r.rank) {
      return -1;
    }
    if (l.rank === r.rank) {
      if (l.count > r.count) {
        return -1;
      } if (l.count < r.count) {
        return 1;
      }
      return 0;
    }
    return 1; // Left rank is greater than right rank - move it down the list.
  }).map((r) => r.article);
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
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => term && term.length > 2);

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
    const searchValue = searchParams.get('s').trim();
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
