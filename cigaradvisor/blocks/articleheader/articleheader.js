import { fetchData } from '../../scripts/scripts.js';

function getRelativePath(path) {
  let relPath = path;
  try {
    const url = new URL(path);
    relPath = url.pathname;
  } catch (error) {
    // do nothing
  }
  return relPath;
}

export default async function decorate(block) {
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image-wrapper');
  const picture = block.querySelector('picture');
  imageWrapper.append(picture);
  const articleInfo = document.createElement('div');
  articleInfo.classList.add('article-info');
  const categoryLink = block.querySelector('p.category').innerText;
  const category = await fetchData(getRelativePath(categoryLink));
  const categoryLinkEl = document.createElement('div');
  categoryLinkEl.classList.add('article-category');
  categoryLinkEl.innerHTML = `<a href="${categoryLink}">${category.title}</a>`;
  articleInfo.append(categoryLinkEl);
  articleInfo.append(block.querySelector('h1'));
  const authorLink = block.querySelector('p.author').innerText;
  const author = await fetchData(getRelativePath(authorLink));
  const authorLinkEl = document.createElement('div');
  authorLinkEl.classList.add('article-author');
  authorLinkEl.innerHTML = `<a href="${authorLink}">By ${author.title}</a>`;
  articleInfo.append(authorLinkEl);
  const publishedDate = block.querySelector('p.published-date').innerText;
  const publishedDateEl = document.createElement('span');
  publishedDateEl.classList.add('article-published-date');
  publishedDateEl.innerText = publishedDate;
  authorLinkEl.append(publishedDateEl);
  articleInfo.append(authorLinkEl);
  const readTime = block.querySelector('p.read-time') ? block.querySelector('p.read-time').innerText : '';
  const readTimeEl = document.createElement('span');
  readTimeEl.classList.add('article-read-time');
  readTimeEl.innerHTML = `<span class="rt-label rt-prefix">Reading Time: </span> <span class="rt-time">${readTime}</span>`;
  articleInfo.append(readTimeEl);
  block.replaceChildren(imageWrapper);
  block.append(articleInfo);
}
