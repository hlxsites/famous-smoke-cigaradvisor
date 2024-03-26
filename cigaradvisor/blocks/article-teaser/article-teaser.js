import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  fetchPostsInfo, fetchAuthorInfo, fetchCategoryInfo, getPostByIdx, decorateSeoPicture,
} from '../../scripts/scripts.js';

// eslint-disable-next-line max-len
export function buildArticleTeaser(parentElement, article) {
  const articleEl = document.createElement('article');
  articleEl.classList.add('article', 'article-thumbnail');
  parentElement.appendChild(articleEl);

  if (Object.keys(article).length === 0) {
    articleEl.classList.add('loading');
    return;
  }

  if (article.category) {
    const categoryAnchor = document.createElement('a');
    categoryAnchor.classList.add('article-category');
    categoryAnchor.href = article.category.path || '';
    if (article.category.heading) {
      categoryAnchor.classList.add(article.category.heading.toLowerCase().replaceAll(/\s+/g, '-'));
      categoryAnchor.title = article.category.heading;
      categoryAnchor.setAttribute('data-category', article.category.heading);
      categoryAnchor.textContent = article.category.heading;
    }
    articleEl.appendChild(categoryAnchor);
  }

  const pictureEl = document.createElement('div');
  pictureEl.classList.add('article-image');
  articleEl.appendChild(pictureEl);
  if (article.image) {
    const picture = createOptimizedPicture(article.image);
    picture.querySelector('img').setAttribute('alt', article.heading.replace(/[^\w\s]/gi, ''));
    decorateSeoPicture(picture, article.path.substring(article.path.lastIndexOf('/') + 1));
    pictureEl.appendChild(picture);
  }

  const content = document.createElement('div');
  content.classList.add('article-content');
  articleEl.appendChild(content);

  const header = document.createElement('articleheader');
  header.classList.add('article-header');
  content.appendChild(header);
  const title = document.createElement('H2');
  header.appendChild(title);
  const titleAnchor = document.createElement('a');
  titleAnchor.href = article.path || '';
  if (article.heading) {
    titleAnchor.title = article.heading;
    titleAnchor.textContent = article.heading;
  }
  title.appendChild(titleAnchor);
  const meta = document.createElement('div');
  meta.classList.add('article-meta');
  header.appendChild(meta);
  const metaAnchor = document.createElement('a');
  metaAnchor.href = article.author?.path;
  if (article.author?.name) {
    metaAnchor.title = `By ${article.author?.name}`;
    metaAnchor.textContent = `By ${article.author?.name}`;
  }
  meta.appendChild(metaAnchor);

  const preview = document.createElement('div');
  preview.classList.add('article-preview');
  content.appendChild(preview);
  const excerpt = document.createElement('div');
  excerpt.classList.add('article-excerpt');
  preview.appendChild(excerpt);
  const excerptParagraph = document.createElement('p');
  excerptParagraph.textContent = article.articleBlurb || '';
  excerpt.appendChild(excerptParagraph);
  const readMoreAnchor = document.createElement('a');
  readMoreAnchor.classList.add('article-read-more', 'read-more');
  readMoreAnchor.href = article.path || '';
  readMoreAnchor.title = 'Read More';
  readMoreAnchor.textContent = 'Read More';
  preview.appendChild(readMoreAnchor);

  const ldJson = {
    '@context': 'http://schema.org',
    '@type': 'BlogPosting',
    name: article.heading,
    mainEntityOfPage: {
      '@type': 'BlogPosting',
      '@id': `https://www.famous-smoke.com${article.path}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cigar Advisor',
      logo: 'https://www.famous-smoke.com/cigaradvisor/styles/images/CALogo_512x512.png',
    },
    headline: article.heading,
    datePublished: new Date(article.published * 1000).toISOString(),
    dateModified: new Date(article.lastModified * 1000).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `https://www.famous-smoke.com${article.author.path}`,
    },
    image: `https://www.famous-smoke.com${article.image}`,
  };
  const ldJsonScript = document.createElement('script');
  ldJsonScript.type = 'application/ld+json';
  ldJsonScript.textContent = JSON.stringify(ldJson);
  articleEl.appendChild(ldJsonScript);
}

export default async function decorate(block) {
  const filterPath = block.querySelector('a')?.getAttribute('href');
  let article;
  if (filterPath) {
    const list = await fetchPostsInfo(filterPath);
    if (list && list.length > 0) {
      [article] = list;
    }
  } else if (block.querySelector(':scope > div > div:nth-of-type(2)').textContent.toLowerCase() === 'next') {
    block.classList.add('next');
    const idx = document.querySelectorAll('main .article-teaser.block.next').length;
    article = await getPostByIdx(idx);

    // Check for a pinned / manually entered teaser
    const existing = document.querySelector(`a[href="${article.path}"]`);
    if (existing && existing.closest('div.block.article-teaser')) {
      existing.closest('div.block.article-teaser').classList.add('next');
      article = await getPostByIdx(idx + 1);
    }
  }
  if (!article) {
    return;
  }
  block.innerHTML = '';
  article.category = await fetchCategoryInfo(article.category);
  article.author = await fetchAuthorInfo(article.author);
  buildArticleTeaser(block, article);
}
