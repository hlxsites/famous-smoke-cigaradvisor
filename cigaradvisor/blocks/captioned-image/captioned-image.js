import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('content-wrapper');

  const picture = block.querySelector('picture');
  const link = block.querySelector(':scope > div:first-of-type a');
  link.replaceChildren(picture);

  const img = picture.querySelector('img');
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;
  wrapper.style.maxWidth = `${img.width}px`;

  let div = document.createElement('div');
  div.classList.add('image');
  div.append(link);

  wrapper.append(div);

  const caption = block.querySelector(':scope > div:nth-of-type(2) > div:nth-of-type(2)');
  let p = caption.querySelector('p');
  if (!p) {
     p = document.createElement('p');
     p.innerHTML = caption.innerHTML;
  }
  p.classList.add('caption');
  wrapper.append(p);

  block.replaceChildren(wrapper);
}
