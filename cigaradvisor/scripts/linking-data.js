import { getMetadata } from './aem.js';

/**
 * Writes a script element with the LD JSON struct to the page
 * @param {HTMLElement} parent
 * @param {Object} json
 */
export function addLdJsonScript(parent, json) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(json);
  parent.append(script);
}

function addOrg(head) {
  const ldjson = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.famous-smoke.com/cigaradvisor#organization',
    name: 'Cigar Advisor',
    url: 'https://www.famous-smoke.com/cigaradvisor',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.famous-smoke.com/cigaradvisor/styles/images/CALogo_512x512.png',
      width: 512,
      height: 512,
      '@id': 'https://www.famous-smoke.com/cigaradvisor#logo',
    },
    sameAs: [
      'https://www.facebook.com/CigarAdvisor/',
      'https://twitter.com/cigaradvisor',
      'https://www.instagram.com/cigaradvisor/',
      'https://www.youtube.com/user/CigarAdvisorMagazine',
      'https://www.pinterest.com/FamousSmokeShop/cigar-advisor-magazine-articles/',
      'https://cigaradvisor.tumblr.com/',
    ],
  };
  addLdJsonScript(head, ldjson);
}

function getBlotPostings() {
  const list = [];
  document.querySelectorAll('main .article-teaser.block script[type="application/ld+json"]').forEach((script) => {
    const article = JSON.parse(script.textContent);
    list.push(article);
  });
  return list;
}

export function addOrUpdateCollection() {
  // Remove existing collection page definition
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    const json = JSON.parse(s.textContent);
    if (json['@type'] === 'CollectionPage') {
      s.remove();
    }
  });

  const heading = document.querySelector('main h1').textContent;
  const description = getMetadata('description');
  const ldjson = {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    headline: heading,
    description,
    url: window.location.href,
    sameAs: [],
    hasPart: getBlotPostings(),
  };
  addLdJsonScript(document.querySelector('head'), ldjson);
}

function addBlogPosts() {
  const ldjson = {
    '@context': 'http://schema.org/',
    '@type': 'Blog',
    headline: 'Cigar Advisor',
    description: '#1 Cigar Magazine for Cigar Reviews',
    url: 'https://www.famous-smoke.com/cigaradvisor',
    blogPost: getBlotPostings(),
  };
  addLdJsonScript(document.querySelector('head'), ldjson);
}

export default function addLinkingData() {
  addOrg(document.querySelector('head'));
  if (window.location.pathname === '/cigaradvisor') {
    addBlogPosts();
  } else if (window.location.pathname.match(/\/cigaradvisor\/category\/[^/]+$/)) {
    addOrUpdateCollection();
    window.addEventListener('hashchange', addOrUpdateCollection);
  }
}
