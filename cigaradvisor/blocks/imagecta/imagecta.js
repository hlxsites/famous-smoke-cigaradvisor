import { isExternal } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const children = [];
  const anchor = document.createElement('a');
  const picture = block.querySelector('picture');
  const img = picture.querySelector('img');
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;
  anchor.style.maxWidth = `${img.width}px`;
  anchor.append(picture);
  const link = block.querySelector('a').getAttribute('href');
  anchor.setAttribute('href', link);
  anchor.setAttribute('target', isExternal(link) ? '_blank' : '_self');
  anchor.setAttribute('title', img.alt);
  children.push(anchor);
  block.replaceChildren(...children);
}
