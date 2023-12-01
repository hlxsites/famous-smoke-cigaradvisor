import { createOptimizedPicture, readBlockConfig, buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';


export default async function decorate(block) {
  const filters = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('article-teaser');
  console.log(filters.path);
  const article = await fetchTeaserContent(filters);
  const articleInfo = article[0];
  block.innerHTML = `
  <article onclick="" class="article article__thumbnail">
<a class="article__category tag" href="https://www.famous-smoke.com/cigaradvisor/category/buying-guides" data-category="Cigar Buying Guides" title="Cigar Buying Guides">
Cigar Buying Guides </a>
${createOptimizedPicture(articleInfo.image).outerHTML}
<div class="article__content">
   <header class="article__header">
      <h2 class="article__title">
      <a class="article__titleLink article__link" href="${articleInfo.path}" title="${articleInfo.title}">${articleInfo.title}</a>
         </h2>
         <div class="article__meta">
      <a class="article__authorLink" href="${articleInfo.authorLink}" title="By ${articleInfo.author}">By ${articleInfo.author}</a>
      <time class="article__pubdate" datetime="2023-11-10">10 Nov 23</time>
</div>
</header>
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