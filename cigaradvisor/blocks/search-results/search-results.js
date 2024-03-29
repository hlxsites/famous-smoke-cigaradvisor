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
      const idx = (result.heading || result.title || result.description).toLowerCase().indexOf(term);
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

async function handleSearch(searchValue, wrapper, limit) {
  const searchSummary = document.createElement('p');
  searchSummary.classList.add('search-summary');
  if (searchValue.length < 3 || !searchValue.match(/[a-z]/i)) {
    searchSummary.innerHTML = 'Please enter at least three (3) characters to search.';
    wrapper.prepend(searchSummary);
    return;
  }
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => (!!term && term.length > 2));
  const data = await getSearchIndexData();
  const filteredData = filterData(searchTerms, data);

  const articles = [];
  const allArticles = await loadPosts();
  filteredData.forEach((post) => {
    const filteredArticles = allArticles.filter((obj) => obj.path === getRelativePath(post.path));
    articles.push(filteredArticles[0]);
  });
  searchSummary.textContent = `Your search for "${searchValue}" resulted in ${articles.length} articles`;
  if (articles.length === 0) {
    const noResults = document.createElement('p');
    noResults.classList.add('no-results');
    noResults.textContent = 'Sorry, we couldn\'t find the information you requested!';
    wrapper.append(noResults);
  } else {
    await renderPage(wrapper, articles, limit);
  }
  wrapper.prepend(searchSummary);
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

  window.addEventListener('hashchange', async () => {
    if (searchParams.get('s')) {
      const searchValue = searchParams.get('s');
      const heroSearch = document.querySelector('.hero-search');
      if (heroSearch) {
        heroSearch.querySelector('input').value = searchValue;
      }
      await handleSearch(searchValue, articleTeaserWrapper, limit);
    }
  });
}
