import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/cigaradvisor/nav';
  const fragment = await loadFragment(navPath);
  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  const topNav = document.createElement('div');
  topNav.className = 'top-nav';

  const topNavContent = document.createElement('div');
  topNavContent.className = 'top-nav-content';
  const topNavLeft = fragment.children[0];
  topNavLeft.classList.add('top-nav-left');
  topNavContent.append(topNavLeft);
  const brand = document.createElement('div');
  brand.innerHTML = `<a href="https://www.famous-smoke.com/cigaradvisor" rel="home" class="layout__logo lg-andUp" title="Cigar Advisor Homepage">
  <img src="https://www.famous-smoke.com/cigaradvisor/wp-content/themes/CigarAdvisor/assets/images/logo.png?w=160" alt="Cigar Advisor Logo">
  </a>`;
  brand.className = 'brand-logo';
  topNavContent.append(brand);
  const topNavRight = fragment.children[0];
  topNavRight.classList.add('top-nav-right');
  topNavContent.append(topNavRight);
  topNav.append(topNavContent);
  nav.append(topNav);
  const primaryNav = fragment.children[0];
  primaryNav.className = 'primary-nav';
  nav.append(primaryNav);

  // on scroll down equal to primaryNav height, set class "solid-nav" to primaryNav
  const navHeight = 60;
  window.addEventListener('scroll', () => {
    if (window.scrollY > navHeight) {
      primaryNav.classList.add('solid-nav');
    } else {
      primaryNav.classList.remove('solid-nav');
    }
  });

  // add nav-drop class to nav items with dropdowns
  primaryNav.querySelectorAll('li').forEach((li) => {
    if (li.querySelector('ul')) {
      const secondaryNavBox = document.createElement('div');
      const text = li.childNodes[0].textContent;
      const textToClass = text.trim().toLowerCase().replace(/\s/g, '-');
      secondaryNavBox.className = `secondary-nav-box ${textToClass}`;
      secondaryNavBox.append(li.querySelector('ul'));
      li.className = 'nav-drop';
      li.setAttribute('aria-expanded', 'false');
      li.setAttribute('data-secondarynav', textToClass);
      nav.append(secondaryNavBox);
    }
  });
  const lastChild = primaryNav.querySelector('li:last-child');
  lastChild.className = 'nav-drop';
  lastChild.setAttribute('data-secondarynav', 'search-box');
  lastChild.setAttribute('aria-expanded', 'false');
  const searchBox = document.createElement('div');
  searchBox.className = 'secondary-nav-box search-box';
  searchBox.innerHTML = `<form action="https://www.famous-smoke.com/cigaradvisor/" class="search search--header lg-andUp">
  <label class="sr-only" for="header-search-term">Search</label>
  <input type="search" class="search__input predictiveSearch" id="header-search-term" maxlength="255" placeholder="Search here" name="s" autocomplete="off">
  <button type="submit" class="search__submit" value="Submit" title="Submit">Submit</button>
  </form>`;
  nav.append(searchBox);
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const navDrops = nav.querySelectorAll('.nav-drop');
  navDrops.forEach((drop) => {
    drop.addEventListener('click', () => {
      const secondaryNavBox = document.querySelectorAll('.secondary-nav-box');
      secondaryNavBox.forEach((box) => {
        box.style.display = 'none';
      });
      navDrops.forEach((d) => {
        if (d !== drop && d.getAttribute('aria-expanded') === 'true') {
          d.setAttribute('aria-expanded', 'false');
        }
      });
      const targetSecondaryNavClass = drop.dataset.secondarynav;
      const targetSecondaryNavBox = document.querySelector(`.${targetSecondaryNavClass}`);
      if (drop.getAttribute('aria-expanded') === 'false') {
        targetSecondaryNavBox.style.display = 'block';
        drop.setAttribute('aria-expanded', 'true');
      } else {
        targetSecondaryNavBox.style.display = 'none';
        drop.setAttribute('aria-expanded', 'false');
      }
    });
  });
}
