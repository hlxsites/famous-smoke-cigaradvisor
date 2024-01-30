import { readBlockConfig, decorateIcons, createOptimizedPicture } from '../../scripts/aem.js';
import { addLdJsonScript } from '../../scripts/linking-data.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const social = block.querySelector('ul');
  const picture = block.querySelector('picture');
  const img = picture.querySelector('img');
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  picture.style.paddingBottom = `${ratio}%`;

  if (social) {
    const links = social.querySelectorAll('a');
    links.forEach((link) => {
      const text = link.textContent;
      link.textContent = '';
      const textToClass = text.trim().toLowerCase().replace(/\s/g, '-');
      link.setAttribute('title', `${config.name} on ${text}`);
      if (textToClass && textToClass !== '') {
        let icon;
        switch (textToClass) {
          case 'twitter':
          case 'x':
          case 'x-twitter':
            icon = 'x-twitter';
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
        link.innerHTML = `<span class="icon icon-${icon}"></span>`;
      }
    });
  }
  block.innerHTML = `
    <div class="author-detail-content">
      <div class="author-image">
        ${picture.outerHTML}
      </div>
      <div class="author-info">
      <div class="author-heading-wrapper">
        <h2 class="author-name">${config.name}</h2>
        <p class="author-title">${config.title || ''}</p>
        </div>
        <div class="author-intro">
          <p>${config.intro}</p>
        </div>
        <div class="social-links">
          ${social ? social.outerHTML : ''}
        </div>
      </div>
    </div>
  `;
  const bg = createOptimizedPicture('https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page/cigaradvisor/images/backgrounds/author.jpg', '', true);
  bg.classList.add('bg-image');
  block.append(bg);
  decorateIcons(block);

  const ldjson = {
    '@context': 'http://schema.org',
    '@type': 'Person',
    name: config.name,
    url: window.location.href,
    description: config.intro,
  };
  addLdJsonScript(document.querySelector('head'), ldjson);
}
