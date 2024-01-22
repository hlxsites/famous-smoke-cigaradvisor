import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

function onScroll() {
  const link = document.getElementById('return-to-top');
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    link.classList.remove('hidden');
  } else {
    link.classList.add('hidden');
  }
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export default function decorate(block) {
  const link = document.createElement('a');
  link.id = 'return-to-top';
  link.classList.add('hidden');
  link.onclick = scrollTop;
  block.appendChild(link);

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
  link.appendChild(iconContainer);

  window.onscroll = onScroll;
}
