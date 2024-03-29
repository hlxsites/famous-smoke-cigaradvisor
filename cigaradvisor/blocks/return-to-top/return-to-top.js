import {
  buildBlock, createOptimizedPicture, decorateBlock, decorateIcons, loadBlock,
} from '../../scripts/aem.js';
import { scrollTop } from '../../scripts/util.js';

function onScroll() {
  const link = document.getElementById('return-to-top');
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    link.classList.remove('hidden');
  } else {
    link.classList.add('hidden');
  }
}

export default function decorate(block) {
  const link = document.createElement('a');
  link.id = 'return-to-top';
  link.classList.add('hidden');
  link.onclick = scrollTop;
  block.replaceChildren(link);

  // Desktop
  const picture = createOptimizedPicture('/cigaradvisor/blocks/return-to-top/return-to-top.webp');
  link.appendChild(picture);

  // Mobile
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('icon-container');
  const icon = document.createElement('span');
  icon.classList.add('icon', 'icon-angle-up');
  iconContainer.appendChild(icon);
  decorateIcons(iconContainer);
  iconContainer.querySelector('span.icon > img[data-icon-name="angle-up"]').alt = 'Return to the top of the page';
  link.appendChild(iconContainer);

  window.onscroll = onScroll;
}

export async function loadReturnToTop(main) {
  const container = document.createElement('aside');
  main.insertAdjacentElement('afterend', container);
  const block = buildBlock('return-to-top', '');
  container.append(block);
  decorateBlock(block);
  return loadBlock(block);
}
