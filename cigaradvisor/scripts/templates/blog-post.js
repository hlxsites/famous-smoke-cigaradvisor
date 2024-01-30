import {
  decorateExternalLink, fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo,
} from '../scripts.js';
import { buildBlock, getMetadata } from '../aem.js';
import { addLdJsonScript } from '../linking-data.js';

async function addLdJson() {
  const promises = [];
  promises.push(fetchPostsInfo(window.location.pathname));
  promises.push(fetchAuthorInfo(getMetadata('author')));
  promises.push(fetchCategoryInfo(getMetadata('category')));

  let article;
  let author;
  let category;

  await Promise.all(promises).then((results) => {
    [[article], author, category] = results;
  });

  const ldjson = {
    '@context': 'https://schema.org/',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
    url: window.location.href,
    headline: article.heading,
    datePublished: new Date(article.published * 1000).toISOString(),
    dateModified: new Date(article.lastModified * 1000).toISOString(),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.famous-smoke.com/cigaradvisor#organization',
      name: 'Cigar Advisor',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.famous-smoke.com/cigaradvisor/styles/images/CALogo_512x512.png',
      },
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://www.famous-smoke.com/cigaradvisor/wp-content/uploads/2019/10/cigar-advisor-asylum-essential-review-guide-cover.jpeg',
    },
    articleSection: category.heading,
    description: article.description,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `https://www.famous-smoke.com${author.path}`,
      description: author.intro,
      image: {
        '@type': 'ImageObject',
        url: author.image,
      },
    },
  };
  addLdJsonScript(document.querySelector('head'), ldjson);
}

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
  addLdJson();
}
