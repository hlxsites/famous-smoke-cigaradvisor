import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  fetchPostsInfo, fetchAuthorInfo, fetchCategoryInfo, getPostByIdx,
} from '../../scripts/scripts.js';

function formatDate(originalDateString) {
  const utcDateString = new Date(originalDateString * 1000);
  const utcDate = new Date(utcDateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = utcDate.getUTCDate();
  const month = months[utcDate.getUTCMonth()];
  const year = utcDate.getUTCFullYear().toString().slice(-2); // Get last two digits of the year
  const formattedDate = `${day} ${month} ${year}`;
  const dateTimeAttribute = `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`;
  return `${formattedDate}|${dateTimeAttribute}`;
}

// eslint-disable-next-line max-len
export function buildArticleTeaser(parentElement, article) {
  const [formattedDate, datetimeAttr] = formatDate(article.published).split('|');
  const category = (article.category && article.category.heading) ? article.category.heading : '';
  parentElement.innerHTML += `
        <article class="article article-thumbnail">
          <a class="article-category ${category.toLowerCase().replaceAll(/\s+/g, '-')}" href="${article.category ? article.category.path : ''}" data-category="${category}" title="${category}">${category}</a>
          <div class="article-image">
            ${createOptimizedPicture(article.image).outerHTML}
          </div>
          <div class="article-content">
            <articleheader class="article-header">
                <h2 class="article-title">
                  <a class="article-title-link" href="${article.path}" title="${article.heading}">${article.heading}</a>
                </h2>
                <div class="article-meta">
                  <a class="article-authorLink" href="${article.author ? article.author.path : ''}" title="By ${(article.author && article.author.name) ? article.author.name : ''}">By ${(article.author && article.author.name) ? article.author.name : ''}</a>
                  <time class="article-pubdate" datetime="${datetimeAttr}">${formattedDate}</time>
                </div>
            </articleheader>
            <div class="article-preview">
              <div class="article-excerpt">
                <p><span class="rt-reading-time" style="display: block;"><span class="rt-label rt-prefix">Reading Time: </span> <span class="rt-time">${article.readingTime}</span></span> ${article.articleBlurb}</p>
              </div>
              <a class="article-read-more read-more" href="${article.path}" title="Read More">Read More</a>
            </div>
          </div>
        </article>
        `;
}

export default async function decorate(block) {
  const filterPath = block.querySelector('a')?.getAttribute('href');
  let article;
  if (filterPath) {
    article = await fetchPostsInfo(filterPath);
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
