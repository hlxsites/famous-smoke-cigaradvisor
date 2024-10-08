import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import {
  fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo, loadPosts, getRelativePath,
  fetchPostsByCategory,
  getAllAuthors, fetchAllCategories,
} from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';
import { generatePagination, getCategory } from '../../scripts/util.js';

/**
 * Renders the page with the given wrapper element, articles, limit, and articlesCount.
 *
 * @param {HTMLElement} wrapper - The wrapper element to render the page into.
 * @param {Array} articles - The array of articles to render.
 * @param {Number|String} limit - The limit of articles per page.
 * @param {number} articlesCount - The total count of articles. This is passed for pagination
 *  when full list of articles are not passed.
 * @returns {Promise<void>} - A promise that resolves when the page is rendered.
 */
export async function renderPage(wrapper, articles, limit = 10, articlesCount = undefined) {
  let pageSize = 10;
  if (!articles || articles.length === 0) {
    return;
  }
  const limitPerPage = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);
  if (limitPerPage) {
    pageSize = Math.round(limitPerPage - (limitPerPage % 2));
  }
  const list = document.createElement('div');
  list.classList.add('article-teaser-list');
  let currentPage = 1;
  const match = window.location.hash.match(/page=(\d+)/);
  if (match) {
    currentPage = Number.isNaN(parseInt(match[1], 10)) ? currentPage : parseInt(match[1], 10);
  }
  let totalPages;
  let articleList;
  /* articlesCount is passed when full list of articles are not passed.
   * This is needed for pagination.
   */
  if (articlesCount) {
    totalPages = Math.ceil(articlesCount / pageSize);
    articleList = [...articles];
  } else {
    totalPages = Math.ceil(articles.length / pageSize);
    articleList = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }

  // populating authors and categories info cache
  await Promise.all([getAllAuthors(), fetchAllCategories()]).then();

  // eslint-disable-next-line max-len
  // eslint-disable-next-line max-len
  const articlePromises = articleList.map(async (article) => {
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
      list.append(teaser);
    });
  });
  list.querySelector('.article-teaser.block .article-image img')?.setAttribute('loading', 'eager');
  wrapper.replaceChildren(list);

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    paginationContainer.appendChild(generatePagination(currentPage, totalPages));
    wrapper.append(paginationContainer);
  }
}

async function renderByCategory(wrapper, category, limit) {
  const articles = await fetchPostsByCategory(category);
  await renderPage(wrapper, articles, limit);
}

async function renderByAuthor(wrapper, author, limit) {
  const articles = await fetchPostsInfo(author, 'author');
  await renderPage(wrapper, articles, limit);
}

// eslint-disable-next-line no-param-reassign
async function renderByList(configs, wrapper, pinnedArticles, limit) {
  // eslint-disable-next-line no-param-reassign
  pinnedArticles = pinnedArticles || [];
  // eslint-disable-next-line no-param-reassign
  pinnedArticles = Array.isArray(pinnedArticles) ? pinnedArticles : [pinnedArticles];
  let extra = [];
  const allArticles = await loadPosts();
  if (configs.next && configs.next.toLowerCase() === 'all') {
    extra = [...allArticles];
  } else if (configs.next && !Number.isNaN(parseInt(configs.next, 10))) {
    const total = parseInt(configs.next, 10);
    let count = 0; // count of items added to extra
    let i = 0; // Counter for how many we've looked at
    const posts = [...allArticles];
    do {
      if (i >= posts.length) break; // We've run out of posts to look at (shouldn't happen
      const next = posts[i];
      const url = new URL(next.path, window.location.href).toString();
      if (!pinnedArticles.includes(url)) {
        extra.push(next);
        count += 1;
      }
      i += 1;
    } while (count < total);
  }

  const articles = [];
  if (pinnedArticles.length) {
    const pinnedPaths = pinnedArticles.map((article) => getRelativePath(article));
    const tmp = allArticles.filter((article) => pinnedPaths.includes(article.path));
    articles.push(...tmp);
  }
  articles.push(...extra);
  return renderPage(wrapper, articles, limit);
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  const configs = readBlockConfig(block);
  let { author, category } = configs;
  const { articles } = configs;

  const limit = Number.isNaN(parseInt(configs.limit, 10)) ? 10 : parseInt(configs.limit, 10);

  if (!category && Object.hasOwn(configs, 'category') && getCategory(window.location.pathname)) {
    category = window.location.toString();
  } else if (!author && Object.hasOwn(configs, 'author') && window.location.pathname.includes('/cigaradvisor/author/')) {
    author = window.location.toString();
  }

  const articleTeaserWrapper = document.createElement('div');
  articleTeaserWrapper.classList.add('article-teaser-wrapper');
  block.replaceChildren(articleTeaserWrapper);

  if (category) {
    await renderByCategory(articleTeaserWrapper, category, limit);
  } else if (author) {
    await renderByAuthor(articleTeaserWrapper, author, limit);
  } else {
    await renderByList(configs, articleTeaserWrapper, articles, limit);
  }

  window.addEventListener('hashchange', async () => {
    if (category) {
      await renderByCategory(articleTeaserWrapper, category, limit);
    } else if (author) {
      await renderByAuthor(articleTeaserWrapper, author, limit);
    } else {
      await renderByList(configs, articleTeaserWrapper, articles, limit);
    }
  });

  // setting eager loading for first 2 images under the block
  const articleTeaserImage = block.querySelector('.article-teaser.block .article-image img');
  articleTeaserImage?.setAttribute('loading', 'eager');
  const articleTeaserImage2 = block.querySelector('.article-teaser.block:nth-child(2) .article-image img');
  articleTeaserImage2?.setAttribute('loading', 'eager');
}
