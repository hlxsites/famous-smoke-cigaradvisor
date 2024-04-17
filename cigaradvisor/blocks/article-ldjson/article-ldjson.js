import { fetchAuthorInfo, fetchCategoryInfo, fetchPostsInfo } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';
import { addLdJsonScript } from '../../scripts/linking-data.js';

export default async function decorate(block) {
  block.parentElement.remove();
  const img = document.querySelector('main img');


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
  if (!article || !author || !category) {
    return;
  }

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
      url: img.src,
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
