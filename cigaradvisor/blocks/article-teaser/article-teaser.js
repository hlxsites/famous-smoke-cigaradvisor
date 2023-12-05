import { createOptimizedPicture, readBlockConfig, getMetadata } from '../../scripts/aem.js';

function formatDate(originalDateString) {
  const utcDateString = new Date((originalDateString - 25569) * 86400 * 1000);
  console.log(utcDateString);
  const utcDate = new Date(utcDateString);
  console.log(utcDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = utcDate.getUTCDate();
  const month = months[utcDate.getUTCMonth()];
  const year = utcDate.getUTCFullYear().toString().slice(-2); // Get last two digits of the year
  const formattedDate = `${day} ${month} ${year}`;
  return formattedDate;
}

async function fetchData(url) {
  console.log("URL", url);
  const resp = await fetch(url);
  if (resp.ok) {
    const jsonDataJson = await resp.json();
    console.log(jsonDataJson);
    return jsonDataJson.data;
  }
}

export default async function decorate(block) {
  const filters = readBlockConfig(block);
  let doc;
  block.textContent = '';
  block.classList.add('article-teaser');
  const url = new URL(filters.path);
  const trimmedURL = url.pathname;
  const fetchUrl = `${window.hlx.codeBasePath}/drafts/Kailas/pagemeta.json`;
  const teaserContent = await fetchData(fetchUrl);
  const articleInfo = teaserContent.find(obj => obj.path === trimmedURL);
  const categoryListUrl = `${window.hlx.codeBasePath}/drafts/Kailas/category/category-list.json`;
  const categoryListData = await fetchData(categoryListUrl);
  console.log('categoryListData', categoryListData);
  const articlePath = articleInfo.path;
  fetch(articlePath)
    .then(response => {
      // Check if the request was successful (status code 200)
      if (response.ok) {
        // Convert the response to text
        return response.text();
      }
      throw new Error('Network response was not ok.');
    })
    .then(html => {
      // Create a new HTML document using DOMParser
      const parser = new DOMParser();
      doc = parser.parseFromString(html, 'text/html');


      console.log('doc', doc);
      console.log(doc.head);
      const articleCategory = getMetadata('category', doc);
      console.log('articleCategory', articleCategory);
      const articleCategoryInfo = categoryListData.find(obj => obj.category === articleCategory);
      console.log('articleCategoryInfo', articleCategoryInfo);
      const articleCategoryLink = articleCategoryInfo.categoryLink;
      console.log('articleCategoryLink', articleCategoryLink);
      const formattedDate = formatDate(articleInfo.publishedDate);
      block.innerHTML = `
        <article onclick="" class="article article--thumbnail">
          <a class="article__category tag" href="${articleCategoryLink}" data-category="${articleCategory}" title="${articleCategory}">
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
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch
      console.error('There was a problem with the fetch operation:', error);
    });
}