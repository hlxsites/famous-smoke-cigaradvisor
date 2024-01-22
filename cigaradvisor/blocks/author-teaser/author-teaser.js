import { decorateExternalLink } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/aem.js';

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  block.innerHTML = '';
  const author = await loadAuthor(path);
  decorateExternalLink(author);
  if (author) {
    // add updated link to all author articles
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');
    const picture = author.querySelector('picture');
    imageWrapper.append(picture);
    const authorName = author.querySelector('h2').innerHTML;
    const authorDetails = document.createElement('div');
    authorDetails.classList.add('author-details');
    const authorHeadingWrapper = document.createElement('div');
    authorHeadingWrapper.classList.add('author-heading-wrapper');
    const authorHeading = document.createElement('div');
    authorHeading.classList.add('author-heading');
    if (author.querySelector('h2')) {
      authorHeading.append(author.querySelector('h2'));
    }
    if (author.querySelector('h3')) {
      authorHeading.append(author.querySelector('h3'));
    }
    authorHeadingWrapper.append(authorHeading);
    authorDetails.append(authorHeadingWrapper);
    const authorP = author.querySelectorAll('p');
    const authorPCount = authorP.length;
    const authorPIndex = authorPCount - 1;
    const authorPContent = authorP[authorPIndex];
    if (authorPContent) {
      authorDetails.append(authorPContent);
    }
    const socialLinks = author.querySelector('ul');
    if (socialLinks) {
      const socialItems = socialLinks.querySelectorAll('li > a');
      socialItems.forEach((item) => {
        const innerText = item.innerText.trim();
        if (innerText && innerText !== '') {
          let icon;
          switch (innerText) {
            case 'twitter':
              icon = 'twitter';
              break;
            case 'facebook':
              icon = 'facebook-f';
              break;
            case 'instagram':
              icon = 'instagram';
              break;
            case 'youtube':
              icon = 'youtube';
              break;
            case 'pintrest':
              icon = 'pintrest-p';
              break;
            default:
              icon = 'unknown';
          }
          item.innerHTML = `<span class="icon icon-${icon}"></span>`;
        }
      });

      decorateIcons(socialLinks);
      authorDetails.append(socialLinks);
    } else {
      const emptySocialLinks = document.createElement('ul');
      authorDetails.append(emptySocialLinks);
    }
    if (authorName) {
      link.textContent = `Show all ${authorName}'s Articles`;
      authorDetails.append(link);
    }
    author.replaceChildren(imageWrapper);
    author.append(authorDetails);
    block.append(author);
  }
}
