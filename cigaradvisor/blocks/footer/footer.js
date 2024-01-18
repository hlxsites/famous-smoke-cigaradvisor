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
  const footerNavContainer = footerContent.querySelector('div.footer-nav > .default-content-wrapper');
  const footerNav = document.createElement('nav');
  if (footerNavContainer && footerNavContainer.childNodes.length) {
    let currentElement = footerNavContainer.firstElementChild;
    let nextElement;
    while (currentElement) {
      // create section
      const section = document.createElement('div');
      section.classList.add('nav-section');
      if (currentElement.tagName === 'H3') {
        section.classList.add('with-heading');
      }

      // populate section
      do {
        nextElement = currentElement.nextSibling;
        section.appendChild(currentElement);
        currentElement = nextElement;
      } while (nextElement && nextElement.tagName !== 'H3');

      // add section to container
      footerNav.append(section);
    }
    footerNavContainer.append(footerNav);
  }

  block.innerHTML = footerContent.innerHTML;
  const footerHeading = document.createElement('H2');
  footerHeading.innerText = 'Footer';
  block.prepend(footerHeading);
}
