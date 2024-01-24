import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo } from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';
import { generatePagination } from '../../scripts/util.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  const configs = readBlockConfig(block);
  block.innerHTML = '';
  const { limit = 10 } = configs;
  let { author, category, articles } = configs;
  if (!category && Object.hasOwn(configs, 'category') && window.location.pathname.includes('/cigaradvisor/category/')) {
    category = window.location.toString();
  } else if (!author && Object.hasOwn(configs, 'author') && window.location.pathname.includes('/cigaradvisor/author/')) {
    author = window.location.toString();
  }
  let currentPage = 1;
  if (category) {
    articles = await fetchPostsInfo(category, 'category');
  } else if (author) {
    articles = await fetchPostsInfo(author, 'author');
  } else if (articles) {
    const tmp = [];
    const promises = [];
    articles.forEach((post) => {
      promises.push(fetchPostsInfo(post));
    });
    await Promise.all(promises).then((result) => {
      result.forEach((detail) => {
        if (detail && detail.length > 0) tmp.push(detail[0]);
      });
    });
    articles = tmp;
  }

  if (!articles || articles.length === 0) {
    return;
  }
  const totalPages = Math.ceil(articles.length / limit);
  const articleTeaserWrapper = document.createElement('div');
  articleTeaserWrapper.classList.add('article-teaser-wrapper');

  const urlParams = new URLSearchParams(window.location.search);
  currentPage = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;
  // eslint-disable-next-line max-len
  const articlePromises = [...articles].slice((currentPage - 1) * limit, currentPage * limit).map(async (article) => {
    const articleTeaser = document.createElement('div');
    articleTeaser.classList.add('article-teaser');
    articleTeaser.classList.add('block');
    if (typeof article.author === 'string') {
      article.author = await fetchAuthorInfo(article.author);
    }
    if (typeof article.category === 'string') {
      article.category = await fetchCategoryInfo(article.category);
    }
    buildArticleTeaser(articleTeaser, article);
    return articleTeaser;
  });
  await Promise.all(articlePromises).then((results) => {
    results.forEach((teaser) => {
      articleTeaserWrapper.append(teaser);
    });
  });
  block.replaceChildren(articleTeaserWrapper);
  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    paginationContainer.appendChild(generatePagination(currentPage, totalPages));
    block.append(paginationContainer);
  }
}
