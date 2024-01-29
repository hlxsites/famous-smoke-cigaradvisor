import { decorateExternalLink } from '../scripts.js';
import { buildBlock, getMetadata } from '../aem.js';

export default async function decorate(main) {
  decorateExternalLink(main);
  const div = document.createElement('div');
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const category = getMetadata('category');
  const authorLink = getMetadata('author');
  const publishedDate = getMetadata('publisheddate');
  const readTime = document.querySelector('meta[name="readingtime"]').content;
  const articleBlurb = getMetadata('articleblurb');

  const articleHeaderBlockEl = buildBlock('articleheader', [
    [picture],
    [`<p class="category">${category}</p>`],
    [h1],
    [`<p class="read-time">${readTime}</p>`],
    [`<p class="author">${authorLink}</p>`],
    [`<p class="published-date">${publishedDate}</p>`],
    [`<p class="article-blurb">${articleBlurb}</p>`],
  ]);
  div.append(articleHeaderBlockEl);
  main.prepend(div);
}
