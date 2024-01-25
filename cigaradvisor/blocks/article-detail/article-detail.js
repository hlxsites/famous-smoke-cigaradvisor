import { decorateMain, fetchPostsInfo } from '../../scripts/scripts.js';
import { buildBlock, getMetadata, loadBlocks, waitForLCP } from '../../scripts/aem.js';

// Replace template head
function replaceHead(head) {
  const currHead = document.querySelector('head ');
  currHead.querySelector('title').replaceWith(head.querySelector('title'));
  head.querySelectorAll('meta').forEach((meta) => {
    const found = currHead.querySelector(`meta[property="${meta.getAttribute('property')}"]`);
    let content = meta.getAttribute('content');
    content = content.replace(/\/articles\/\d+\/\d+/, '/posts');
    meta.setAttribute('content', content);
    if (found) {
      found.setAttribute('content', content);
    } else {
      currHead.append(meta);
    }
  });
}

function autoBlockHero(main) {
  const picture = main.querySelector('picture');
  picture.querySelector('img').setAttribute('loading', 'eager');
  let section = picture.parentElement;
  const hero = buildBlock('article-hero', [
    [picture],
    [`<p class="category">${getMetadata('category')}</p>`],
    [main.querySelector('h1')],
    [`<p class="read-time">${getMetadata('readingtime')}</p>`],
    [`<p class="author">${getMetadata('author')}</p>`],
  ]);
  if (section.children.length !== 0) {
    section = document.createElement('div');
  }
  section.append(hero);
  main.prepend(section);
}

function autoWrapPictures(main) {
  main.querySelectorAll(':scope p > picture').forEach((picture) => {
    const alt = picture.querySelector('img').alt;
    const anchor = picture.parentElement.querySelector('a');
    if (anchor) {
      anchor.replaceChildren(picture)
      anchor.title = alt;
      anchor.closest('p').classList.add('article-image-wrapper');
    }
  })
}

export default async function decorate(block) {
  block.innerHTML = '';
  let url;
  const found = await fetchPostsInfo(window.location.pathname, 'path');
  if (!found || found.length === 0) {
    url = `/cigaradvisor/posts/1970/1${window.location.pathname.substring(window.location.pathname.lastIndexOf('/'))}`;
  } else {
    url = found[0].raw_path;
  }

  const resp = await fetch(url);
  if (!resp) {
    return;
  }
  const data = await resp.text()
  const html = new window.DOMParser().parseFromString(data, 'text/html');
  replaceHead(html.querySelector('head'));
  const main = html.querySelector('main');
  autoBlockHero(main);
  autoWrapPictures(main);
  await decorateMain(main);
  await loadBlocks(main);
  block.replaceChildren(...main.querySelectorAll(':scope > *'));
  await waitForLCP(['article-hero']);
}
