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
  const navContainer = footerContent.querySelector('div.footer-nav > .default-content-wrapper');
  if (navContainer && navContainer.childNodes.length) {
    navContainer.classList.add('nav-container');

    let currentElement = navContainer.firstElementChild;
    let nextElement;
    while (currentElement) {
      // create section
      const section = document.createElement('div');
      section.classList.add('nav-section');
      if (currentElement.tagName === 'H1') {
        section.classList.add('with-heading');
      }

      // populate section
      do {
        nextElement = currentElement.nextSibling;
        section.appendChild(currentElement);
        currentElement = nextElement;
      } while (nextElement && nextElement.tagName !== 'H1');

      // add section to container
      if (nextElement) {
        navContainer.insertBefore(section, nextElement);
      } else {
        navContainer.appendChild(section);
      }
    }
  }

  block.innerHTML = footerContent.innerHTML;
}
