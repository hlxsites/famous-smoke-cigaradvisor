import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const wrapper = document.createElement('div');
  wrapper.classList.add('content-wrapper');

  // Get the picture ready
  const picture = block.querySelector('picture');
  const img = picture.querySelector('img');
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;
  wrapper.style.maxWidth = `${img.width}px`;

  const div = document.createElement('div');
  div.classList.add('image');

  // Does the image link?
  const keys = Object.keys(config);
  if (config.link) {
    const idx = keys.indexOf('link');
    const a = block.querySelector(`:scope > div:nth-of-type(${idx + 1}) > div:nth-of-type(2) a`);
    a.textContent = '';
    a.append(picture);
    div.append(a);
  } else {
    div.append(picture);
  }
  wrapper.append(div);

  const idx = keys.indexOf('caption');
  const caption = block.querySelector(`:scope > div:nth-of-type(${idx + 1}) > div:nth-of-type(2)`);
  let p = caption.querySelector('p');
  if (!p) {
    p = document.createElement('p');
    p.innerHTML = caption.innerHTML;
  }
  p.classList.add('caption');
  wrapper.append(p);

  block.replaceChildren(wrapper);
}
