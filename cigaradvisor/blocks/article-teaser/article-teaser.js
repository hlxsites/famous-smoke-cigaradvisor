import { createOptimizedPicture, readBlockConfig, buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';


export default async function decorate(block) {
  const filters = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('article-teaser');
  console.log(filters.path);
  const article = await fetchTeaserContent(filters);
  const articleInfo = article[0];
  console.log(articleInfo.publishedDate);
  const formattedDate = formatDate(articleInfo.publishedDate);
  console.log(formattedDate);
  block.innerHTML = `
  <article onclick="" class="article article--thumbnail">
    <a class="article__category tag" href="https://www.famous-smoke.com/cigaradvisor/category/buying-guides" data-category="Cigar Buying Guides" title="Cigar Buying Guides">
    Cigar Buying Guides </a>
    <div class="article__image">
    ${createOptimizedPicture(articleInfo.image).outerHTML}
    </div>
    <div class="article__content">
      <articleheader class="article__header">
          <h2 class="article__title">
          <a class="article__titleLink article__link" href="${articleInfo.path}" title="${articleInfo.title}">${articleInfo.title}</a>
            </h2>
            <div class="article__meta">
          <a class="article__authorLink" href="${articleInfo.authorLink}" title="By ${articleInfo.author}">By ${articleInfo.author}</a>
          <time class="article__pubdate" datetime="2023-11-10">${formattedDate}</time>
    </div>
    </articleheader>
    <div class="article__preview">
      <div class="article__excerpt">
          <p><span class="rt-reading-time" style="display: block;"><span class="rt-label rt-prefix">Reading Time: </span> <span class="rt-time">${articleInfo.readingTime}</span></span> ${articleInfo.description}</p>
      </div>
      <a class="article__readMore article__link read_more" href="${articleInfo.path}" title="Read More">Read More</a>
    </div>
    </div>
  </article>
  `;
}

async function fetchTeaserContent(filters) {
  return ffetch(`${window.hlx.codeBasePath}/drafts/Kailas/pagemeta.json`)
    .filter((article) => Object.keys(filters).every(
      (path) => article[path].toLowerCase() === filters.path.toLowerCase(),
    ))
    .map(async (article) => {
      return article;
    })
    .all();
}

function formatDate(originalDateString) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const excelStartDate = new Date(Date.UTC(1899, 11, 30));
  const millisecondsSinceExcelStart = originalDateString * MS_PER_DAY;

  const targetDate = new Date(excelStartDate.getTime() + millisecondsSinceExcelStart);

  const day = targetDate.getUTCDate();
  const month = targetDate.toLocaleString('default', { month: 'short' });
  const year = targetDate.getUTCFullYear().toString().slice(-2);

  return `${day} ${month} ${year}`;
}