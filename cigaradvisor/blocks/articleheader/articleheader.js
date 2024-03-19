import { fetchCategoryInfo, fetchAuthorInfo, decorateSeoPicture } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const section = document.createElement('section');
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image-wrapper');
  const picture = block.querySelector('picture');
  decorateSeoPicture(picture, window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
  imageWrapper.append(picture);
  const articleInfo = document.createElement('div');
  articleInfo.classList.add('article-info');
  const categoryLink = block.querySelector('p.category').innerText;
  const category = await fetchCategoryInfo(categoryLink);
  if (category) {
    const categoryLinkEl = document.createElement('div');
    categoryLinkEl.classList.add('article-category');
    categoryLinkEl.innerHTML = `<a href="${categoryLink}">${category.heading}</a>`;
    articleInfo.append(categoryLinkEl);
  }
  articleInfo.append(block.querySelector('h1'));
  const authorLink = block.querySelector('p.author').innerText;
  const author = await fetchAuthorInfo(authorLink);
  const authorLinkEl = document.createElement('div');
  authorLinkEl.classList.add('article-author');
  if (author) {
    authorLinkEl.innerHTML = `<a href="${authorLink}">By ${author.name}</a>`;
    articleInfo.append(authorLinkEl);
  }
  articleInfo.append(authorLinkEl);
  section.append(imageWrapper);
  section.append(articleInfo);
  block.replaceChildren(section);
}
