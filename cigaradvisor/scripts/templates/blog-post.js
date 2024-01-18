import { decorateExternalLink } from '../scripts.js';
import { buildBlock, getMetadata } from '../aem.js';

export default async function decorate(main) {
  // eslint-disable-next-line no-use-before-define
  decorateExternalLink(main);
  const paragraphs = main.querySelectorAll('p');
  paragraphs.forEach((paragraph) => {
    if (paragraph.querySelector('picture') !== null) {
      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('article-image-wrapper');
      if (paragraph.querySelector('a') !== null) {
        const a = paragraph.querySelector('a');
        a.replaceChildren(paragraph.querySelector('picture'));
        imageWrapper.append(a);
      } else {
        imageWrapper.append(paragraph.querySelector('picture'));
      }
      const nextSibling = paragraph.nextElementSibling;
      if (nextSibling && nextSibling.tagName === 'P' && nextSibling.querySelector('em')) {
        nextSibling.classList.add('article-image-caption');
        imageWrapper.append(nextSibling);
      }
      paragraph.replaceChildren(imageWrapper);
    }
  });
  const h3 = main.querySelectorAll('h3');
  h3.forEach((heading) => {
    const p = document.createElement('p');
    p.innerHTML = '&nbsp;';
    heading.prepend(p);
  });
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
