/* eslint-disable max-len */
import {
  decorateExternalLink, fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo, loadPosts,
} from '../scripts.js';
import { buildBlock, getMetadata } from '../aem.js';
import { addLdJsonScript } from '../linking-data.js';
import { getCategory } from '../util.js';

async function addLdJson() {
  const promises = [];
  promises.push(fetchPostsInfo(window.location.pathname));
  promises.push(fetchAuthorInfo(getMetadata('author')));
  promises.push(fetchCategoryInfo(getMetadata('category')));

  let article;
  let author;
  let category;

  await Promise.all(promises).then((results) => {
    [[article], author, category] = results;
  });

  const ldjson = {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
    url: window.location.href,
    headline: article.heading,
    datePublished: new Date(article.published * 1000).toISOString(),
    dateModified: new Date(article.lastModified * 1000).toISOString(),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.famous-smoke.com/cigaradvisor#organization',
      name: 'Cigar Advisor',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.famous-smoke.com/cigaradvisor/styles/images/CALogo_512x512.png',
      },
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://www.famous-smoke.com/cigaradvisor/wp-content/uploads/2019/10/cigar-advisor-asylum-essential-review-guide-cover.jpeg',
    },
    articleSection: category.heading,
    description: article.description,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `https://www.famous-smoke.com${author.path}`,
      description: author.intro,
      image: {
        '@type': 'ImageObject',
        url: author.image,
      },
    },
  };
  addLdJsonScript(document.querySelector('head'), ldjson);
}

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

export default async function decorate(main) {
  decorateExternalLink(main);
  const div = document.createElement('div');
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  let category = getMetadata('category');
  const authorLink = getMetadata('author');
  const publishedDate = getMetadata('publisheddate');
  const articleBlurb = getMetadata('articleblurb');

  if (!category) {
    const match = getCategory(window.location.href);
    if (match) {
      category = match;
    }
  }

  const articleHeaderBlockEl = buildBlock('articleheader', [
    [picture],
    [`<p class="category">${category}</p>`],
    [h1],
    [`<p class="author">${authorLink}</p>`],
    [`<p class="published-date">${publishedDate}</p>`],
    [`<p class="article-blurb">${articleBlurb}</p>`],
  ]);
  div.append(articleHeaderBlockEl);
  main.prepend(div);

  const posts = await loadPosts();
  // 3 posts from the same author and category “most recent by published date”
  const authorPosts = posts.filter((post) => authorLink.includes(post.author) && post.path !== window.location.pathname).slice(0, 2).map((post) => post.path);
  const categoryPosts = posts.filter((post) => category.includes(post.category) && !authorPosts.includes(post) && post.path !== window.location.pathname).slice(0, 3 - authorPosts.length).map((post) => post.path);

  // 1 random post from must-reads page
  const mustReadPosts = (await loadMustReadPosts()).filter((path) => !authorPosts.includes(path) && !categoryPosts.includes(path) && path !== window.location.pathname);
  const randomIndex = Math.floor(Math.random() * mustReadPosts.length);
  const randomMustReadPost = mustReadPosts.slice(randomIndex, randomIndex + 1);

  const articleList = document.createElement('div');
  const ul = document.createElement('ul');
  [...authorPosts, ...categoryPosts, ...randomMustReadPost].forEach((path) => {
    ul.innerHTML += `<li><a href="${path}">${path}</a></li>`;
  });

  articleList.append(ul);
  const articleListBlock = buildBlock('article-list', [['Articles', articleList]]);
  const recommendationsHeading = document.createElement('h3');
  recommendationsHeading.innerHTML = 'You Might Also Like...';

  const articleListSection = document.createElement('div');
  articleListSection.append(recommendationsHeading, articleListBlock);
  main.append(articleListSection);

  const navSection = document.createElement('div');
  navSection.append(buildBlock('article-navigation', []));
  main.append(navSection);
  addLdJson();
}
