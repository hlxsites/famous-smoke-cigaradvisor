import { createOptimizedPicture } from '../../scripts/aem.js';
import { fetchData, getRelativePath } from '../../scripts/scripts.js';

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

export default async function decorate(block) {
  const filterPath = block.querySelector('a').getAttribute('href');
  block.classList.add('article-teaser');
  const articleInfo = await fetchData(getRelativePath(filterPath), '/cigaradvisor/posts/query-index.json');
  if (!articleInfo) {
    return;
  }
  const articleCategoryLink = articleInfo.category;
  const articleCategoryInfo = await fetchData(getRelativePath(articleCategoryLink));
  const [formattedDate, datetimeAttr] = formatDate(articleInfo.published).split('|');
  const articleAuthorLink = articleInfo.author;
  const articleAuthorInfo = await fetchData(getRelativePath(articleAuthorLink), '/cigaradvisor/author/query-index.json');
  block.innerHTML = `
        <article class="article article-thumbnail">
          <a class="article-category" href="${articleCategoryLink}" data-category="${(articleCategoryInfo && articleCategoryInfo.title) ? articleCategoryInfo.title : ''}" title="${(articleCategoryInfo && articleCategoryInfo.title) ? articleCategoryInfo.title : ''}">${(articleCategoryInfo && articleCategoryInfo.title) ? articleCategoryInfo.title : ''}</a>
          <div class="article-image">
          ${createOptimizedPicture(articleInfo.image).outerHTML}
          </div>
          <div class="article-content">
            <articleheader class="article-header">
                <h2 class="article-title">
                <a class="article-title-link" href="${articleInfo.path}" title="${articleInfo.title}">${articleInfo.title}</a>
                  </h2>
                  <div class="article-meta">
                <a class="article-authorLink" href="${articleAuthorLink}" title="By ${(articleAuthorInfo && articleAuthorInfo.name) ? articleAuthorInfo.name : ''}">By ${(articleAuthorInfo && articleAuthorInfo.name) ? articleAuthorInfo.name : ''}</a>
                <time class="article-pubdate" datetime="${datetimeAttr}">${formattedDate}</time>
          </div>
          </articleheader>
          <div class="article-preview">
            <div class="article-excerpt">
                <p><span class="rt-reading-time" style="display: block;"><span class="rt-label rt-prefix">Reading Time: </span> <span class="rt-time">${articleInfo.readingTime}</span></span> ${articleInfo.description}</p>
            </div>
            <a class="article-read-more read-more" href="${articleInfo.path}" title="Read More">Read More</a>
          </div>
          </div>
        </article>
        `;
}
