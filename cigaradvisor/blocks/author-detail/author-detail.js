import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block)
  const social = block.querySelector('ul');
  const picture = block.querySelector('picture');
  block.innerHTML = `
    <div class="author-image">
      ${picture.outerHTML}
    </div>
    <div class="author-info">
      <h2 class="author-name">${config.name}</h2>
      <p class="author-title">${config.title || ''}</p>
      <div class="author-intro">
        <p>${config.intro}</p>
      </div>
      <div class="social-links">
        ${social.outerHTML}
      </div>
    </div>
  `;
}
