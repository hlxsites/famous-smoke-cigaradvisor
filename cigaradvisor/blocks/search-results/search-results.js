import { readBlockConfig, loadCSS } from '../../scripts/aem.js';

import { getSearchIndexData, fetchPostsInfo } from '../../scripts/scripts.js';
import { renderPage } from '../article-list/article-list.js';

const searchParams = new URLSearchParams(window.location.search);

function compareFound(hit1, hit2) {
  return hit1.minIdx - hit2.minIdx;
}

function filterData(searchTerms, data) {
  const foundInHeader = [];
  const foundInMeta = [];

  data.forEach((result) => {
    let minIdx = -1;

    searchTerms.forEach((term) => {
      const idx = (result.header || result.title).toLowerCase().indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInHeader.push({ minIdx, result });
      return;
    }

    const metaContents = `${result.title} ${result.description} ${result.path.split('/').pop()} ${result.text}`.toLowerCase();
    searchTerms.forEach((term) => {
      const idx = metaContents.indexOf(term);
      if (idx < 0) return;
      if (minIdx < idx) minIdx = idx;
    });

    if (minIdx >= 0) {
      foundInMeta.push({ minIdx, result });
    }
  });

  return [
    ...foundInHeader.sort(compareFound),
    ...foundInMeta.sort(compareFound),
  ].map((item) => item.result);
}

async function handleSearch(searchValue, wrapper, limit) {
  const searchSummary = document.createElement('p');
  searchSummary.classList.add('search-summary');
  const searchTerms = searchValue.toLowerCase().split(/\s+/).filter((term) => !!term);
  const data = await getSearchIndexData();
  const filteredData = filterData(searchTerms, data);

  const articles = [];
  const promises = [];
  filteredData.forEach((post) => {
    promises.push(fetchPostsInfo(post.path));
  });
  await Promise.all(promises).then((result) => {
    result.forEach((detail) => {
      if (detail && detail.length > 0) articles.push(detail[0]);
    });
  });
  searchSummary.innerHTML = `Your search for "<i>${searchValue}</i>" resulted in ${articles.length} <b>articles</b>`;
  if (articles.length === 0) {
    const noResults = document.createElement('p');
    noResults.classList.add('no-results');
    noResults.innerHTML = 'Sorry, we couldn\'t find the information you requested!';
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
