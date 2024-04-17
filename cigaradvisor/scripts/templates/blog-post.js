/* eslint-disable max-len */
import { div } from '../dom-helpers.js';
import { decorateExternalLink, decorateSeoPicture } from '../scripts.js';
import { buildBlock, getMetadata } from '../aem.js';
import { getCategory } from '../util.js';

export default async function decorate(main) {
  main.querySelector('div').prepend(buildBlock('article-ldjson', []));
  // Build Article Header AutoBlock
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  const category = getCategory(window.location.href) || '';
  const authorLink = getMetadata('author');
  const publishedDate = getMetadata('publisheddate');
  const articleBlurb = getMetadata('articleblurb');
  const pictureP = picture.parentElement;
  decorateSeoPicture(picture, window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));

  const articleHeaderBlockEl = buildBlock('articleheader', [
    ['Heading', h1],
    ['Image', picture],
    ['Category', category],
    ['Author', authorLink],
    ['Published', publishedDate],
    ['Blurb', articleBlurb],
  ]);
  main.prepend(div(articleHeaderBlockEl));

  if (pictureP.children.length === 0) pictureP.remove();

  if (!main.querySelector('div.author-teaser')) {
    main.append(div(buildBlock('author-teaser', [[authorLink]])));
  }

  main.append(div(buildBlock('dynamic-article-list', [
    ['Category', category],
    ['Author', authorLink],
  ])));

  // Build article Nav Section
  main.append(div(buildBlock('article-navigation', [])));

  decorateExternalLink(main);
}
