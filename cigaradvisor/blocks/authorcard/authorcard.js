import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { isExternal, fetchData, getRelativePath } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const configs = readBlockConfig(block);
  const { title } = configs;
  const buttonLabel = configs['button-label'];
  const buttonLink = configs['button-link'];
  const { authors } = configs;
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left-column');
  const authorLeftContentWrapper = document.createElement('div');
  authorLeftContentWrapper.classList.add('author-left-content-wrapper');
  title.forEach((titleLine) => {
    const h2Tag = document.createElement('h2');
    h2Tag.innerHTML = titleLine;
    authorLeftContentWrapper.append(h2Tag);
  });
  const anchorWrapper = document.createElement('p');
  const buttonAnchor = document.createElement('a');
  buttonAnchor.innerHTML = buttonLabel;
  buttonAnchor.setAttribute('href', buttonLink);
  buttonAnchor.setAttribute('target', isExternal(buttonLink) ? '_blank' : '_self');
  buttonAnchor.setAttribute('title', buttonLabel);
  buttonAnchor.classList.add('button');
  anchorWrapper.append(buttonAnchor);
  authorLeftContentWrapper.append(anchorWrapper);
  leftDiv.append(authorLeftContentWrapper);
  block.replaceChildren(leftDiv);

  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right-column');
  const authorWrapperSection = document.createElement('section');
  authorWrapperSection.classList.add('author-wrapper');
  authorWrapperSection.innerHTML = '';
  const authorPromises = [...authors].map(async (authorPage) => {
    const authorInfo = await fetchData(getRelativePath(authorPage), '/cigaradvisor/author/query-index.json');
    if (authorInfo) {
      return `<div class="author-content">
        <div class="overlay-image">
          ${createOptimizedPicture(authorInfo.image).outerHTML}
          <div class="overlay-content">
            <p class="align-center"><a href="${authorInfo.page}">${authorInfo.name}</a></p>
          </div>
        </div>
      </div>`;
    }
    return ''; // return an empty string if there's no authorInfo
  });

  Promise.all(authorPromises)
    .then((authorContents) => {
      authorWrapperSection.innerHTML += authorContents.join('');
    })
    .catch((error) => {
      console.error('Error fetching author info:', error);
    });
  rightDiv.replaceChildren(authorWrapperSection);
  block.append(rightDiv);
}
