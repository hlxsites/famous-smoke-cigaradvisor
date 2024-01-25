import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import {
  fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo, loadPosts,
} from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';
import { generatePagination } from '../../scripts/util.js';

let pageSize = 10;

async function renderPage(wrapper, articles) {
  if (!articles || articles.length === 0) {
    return;
  }

  const list = document.createElement('div');
  list.classList.add('article-teaser-list');
  let currentPage = 1;
  const match = window.location.hash.match(/page=(\d+)/);
  if (match) {
    currentPage = Number.isNaN(parseInt(match[1], 10)) ? currentPage : parseInt(match[1], 10);
  }
  const totalPages = Math.ceil(articles.length / pageSize);

  // eslint-disable-next-line max-len
  // eslint-disable-next-line max-len
  const articlePromises = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(async (article) => {
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
  wrapper.replaceChildren(list);

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    paginationContainer.appendChild(generatePagination(currentPage, totalPages));
    wrapper.append(paginationContainer);
  }
}

async function renderByCategory(wrapper, category) {
  const articles = await fetchPostsInfo(category, 'category');
  await renderPage(wrapper, articles);
}

async function renderByAuthor(wrapper, author) {
  const articles = await fetchPostsInfo(author, 'author');
  await renderPage(wrapper, articles);
}

// eslint-disable-next-line no-param-reassign
async function renderByList(configs, wrapper, pinnedArticles) {
// eslint-disable-next-line no-param-reassign
  pinnedArticles = Array.isArray(pinnedArticles) ? pinnedArticles : [pinnedArticles];
  const extra = [];
  if (configs.next && !Number.isNaN(parseInt(configs.next, 10))) {
    const total = parseInt(configs.next, 10);
    let i = 0; // Counter for how many we've found
    let idx = 1; // Counter for moving through the post list.
    const posts = [...(await loadPosts())];
    do {
      const next = posts[idx];
      if (!next) break;
      const url = new URL(next.path, window.location.href).toString();
      if (!pinnedArticles.includes(url)) {
        extra.push(next);
        i += 1;
      }
      idx += 1;
    } while (i < total);
  }

  const tmp = [];
  const promises = [];
  pinnedArticles.forEach((post) => {
    promises.push(fetchPostsInfo(post));
  });
  await Promise.all(promises).then((result) => {
    result.forEach((detail) => {
      if (detail && detail.length > 0) tmp.push(detail[0]);
    });
  });
  const articles = [];
  articles.push(...tmp);
  articles.push(...extra);
  return renderPage(wrapper, articles);
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  const configs = readBlockConfig(block);
  let { author, category } = configs;
  const { articles } = configs;

  const limit = Number.isNaN(parseInt(configs.limit, 10)) ? 10 : parseInt(configs.limit, 10);
  if (limit) {
    pageSize = Math.round(limit - (limit % 2));
  }

  if (!category && Object.hasOwn(configs, 'category') && window.location.pathname.includes('/cigaradvisor/category/')) {
    category = window.location.toString();
  } else if (!author && Object.hasOwn(configs, 'author') && window.location.pathname.includes('/cigaradvisor/author/')) {
    author = window.location.toString();
  }

  const articleTeaserWrapper = document.createElement('div');
  articleTeaserWrapper.classList.add('article-teaser-wrapper');
  block.replaceChildren(articleTeaserWrapper);

  if (category) {
    await renderByCategory(articleTeaserWrapper, category);
  } else if (author) {
    await renderByAuthor(articleTeaserWrapper, author);
  } else if (articles) {
    await renderByList(configs, articleTeaserWrapper, articles);
  }

  window.addEventListener('hashchange', async () => {
    if (category) {
      await renderByCategory(articleTeaserWrapper, category);
    } else if (author) {
      await renderByAuthor(articleTeaserWrapper, author);
    } else if (articles) {
      await renderByList(configs, articleTeaserWrapper, articles);
    }
  });
}
