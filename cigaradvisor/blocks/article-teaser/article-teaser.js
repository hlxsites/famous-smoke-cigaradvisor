import { createOptimizedPicture } from '../../scripts/aem.js';

function formatDate(originalDateString) {
  const utcDateString = new Date((originalDateString - 25569) * 86400 * 1000);
  const utcDate = new Date(utcDateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = utcDate.getUTCDate();
  const month = months[utcDate.getUTCMonth()];
  const year = utcDate.getUTCFullYear().toString().slice(-2); // Get last two digits of the year
  const formattedDate = `${day} ${month} ${year}`;
  const dateTimeAttribute = `${utcDate.getUTCFullYear()}-${String(utcDate.getUTCMonth() + 1).padStart(2, '0')}-${String(utcDate.getUTCDate()).padStart(2, '0')}`;
  return `${formattedDate}|${dateTimeAttribute}`;
}

async function fetchData(url) {
  const resp = await fetch(url);
  let jsonDataJson = '';
  if (resp.ok) {
    jsonDataJson = await resp.json();
  }
  return jsonDataJson.data;
}

export default async function decorate(block) {
  const filterPath = block.querySelector('a').getAttribute('href');
  block.textContent = '';
  block.classList.add('article-teaser');
  const fetchUrl = `${window.hlx.codeBasePath}/drafts/Kailas/pagemeta.json`;
  const teaserContent = await fetchData(fetchUrl);
  const articleInfo = teaserContent.find((obj) => obj.path === filterPath);
  const categoryListUrl = `${window.hlx.codeBasePath}/drafts/Kailas/category/category-list.json`;
  const categoryListData = await fetchData(categoryListUrl);
  const articleCategory = articleInfo.category;
  const articleCategoryInfo = categoryListData.find((obj) => obj.category === articleCategory);
  const articleCategoryLink = articleCategoryInfo.categoryLink;
  const formattedDate = formatDate(articleInfo.publishedDate).split('|')[0];
  const datetimeAttr = formatDate(articleInfo.publishedDate).split('|')[1];
  const authorNameHyphenSeparated = articleInfo.author.split(' ').join('-');
  const authorLink = `${window.hlx.codeBasePath}/author/drafts/${authorNameHyphenSeparated.toLowerCase()}`;
  block.innerHTML = `
        <article onclick="" class="article article-thumbnail">
          <a class="article-category" href="${articleCategoryLink}" data-category="${articleCategory}" title="${articleCategory}">
          Cigar Buying Guides </a>
          <div class="article-image">
          ${createOptimizedPicture(articleInfo.image).outerHTML}
          </div>
          <div class="article-content">
            <articleheader class="article-header">
                <h2 class="article-title">
                <a class="article-title-link" href="${articleInfo.path}" title="${articleInfo.title}">${articleInfo.title}</a>
                  </h2>
                  <div class="article-meta">
                <a class="article-authorLink" href="${authorLink}" title="By ${articleInfo.author}">By ${articleInfo.author}</a>
                <time class="article-pubdate" datetime="${datetimeAttr}">${formattedDate}</time>
          </div>
          </articleheader>
          <div class="article-preview">
            <div class="article-excerpt">
                <p><span class="rt-reading-time" style="display: block;"><span class="rt-label rt-prefix">Reading Time: </span> <span class="rt-time">${articleInfo.readingTime}</span></span> ${articleInfo.articleBlurb}</p>
            </div>
            <a class="article-read-more read-more" href="${articleInfo.path}" title="Read More">Read More</a>
          </div>
          </div>
        </article>
        `;
}
