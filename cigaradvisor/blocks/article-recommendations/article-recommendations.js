/* eslint-disable max-len */
import { renderPage } from '../article-list/article-list.js';
import { loadCSS, getMetadata } from '../../scripts/aem.js';
import { loadPosts } from '../../scripts/scripts.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-teaser/article-teaser.css`);
  await loadCSS(`${window.hlx.codeBasePath}/blocks/article-list/article-list.css`);

  const articleListWrapper = document.createElement('div');
  articleListWrapper.classList.add('article-list-wrapper');

  const articleList = document.createElement('div');
  articleList.classList.add('article-list', 'block');
  const articleTeaserWrapper = document.createElement('div');
  articleTeaserWrapper.classList.add('article-teaser-wrapper');

  block.append(articleListWrapper);
  const posts = await loadPosts();
  const author = getMetadata('author');
  const category = block.querySelector('.category').innerText.trim();
  const articles = [];
  // 2 posts from the same author “most recent by published date”
  const authorPosts = posts.filter((post) => author.includes(post.author) && post.path !== window.location.pathname);
  articles.push(...authorPosts.slice(0, 2));
  // 1 post from the same category “most recent by published date”
  const categoryPosts = posts.filter((post) => category.includes(post.category) && !authorPosts.includes(post) && post.path !== window.location.pathname);
  if (categoryPosts.length > 0) {
    articles.push(categoryPosts[0]);
  }
  // 1 random post
  const randomPost = posts.filter((post) => !authorPosts.includes(post) && !categoryPosts.includes(post) && post.path !== window.location.pathname);
  if (randomPost.length > 0) {
    articles.push(randomPost[0]);
  }

  await renderPage(articleTeaserWrapper, articles, 4);

  articleList.append(articleTeaserWrapper);

  articleListWrapper.append(articleList);

  block.replaceChildren(articleListWrapper);
}
