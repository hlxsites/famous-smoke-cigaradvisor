import { getMetadata } from '../../scripts/aem.js';
import { decorateSeoPicture } from '../../scripts/scripts.js';

function buildSearch() {
  const search = document.createElement('div');
  search.classList.add('hero-search');
  // noinspection HtmlRequiredAltAttribute
  search.innerHTML = `
    <form action="/cigaradvisor/search" method="get">
      <label class="sr-only" for="main-search-term">Search</label>
      <input type="text" maxlength="255" placeholder="SEARCH" name="s" autocomplete="off" id="main-search-term">
      <button type="submit" value="Submit" title="Submit">
        <span class="icon icon-magnifying-glass">
          <img data-icon-name="magnifying-glass" src="/cigaradvisor/icons/magnifying-glass.svg" loading="lazy">
        </span>
      </button>
    </form>
  `;
  return search;
}

export default async function decorate(block) {
  const style = getMetadata('hero-style');
  if (style) {
    style.split(',').filter((s) => s.trim()).map((s) => s.trim()).forEach((s) => {
      block.classList.add(s.toLowerCase());
    });
  }
  const picture = block.querySelector('picture');

  // Make Image SEO friendly.
  decorateSeoPicture(picture, window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));

  const image = document.createElement('div');
  image.classList.add('hero-image');
  image.replaceChildren(picture);

  const content = document.createElement('div');
  content.classList.add('hero-content');

  const header = block.querySelector('h1');
  if (header) {
    content.append(header);
  }
  if (block.classList.contains('search')) {
    content.append(buildSearch());
  }
  block.replaceChildren(image, content);

  const searchInput = block.querySelector('.hero-search input');
  if (searchInput) {
    searchInput.addEventListener('focus', () => {
      block.querySelector('form').classList.add('search-focused');
    });
    searchInput.addEventListener('blur', () => {
      block.querySelector('form').classList.remove('search-focused');
    });
  }
}
