import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  fetchPostsInfo, fetchAuthorInfo, fetchCategoryInfo, getPostByIdx, decorateSeoPicture,
} from '../../scripts/scripts.js';

// eslint-disable-next-line max-len
export function buildArticleTeaser(parentElement, article) {
  const ldjson = {
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

  const picture = createOptimizedPicture(article.image);
  decorateSeoPicture(picture, article.path.substring(article.path.lastIndexOf('/') + 1));

  const category = (article.category && article.category.heading) ? article.category.heading : '';
  parentElement.innerHTML += `
    <article class="article article-thumbnail">
      <a class="article-category ${category.toLowerCase().replaceAll(/\s+/g, '-')}" href="${article.category ? article.category.path : ''}" data-category="${category}" title="${category}">${category}</a>
      <div class="article-image">
        ${picture.outerHTML}
      </div>
      <div class="article-content">
        <articleheader class="article-header">
            <h2 class="article-title">
              <a class="article-title-link" href="${article.path}" title="${article.heading}">${article.heading}</a>
            </h2>
            <div class="article-meta">
              <a class="article-authorLink" href="${article.author ? article.author.path : ''}" title="By ${(article.author && article.author.name) ? article.author.name : ''}">By ${(article.author && article.author.name) ? article.author.name : ''}</a>
            </div>
        </articleheader>
        <div class="article-preview">
          <div class="article-excerpt">
            <p>${article.articleBlurb}</p>
          </div>
          <a class="article-read-more read-more" href="${article.path}" title="Read More">Read More</a>
        </div>
      </div>
      <script type="application/ld+json">${JSON.stringify(ldjson)}</script>
    </article>
  `;
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
