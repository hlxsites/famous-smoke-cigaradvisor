import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateExternalLink } from '../../scripts/scripts.js';

/**
 * Decorates the header block with navigation elements.
 * @param {HTMLElement} block - The header block element.
 * @returns {Promise<void>} - A promise that resolves once the decoration is complete.
 */
export default async function decorate(block) {
  block.innerHTML = '';
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/cigaradvisor/nav';
  const fragment = await loadFragment(navPath);
  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';

  // add a separate div for mobile nav
  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';

  const topNav = document.createElement('div');
  topNav.className = 'top-nav';

  const mobileTopNav = document.createElement('div');
  mobileTopNav.className = 'mobile-top-nav';

  mobileNav.append(mobileTopNav);

  const topNavContent = document.createElement('div');
  topNavContent.className = 'top-nav-content';
  const topNavLeft = fragment.children[0];
  topNavLeft.querySelectorAll('li a').forEach((a) => {
    a.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const p = document.createElement('p');
        p.textContent = n.textContent;
        n.replaceWith(p);
      }
    });
  });
  const mobileTopNavContent = topNavLeft.cloneNode(true);

  mobileTopNavContent.class = 'mobile-top-nav-content';
  mobileTopNav.append(mobileTopNavContent);

  const mobilePrimaryNav = document.createElement('div');
  mobilePrimaryNav.className = 'mobile-primary-nav';
  const hamburger = document.createElement('a');
  hamburger.classList.add('nav-hamburger');
  hamburger.setAttribute('title', 'Toggle navigation');
  hamburger.innerHTML = '<span class="icon icon-bars"></span>';
  mobilePrimaryNav.append(hamburger);
  const mobileLogo = document.createElement('a');
  mobileLogo.className = 'mobile-logo';
  mobileLogo.setAttribute('href', '/cigaradvisor');
  mobileLogo.setAttribute('title', 'Cigar Advisor Homepage');
  mobileLogo.innerHTML = '<img src="/cigaradvisor/images/header/mobile-logo.png" alt="Cigar Advisor Logo">';
  mobilePrimaryNav.append(mobileLogo);
  const search = document.createElement('a');
  search.className = 'search';
  search.setAttribute('href', '/cigaradvisor?s=');
  search.setAttribute('title', 'Search');
  search.innerHTML = '<span class="icon icon-magnifying-glass"></span>';
  mobilePrimaryNav.append(search);
  mobileNav.append(mobilePrimaryNav);
  decorateIcons(mobilePrimaryNav);

  topNavLeft.classList.add('top-nav-left');
  topNavContent.append(topNavLeft);
  const brand = document.createElement('div');
  brand.innerHTML = `<a href="/cigaradvisor" rel="home" class="layout__logo lg-andUp" title="Cigar Advisor Homepage">
  <img src="/cigaradvisor/images/header/desktop-logo.png" alt="Cigar Advisor Logo">
  </a>`;
  brand.className = 'brand-logo';
  topNavContent.append(brand);
  const topNavRight = fragment.children[0];
  const socialNavMobile = topNavRight.cloneNode(true);
  socialNavMobile.className = 'mobile-social-nav';
  topNavRight.classList.add('top-nav-right');
  topNavContent.append(topNavRight);
  topNav.append(topNavContent);
  nav.append(topNav);
  const primaryNav = fragment.children[0];
  primaryNav.className = 'primary-nav';
  nav.append(primaryNav);

  const navHeight = 60;
  window.addEventListener('scroll', () => {
    if (window.scrollY > navHeight) {
      primaryNav.classList.add('solid-nav');
    } else {
      primaryNav.classList.remove('solid-nav');
    }
  });

  const mobilePrimaryNavContent = document.createElement('div');
  mobilePrimaryNavContent.className = 'mobile-primary-nav-content';
  const ul = document.createElement('ul');

  // add nav-drop class to nav items with dropdowns
  primaryNav.querySelectorAll('.default-content-wrapper > ul > li').forEach((li) => {
    let mobileLi;
    if (li.querySelector('ul')) {
      const a = document.createElement('a');
      const secondaryNavBox = document.createElement('div');
      const text = li.childNodes[0].textContent;
      a.innerHTML = `<span> ${text} </span>`;
      li.childNodes[0].textContent = '';
      const textToClass = text.trim().toLowerCase().replace(/\s/g, '-');
      secondaryNavBox.className = `secondary-nav-box ${textToClass}`;
      secondaryNavBox.append(li.querySelector('ul'));
      li.className = 'nav-drop';
      li.setAttribute('aria-expanded', 'false');
      li.setAttribute('data-secondarynav', textToClass);
      nav.append(secondaryNavBox);
      li.append(a);
      mobileLi = li.cloneNode(true);
      mobileLi.append(secondaryNavBox.cloneNode(true));
      ul.append(mobileLi);
    } else {
      mobileLi = li.cloneNode(true);
      ul.append(mobileLi);
    }
  });

  mobilePrimaryNavContent.append(ul);
  const mobilePrimaryNavWrapper = document.createElement('div');
  mobilePrimaryNavWrapper.className = 'mobile-primary-nav-wrapper nav-content-open';
  mobilePrimaryNavWrapper.append(mobilePrimaryNavContent);
  mobilePrimaryNavWrapper.append(socialNavMobile);
  mobileNav.append(mobilePrimaryNavWrapper);
  mobileNav.classList.add('mobile-nav-closed');

  hamburger.addEventListener('click', () => {
    mobilePrimaryNavWrapper.classList.toggle('nav-content-open');
    if (mobileNav.classList.contains('mobile-nav-closed')) {
      mobileNav.classList.remove('mobile-nav-closed');
    } else {
      setTimeout(() => {
        mobileNav.classList.add('mobile-nav-closed');
      }, 500);
    }
  });

  const searchButton = document.createElement('li');
  primaryNav.querySelector('ul').append(searchButton);
  searchButton.innerHTML = '<span class="icon icon-magnifying-glass"></span>';
  decorateIcons(primaryNav);
  searchButton.className = 'nav-drop';
  searchButton.setAttribute('data-secondarynav', 'search-box');
  searchButton.setAttribute('aria-expanded', 'false');
  const searchBox = document.createElement('div');
  searchBox.className = 'secondary-nav-box search-box';
  searchBox.innerHTML = `<form action="/cigaradvisor" class="search search--header lg-andUp">
  <label class="sr-only" for="header-search-term">Search</label>
  <input type="search" class="search__input predictiveSearch" id="header-search-term" maxlength="255" placeholder="Search here" name="s" autocomplete="off">
  <button type="submit" class="search__submit" value="Submit" title="Submit">Submit</button>
  </form>`;
  nav.append(searchBox);
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  navWrapper.append(mobileNav);
  block.append(navWrapper);
  decorateExternalLink(block);

  const navDrops = nav.querySelectorAll('.nav-drop');
  navDrops.forEach((drop) => {
    drop.addEventListener('click', () => {
      const secondaryNavBox = nav.querySelectorAll('.secondary-nav-box');
      secondaryNavBox.forEach((box) => {
        box.style.display = 'none';
      });
      navDrops.forEach((d) => {
        if (d !== drop && d.getAttribute('aria-expanded') === 'true') {
          d.setAttribute('aria-expanded', 'false');
        }
      });
      const targetSecondaryNavClass = drop.dataset.secondarynav;
      const targetSecondaryNavBox = nav.querySelector(`.${targetSecondaryNavClass}`);
      if (drop.getAttribute('aria-expanded') === 'false') {
        targetSecondaryNavBox.style.display = 'block';
        drop.setAttribute('aria-expanded', 'true');
      } else {
        targetSecondaryNavBox.style.display = 'none';
        drop.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const mobileNavDrops = mobileNav.querySelectorAll('.nav-drop');
  mobileNavDrops.forEach((drop) => {
    drop.addEventListener('click', () => {
      const secondaryNavBox = mobileNav.querySelectorAll('.secondary-nav-box');
      secondaryNavBox.forEach((box) => {
        box.style.display = 'none';
      });
      mobileNavDrops.forEach((d) => {
        if (d !== drop && d.getAttribute('aria-expanded') === 'true') {
          d.setAttribute('aria-expanded', 'false');
        }
      });
      const targetSecondaryNavClass = drop.dataset.secondarynav;
      const targetSecondaryNavBox = mobileNav.querySelector(`.${targetSecondaryNavClass}`);
      if (drop.getAttribute('aria-expanded') === 'false') {
        targetSecondaryNavBox.style.display = 'flex';
        drop.setAttribute('aria-expanded', 'true');
      } else {
        targetSecondaryNavBox.style.display = 'none';
        drop.setAttribute('aria-expanded', 'false');
      }
    });
  });
}
