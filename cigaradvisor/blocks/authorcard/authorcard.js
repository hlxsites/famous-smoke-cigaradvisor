import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';
import { isExternal, fetchData } from '../../scripts/scripts.js';

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
  //  TODO: fetch author details from query-index.xlsx
  const fetchUrl = `${window.hlx.codeBasePath}/drafts/Kailas/pagemeta.json`;
  const authorContent = await fetchData(fetchUrl);
  const authorsObj = [];
  [...authors].forEach((authorPage) => {
    let authorPath;
    try {
      const url = new URL(authorPage);
      authorPath = url.pathname;
    } catch (error) {
      authorPath = authorPage;
    }
    const authorInfo = authorContent.find((obj) => obj.path === authorPath);
    if (authorInfo) {
      const authorDetails = {
        page: authorInfo.path,
        name: authorInfo.authorName,
        image: authorInfo.authorImage,
      };
      authorsObj.push(authorDetails);
    }
  });
  const authorWrapperSection = document.createElement('section');
  authorWrapperSection.classList.add('author-wrapper');
  authorWrapperSection.innerHTML = '';
  [...authorsObj].forEach((author) => {
    authorWrapperSection.innerHTML
      += `<div class="author-content">
    <div class="overlay-image">
    ${createOptimizedPicture(author.image).outerHTML}
    <div class="overlay-content">
    <p class="align-center"><a href="${author.page}">${author.name}</a></p>
    </div>
    </div>
    </div>`;
  });
  rightDiv.replaceChildren(authorWrapperSection);
  block.append(rightDiv);
}
