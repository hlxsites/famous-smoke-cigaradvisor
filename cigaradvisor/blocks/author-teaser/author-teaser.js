import { fetchAuthorInfo } from '../../scripts/scripts.js';
import { decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  block.innerHTML = '';
  const author = await fetchAuthorInfo(path);
  if (author) {
    // add updated link to all author articles
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');
    imageWrapper.append(createOptimizedPicture(author.image));
    const authorDetails = document.createElement('div');
    authorDetails.classList.add('author-details');
    const authorHeadingWrapper = document.createElement('div');
    authorHeadingWrapper.classList.add('author-heading-wrapper');
    const authorHeading = document.createElement('div');
    authorHeading.classList.add('author-heading');
    authorHeading.innerHTML = `<h2 class="author-name">${author.name}</h2><h3 class="author-title">${author.title}</h3>`;
    authorHeadingWrapper.append(authorHeading);
    authorDetails.append(authorHeadingWrapper);
    const authorDescription = document.createElement('p');
    authorDescription.append(author.intro);
    authorDetails.append(authorDescription);
    const socialLinks = document.createElement('ul');
    if (author.twitter) {
      const twitterLink = document.createElement('li');
      twitterLink.innerHTML = `<a href="https://twitter.com/${author.twitter}" target="_blank" rel="noopener noreferrer"><span class="icon icon-x-twitter"></span></a>`;
      socialLinks.append(twitterLink);
    }
    if (author.facebook) {
      const facebookLink = document.createElement('li');
      facebookLink.innerHTML = `<a href="https://facebook.com/${author.facebook}" target="_blank" rel="noopener noreferrer"><span class="icon icon-facebook-f"></span></a>`;
      socialLinks.append(facebookLink);
    }
    if (author.instagram) {
      const instagramLink = document.createElement('li');
      instagramLink.innerHTML = `<a href="https://instagram.com/${author.instagram}" target="_blank" rel="noopener noreferrer"><span class="icon icon-instagram"></span></a>`;
      socialLinks.append(instagramLink);
    }
    if (author.youtube) {
      const youtubeLink = document.createElement('li');
      youtubeLink.innerHTML = `<a href="https://youtube.com/${author.youtube}" target="_blank" rel="noopener noreferrer"><span class="icon icon-youtube"></span></a>`;
      socialLinks.append(youtubeLink);
    }
    if (author.pintrest) {
      const pintrestLink = document.createElement('li');
      pintrestLink.innerHTML = `<a href="https://pintrest.com/${author.pintrest}" target="_blank" rel="noopener noreferrer"><span class="icon icon-pintrest-p"></span></a>`;
      socialLinks.append(pintrestLink);
    }
    decorateIcons(socialLinks);
    authorDetails.append(socialLinks);
    if (author.name) {
      link.textContent = `Show all ${author.name}'s Articles`;
      authorDetails.append(link);
    }
    block.replaceChildren(imageWrapper);
    block.append(authorDetails);
  }
}
