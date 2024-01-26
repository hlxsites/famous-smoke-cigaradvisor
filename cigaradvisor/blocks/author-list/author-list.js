import { getAllAuthors } from '../../scripts/scripts.js';
import { buildAuthorTeaser } from '../author-teaser/author-teaser.js';
import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { generatePagination } from '../../scripts/util.js';

let pageSize;

async function renderList(wrapper, curatedAuthors) {
  let currentPage = 1;
  const match = window.location.hash.match(/page=(\d+)/);
  if (match) {
    currentPage = Number.isNaN(parseInt(match[1], 10)) ? currentPage : parseInt(match[1], 10);
  }

  let allAuthors = [...(await getAllAuthors(true))];

  const curatedAuthorsInfo = [];
  [...allAuthors].forEach((author) => {
    if (curatedAuthors.some((curatedAuthor) => curatedAuthor.includes(author.path))) {
      curatedAuthorsInfo.push(author);
      allAuthors.splice(allAuthors.indexOf(author), 1);
    }
  });

  allAuthors = [...curatedAuthorsInfo, ...allAuthors];
  const totalAuthors = allAuthors.length;
  const totalPages = Math.ceil(totalAuthors / pageSize);

  const list = document.createElement('div');
  list.classList.add('author-teaser-list');

  [...allAuthors].slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map(async (author) => {
      const authorTeaser = document.createElement('div');
      authorTeaser.classList.add('author-teaser');
      authorTeaser.classList.add('block');
      buildAuthorTeaser(authorTeaser, author, true);
      list.append(authorTeaser);
    });

  wrapper.replaceChildren(list);

  if (totalPages > 1) {
    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');
    paginationContainer.appendChild(generatePagination(currentPage, totalPages));
    wrapper.append(paginationContainer);
  }
}

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/author-teaser/author-teaser.css`);
  const configs = readBlockConfig(block);
  const { curatedauthors } = configs;
  pageSize = Number.isNaN(parseInt(configs.limit, 10)) ? 10 : parseInt(configs.limit, 10);

  const authorTeaserWrapper = document.createElement('div');
  authorTeaserWrapper.classList.add('author-teaser-wrapper');
  block.replaceChildren(authorTeaserWrapper);
  await renderList(authorTeaserWrapper, curatedauthors);

  window.addEventListener('hashchange', async () => {
    await renderList(authorTeaserWrapper, curatedauthors);
  });
}
