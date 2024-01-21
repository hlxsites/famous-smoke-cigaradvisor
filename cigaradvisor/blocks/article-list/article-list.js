import { readBlockConfig } from '../../scripts/aem.js';
import { fetchData, getRelativePath } from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';

// Function to create ellipsis
function createEllipsis() {
  const listItem = document.createElement('li');
  const a = document.createElement('a');
  const span = document.createElement('span');
  a.className = 'gap';
  span.textContent = '...';
  a.appendChild(span);
  listItem.appendChild(a);
  return listItem;
}

// Function to create a page link
function createPageLink(pageNumber, text, className) {
  const listItem = document.createElement('li');
  const link = document.createElement('a');
  const currentPagePath = window.location.pathname;
  link.href = `${currentPagePath}?page=${pageNumber}`;
  link.title = pageNumber;
  link.textContent = text;

  if (className) {
    link.classList.add(className);
  }

  listItem.appendChild(link);
  return listItem;
}

function generatePagination(currentPage, totalPages) {
  const displayPages = 7;
  const paginationList = document.createElement('ol');
  paginationList.className = 'pagination font-inherit';

  // Previous page link
  paginationList.appendChild(createPageLink(currentPage - 1, '«', 'prev'));

  // Page links
  const startPage = Math.max(1, currentPage - Math.floor(displayPages / 2));
  const endPage = Math.min(totalPages, startPage + displayPages - 1);

  if (startPage > 1) {
    paginationList.appendChild(createPageLink(1, '1'));
    if (startPage > 2) {
      paginationList.appendChild(createEllipsis());
    }
  }

  for (let i = startPage; i <= endPage; i += 1) {
    if (i === currentPage) {
      paginationList.appendChild(createPageLink(i, i, 'active'));
    } else {
      paginationList.appendChild(createPageLink(i, i));
    }
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationList.appendChild(createEllipsis());
    }
    paginationList.appendChild(createPageLink(totalPages, totalPages));
  }

  // Next page link
  paginationList.appendChild(createPageLink(currentPage + 1, '»', 'next'));
  return paginationList;
}

export default async function decorate(block) {
  const configs = readBlockConfig(block);
  const { category } = configs;
  const { limit } = configs;
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('section');
  parentDiv.dataset.layout = '50/50';
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left-grid');
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right-grid');
  let current = rightDiv;
  let currentPage = 1;
  if (category) {
    const articles = await fetchData(getRelativePath(category), '/cigaradvisor/drafts/Kailas/query-index.json', 'category');
    const totalArticles = articles.length;
    const totalPages = Math.ceil(totalArticles / limit);
    const categoryInfo = await fetchData(getRelativePath(category), '/cigaradvisor/drafts/Kailas/query-index.json');
    if (!articles || articles.length === 0) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;
    // eslint-disable-next-line max-len
    const articlePromises = [...articles].slice((currentPage - 1) * limit, currentPage * limit).map(async (article) => {
      const articletTeaserWrapper = document.createElement('div');
      articletTeaserWrapper.classList.add('article-teaser-wrapper');
      const articleTeaser = document.createElement('div');
      articleTeaser.classList.add('article-teaser');
      articleTeaser.classList.add('block');
      articletTeaserWrapper.append(articleTeaser);
      current = (current === leftDiv) ? rightDiv : leftDiv;
      current.append(articletTeaserWrapper);
      await buildArticleTeaser(articleTeaser, article, categoryInfo[0]);
    });
    await Promise.all(articlePromises);

    parentDiv.append(leftDiv);
    parentDiv.append(rightDiv);
    block.replaceChildren(parentDiv);
    const pageinationContainer = document.createElement('div');
    pageinationContainer.classList.add('pagination-container');
    pageinationContainer.appendChild(generatePagination(currentPage, totalPages));
    block.append(pageinationContainer);
  }
}
