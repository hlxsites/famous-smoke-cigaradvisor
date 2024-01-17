import { getMetadata } from '../../scripts/aem.js';

function buildSearch() {
  const search = document.createElement('div');
  search.classList.add('hero-search');
  search.innerHTML = `
    <form action="/cigaradvisor/" method="get">
      <label class="sr-only" for="main-search-term">Search</label>
      <input type="text" maxlength="255" placeholder="SEARCH" autocomplete="off" value="">
      <button type="submit" value="Submit" title="Submit"></button>
    </form>
  `;
  return search;
}

export default async function decorate(block) {
  block.classList.add('under-nav');
  const style = getMetadata('hero-style');
  if (style) {
    block.classList.add(style.toLowerCase());
  }

  const header = block.querySelector('h1');
  const image = document.createElement('div');
  image.classList.add('hero-image');
  image.replaceChildren(block.querySelector('picture'));
  const content = document.createElement('div');
  content.classList.add('hero-content');
  if (document.querySelector('body.homepage')) {
    content.append(header, buildSearch());
  } else {
    content.append(header);
  }
  block.replaceChildren(image, content);
}
