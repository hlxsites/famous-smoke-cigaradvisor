import { loadPosts } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { h3 } from '../../scripts/dom-helpers.js';
import { renderPage } from '../article-list/article-list.js';

async function loadMustReadPosts() {
  const resp = await fetch('/cigaradvisor/must-reads.plain.html');
  if (resp.ok) {
    const dom = document.createElement('main');
    dom.innerHTML = await resp.text();
    const mustReadArticleList = dom.querySelectorAll('.article-list li a');
    return Array.from(mustReadArticleList).map((a) => a.getAttribute('href'));
  }
  return [];
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  // Build Article's Custom List Article Block
  const { author, category } = config;

  const posts = await loadPosts();
  const articles = [];

  // 3 posts from the same author and category “most recent by published date”
  articles.push(...posts.filter((post) => author.includes(post.author) && post.path !== window.location.pathname).slice(0, 2));
  articles.push(...posts.filter((post) => category.includes(post.category) && !articles.includes(post) && post.path !== window.location.pathname).slice(0, 3 - articles.length));

  // 1 random post from must-reads page
  const mustReadPosts = await loadMustReadPosts();
  const mustReadCandidatePosts = posts.filter((post) => mustReadPosts.includes(post.path) && !articles.includes(post) && post.path !== window.location.pathname);
  const randomIndex = Math.floor(Math.random() * mustReadCandidatePosts.length);
  articles.push(...mustReadCandidatePosts.slice(randomIndex, randomIndex + 1));

  const wrapper = document.createElement('div');
  wrapper.classList.add('article-teaser-wrapper');

  await renderPage(wrapper, articles);
  block.replaceChildren(h3('You Might Also Like...'), wrapper);
  block.classList.add('article-list');
}
