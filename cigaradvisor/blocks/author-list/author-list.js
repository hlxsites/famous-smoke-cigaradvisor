import { getAllAuthors } from '../../scripts/scripts.js';
import { buildAuthorTeaser } from '../author-teaser/author-teaser.js';
import { readBlockConfig, loadCSS } from '../../scripts/aem.js';
import { generatePagination } from '../../scripts/util.js';

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/author-teaser/author-teaser.css`);
  const configs = readBlockConfig(block);
  const { curatedauthors, limit = 10 } = configs;
  let currentPage = 1;
  block.innerHTML = '';

  const urlParams = new URLSearchParams(window.location.search);
  currentPage = urlParams.get('page') ? parseInt(urlParams.get('page'), 10) : 1;

  let allAuthors = await getAllAuthors(true);

  const curatedAuthorsInfo = [];
  [...allAuthors].forEach((author) => {
    if (curatedauthors.some((curatedAuthor) => curatedAuthor.includes(author.path))) {
      curatedAuthorsInfo.push(author);
      allAuthors.splice(allAuthors.indexOf(author), 1);
    }
  });

  allAuthors = [...curatedAuthorsInfo, ...allAuthors];
  const totalAuthors = allAuthors.length;
  const totalPages = Math.ceil(totalAuthors / limit);
  [...allAuthors].slice((currentPage - 1) * limit, currentPage * limit).map(async (author) => {
    const authorTeaserWrapper = document.createElement('div');
    authorTeaserWrapper.classList.add('author-teaser-wrapper');
    const authorTeaser = document.createElement('div');
    authorTeaser.classList.add('author-teaser');
    authorTeaser.classList.add('block');
    authorTeaserWrapper.append(authorTeaser);
    buildAuthorTeaser(authorTeaser, author, true);
    block.append(authorTeaserWrapper);
  });

  if (totalPages > 1) {
    const pageinationContainer = document.createElement('div');
    pageinationContainer.classList.add('pagination-container');
    pageinationContainer.appendChild(generatePagination(currentPage, totalPages));
    block.append(pageinationContainer);
  }
}
