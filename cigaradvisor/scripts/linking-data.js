import { getMetadata } from './aem.js';
import { getCategory } from './util.js';

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

/**
 * Determines if the page contains a FAQ section and writes the LD JSON to the head
 */
function addFAQLdJson() {
  const contentDivs = document.querySelectorAll('.default-content-wrapper');
  //find the content div that contains a FAQ
  for (let i = 0; i < contentDivs.length; i++) {
    let isFAQPage = false;
    const h2Elements = contentDivs[i].getElementsByTagName('h2');
    // Does the div contain a faq section?
    for (let j = 0; j < h2Elements.length; j++) {
      if (h2Elements[j].id.includes('frequently-asked-questions')) {
        isFAQPage = true;
      }
    }
    if (isFAQPage) {
      const ldjson = {
        '@context': 'http://schema.org/',
        '@type': 'FAQPage',
        mainEntity: [],
      };
      //questions should be in the h3 elements, with the answers in the following element
      const h3Elements = contentDivs[i].getElementsByTagName('h3');
      for (let k = 0; k < h3Elements.length; k++) {
        let QAEntity = {
          "@type": "Question",
          name: h3Elements[k].textContent,
          acceptedAnswer : {}
        };
        if (h3Elements[k].nextElementSibling) {
          QAEntity.acceptedAnswer = {
            "@type": "Answer",
            text: h3Elements[k].nextElementSibling.textContent
          }
          //add question only if we found the answer
          ldjson.mainEntity.push(QAEntity);
        }
      }
      addLdJsonScript(document.querySelector('head'), ldjson);
    }
  }
}

export default function addLinkingData() {
  addOrg(document.querySelector('head'));
  if (window.location.pathname === '/cigaradvisor') {
    addBlogPosts();
  } else if (window.location.pathname === getCategory(window.location.pathname)) {
    addOrUpdateCollection();
    window.addEventListener('hashchange', addOrUpdateCollection);
  }
  addFAQLdJson();
}
