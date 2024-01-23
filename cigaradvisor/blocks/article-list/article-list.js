import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo } from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';
import { generatePagination } from '../../scripts/util.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  const configs = readBlockConfig(block);
  block.innerHTML = '';
  // eslint-disable-next-line prefer-const, object-curly-newline
  let { category, author, limit = 10, articles } = configs;
  if (!category && Object.hasOwn(configs, 'category') && window.location.pathname.includes('/cigaradvisor/category/')) {
    category = window.location.toString();
  } else if (!author && Object.hasOwn(configs, 'author') && window.location.pathname.includes('/cigaradvisor/author/')) {
    author = window.location.toString();
  }
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('section');
  parentDiv.dataset.layout = '50/50';
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left-grid');
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right-grid');
  let current = rightDiv;
  let currentPage = 1;
  if (category || author || articles) {
    let fetchedArticles;
    if (category) {
      fetchedArticles = await fetchPostsInfo(category, 'category');
    } else if (author) {
      fetchedArticles = await fetchPostsInfo(author, 'author');
    } else if (articles) {
      fetchedArticles = articles;
    }
    if (!fetchedArticles || fetchedArticles.length === 0) {
      return;
    }
    const totalArticles = fetchedArticles.length;
    const totalPages = Math.ceil(totalArticles / limit);
    let categoryInfo;
    let authorInfo;
    if (category) {
      categoryInfo = await fetchCategoryInfo(category);
    }
    if (author) {
      authorInfo = await fetchAuthorInfo(author);
    }
    const urlParams = new URLSearchParams(window.location.search);
    currentPage = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;
    // eslint-disable-next-line max-len
    const articlePromises = [...fetchedArticles].slice((currentPage - 1) * limit, currentPage * limit).map(async (article) => {
      const articleTeaserWrapper = document.createElement('div');
      articleTeaserWrapper.classList.add('article-teaser-wrapper');
      const articleTeaser = document.createElement('div');
      articleTeaser.classList.add('article-teaser');
      articleTeaser.classList.add('block');
      articleTeaserWrapper.append(articleTeaser);
      current = (current === leftDiv) ? rightDiv : leftDiv;
      current.append(articleTeaserWrapper);
      if (categoryInfo) {
        authorInfo = await fetchAuthorInfo(article.author);
        article.author = authorInfo;
        article.category = categoryInfo;
        buildArticleTeaser(articleTeaser, article);
      } else if (authorInfo) {
        categoryInfo = await fetchCategoryInfo(article.category);
        article.author = authorInfo;
        article.category = categoryInfo;
        buildArticleTeaser(articleTeaser, article);
      } else {
        const [articleInfo] = await fetchPostsInfo(article);
        if (!articleInfo) {
          return;
        }
        categoryInfo = await fetchCategoryInfo(articleInfo.category);
        authorInfo = await fetchAuthorInfo(articleInfo.author);
        articleInfo.author = authorInfo;
        articleInfo.category = categoryInfo;
        buildArticleTeaser(articleTeaser, articleInfo);
      }
    });
    await Promise.all(articlePromises);

    parentDiv.append(leftDiv);
    parentDiv.append(rightDiv);
    block.replaceChildren(parentDiv);
    if (totalPages > 1) {
      const pageinationContainer = document.createElement('div');
      pageinationContainer.classList.add('pagination-container');
      pageinationContainer.appendChild(generatePagination(currentPage, totalPages));
      block.append(pageinationContainer);
    }
  }
}
