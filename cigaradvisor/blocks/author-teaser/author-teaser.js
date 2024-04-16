import { decorateSeoPicture, fetchAuthorInfo } from '../../scripts/scripts.js';
import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

function checkValue(val) {
  return val && val !== '0' ? val : '';
}

export function buildAuthorTeaser(parentElement, author, isAuthorList = false) {
  // add updated link to all author articles
  const imageWrapper = document.createElement('div');
  imageWrapper.classList.add('image-wrapper');
  const picture = createOptimizedPicture(author.image);
  decorateSeoPicture(picture, author.name);
  imageWrapper.append(picture);
  const img = imageWrapper.querySelector('img');
  img.setAttribute('alt', author.name);

  const authorDetails = document.createElement('div');
  authorDetails.classList.add('author-details');
  const authorHeadingWrapper = document.createElement('div');
  authorHeadingWrapper.classList.add('author-heading-wrapper');
  const authorHeading = document.createElement('div');
  authorHeading.classList.add('author-heading');
  authorHeading.innerHTML = `<h2 class="author-name">${author.name}</h2><h3 class="author-title">${checkValue(author['author-title'])}</h3>`;
  authorHeadingWrapper.append(authorHeading);
  authorDetails.append(authorHeadingWrapper);
  const authorDescription = document.createElement('p');
  authorDescription.append(checkValue(author.intro));
  authorDetails.append(authorDescription);
  const socialLinks = document.createElement('ul');
  if (author.twitter && author.twitter !== '0') {
    const twitterLink = document.createElement('li');
    twitterLink.innerHTML = `<a href="https://twitter.com/${author.twitter}" target="_blank" rel="noopener noreferrer"><span class="icon icon-x-twitter"></span></a>`;
    socialLinks.append(twitterLink);
  }
  if (author.facebook && author.facebook !== '0') {
    const facebookLink = document.createElement('li');
    facebookLink.innerHTML = `<a href="https://facebook.com/${author.facebook}" target="_blank" rel="noopener noreferrer"><span class="icon icon-facebook-f"></span></a>`;
    socialLinks.append(facebookLink);
  }
  if (author.instagram && author.instagram !== '0') {
    const instagramLink = document.createElement('li');
    instagramLink.innerHTML = `<a href="https://instagram.com/${author.instagram}" target="_blank" rel="noopener noreferrer"><span class="icon icon-instagram"></span></a>`;
    socialLinks.append(instagramLink);
  }
  if (author.youtube && author.youtube !== '0') {
    const youtubeLink = document.createElement('li');
    youtubeLink.innerHTML = `<a href="https://youtube.com/${author.youtube}" target="_blank" rel="noopener noreferrer"><span class="icon icon-youtube"></span></a>`;
    socialLinks.append(youtubeLink);
  }
  if (author.pintrest && author.pintrest !== '0') {
    const pintrestLink = document.createElement('li');
    pintrestLink.innerHTML = `<a href="https://pintrest.com/${author.pintrest}" target="_blank" rel="noopener noreferrer"><span class="icon icon-pintrest-p"></span></a>`;
    socialLinks.append(pintrestLink);
  }
  decorateIcons(socialLinks);
  if (isAuthorList) {
    authorHeading.appendChild(socialLinks);
  } else {
    authorDetails.append(socialLinks);
  }
  if (author.name) {
    const link = document.createElement('a');
    link.href = author.path;
    link.textContent = `Show all ${author.name}'s Articles`;
    authorDetails.append(link);
  }
  parentElement.appendChild(imageWrapper);
  parentElement.append(authorDetails);
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const author = await fetchAuthorInfo(path);
  block.innerHTML = '';
  if (author) {
    buildAuthorTeaser(block, author);
  }
}
