import {
  a, div, h1, section,
} from '../../scripts/dom-helpers.js';
import { fetchCategoryInfo, fetchAuthorInfo } from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  const picture = block.querySelector('picture');

  const category = await fetchCategoryInfo(config.category);
  const author = await fetchAuthorInfo(config.author);
  const sect = section(
    {},
    div({ class: 'image-wrapper' }, picture),
    div(
      { class: 'article-info' },
      div({ class: 'article-category' }, a({ href: config.category }, category.heading)),
      h1(config.heading),
      div({ class: 'article-author' }, a({ href: config.author }, author.name)),
    ),
  );
  block.replaceChildren(sect);
}
