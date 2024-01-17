import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');

  // load footer fragment
  const footerPath = footerMeta.footer || '/cigaradvisor/footer';
  const footerContent = await loadFragment(footerPath);
  const currentYear = new Date().getFullYear();
  footerContent.innerHTML = footerContent.innerHTML.replaceAll('{year}', currentYear.toString());

  // decorate footer sections
  const footerContainer = footerContent.querySelector('div.footer-nav > .default-content-wrapper');
  if (footerContainer && footerContainer.childNodes.length) {
    footerContainer.classList.add('nav-container');

    let currentElement = footerContainer.firstElementChild;
    let nextElement;
    while (currentElement) {
      // create section
      const section = document.createElement('div');
      section.classList.add('nav-section');
      if (currentElement.tagName === 'h4') {
        section.classList.add('with-heading');
      }

      // populate section
      do {
        nextElement = currentElement.nextSibling;
        section.appendChild(currentElement);
        currentElement = nextElement;
      } while (nextElement && nextElement.tagName !== 'h4');

      // add section to container
      footerContainer.insertBefore(section, currentElement);
    }
  }

  block.innerHTML = footerContent.innerHTML;
}
