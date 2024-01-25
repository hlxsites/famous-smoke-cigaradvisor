import { isExternal } from '../../scripts/scripts.js';

function createRandom(availableRows) {
  const randomRow = availableRows[Math.floor(Math.random() * availableRows.length)];

  // retrieve CTA data
  const picture = randomRow.querySelector('div:nth-of-type(1) > picture');
  const oldAnchor = randomRow.querySelector('div:nth-of-type(2) > a');
  if (!picture && !oldAnchor) {
    return 'Malformed Image CTA';
  }

  const anchor = document.createElement('a');

  // add image and CLS placeholder
  const img = picture.querySelector('img');
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;
  anchor.style.maxWidth = `${img.width}px`;
  anchor.append(picture);

  // populate anchor
  const href = oldAnchor.getAttribute('href');
  anchor.setAttribute('href', href);
  anchor.setAttribute('target', isExternal(href) ? '_blank' : '_self');
  anchor.setAttribute('title', img.alt);

  return anchor;
}

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  block.replaceChildren(createRandom(rows));
}
