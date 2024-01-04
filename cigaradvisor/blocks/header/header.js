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

  //make a copy of topNavLeft for mobile
  const mobileTopNavContent = topNavLeft.cloneNode(true);

  mobileTopNavContent.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('a').getAttribute('href');
    li.querySelector('a').remove();
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.innerHTML = li.innerHTML;
    li.innerHTML = '';
    li.append(a);
  });

  mobileTopNavContent.class = "mobile-top-nav-content";
  mobileTopNav.append(mobileTopNavContent);

  const mobilePrimaryNav = document.createElement('div');
  mobilePrimaryNav.className = 'mobile-primary-nav';
  const hamburger = document.createElement('a');
  hamburger.classList.add('nav-hamburger');
  hamburger.setAttribute('href', '#');
  hamburger.setAttribute('title', 'Toggle navigation');
  hamburger.innerHTML = `<i class="fa fa-bars"></i>`;
  mobilePrimaryNav.append(hamburger);
  const mobileLogo = document.createElement('a');
  mobileLogo.className = 'mobile-logo';
  mobileLogo.setAttribute('href', 'https://www.famous-smoke.com/cigaradvisor');
  mobileLogo.setAttribute('title', 'Cigar Advisor Homepage');
  mobileLogo.innerHTML = `<img src="https://www.famous-smoke.com/cigaradvisor/wp-content/themes/CigarAdvisor/assets/images/logo1.png" alt="Cigar Advisor Logo">`;
  mobilePrimaryNav.append(mobileLogo);
  const search = document.createElement('a');
  search.className = 'search';
  search.setAttribute('href', 'https://www.famous-smoke.com/cigaradvisor/?s=');
  search.setAttribute('title', 'Search');
  search.innerHTML = `<i class="fa fa-search"></i>`;
  mobilePrimaryNav.append(search);
  mobileNav.append(mobilePrimaryNav);

  topNavLeft.classList.add('top-nav-left');
  topNavContent.append(topNavLeft);
  const brand = document.createElement('div');
  brand.innerHTML = `<a href="https://www.famous-smoke.com/cigaradvisor" rel="home" class="layout__logo lg-andUp" title="Cigar Advisor Homepage">
  <img src="https://www.famous-smoke.com/cigaradvisor/wp-content/themes/CigarAdvisor/assets/images/logo.png?w=160" alt="Cigar Advisor Logo">
  </a>`;
  brand.className = 'brand-logo';
  topNavContent.append(brand);
  const topNavRight = fragment.children[0];
  //create a clone of topNavRight for mobile
  const socialNavMobile = topNavRight.cloneNode(true);
  socialNavMobile.className = 'mobile-social-nav';
  topNavRight.classList.add('top-nav-right');
  topNavContent.append(topNavRight);
  topNav.append(topNavContent);
  nav.append(topNav);
  const primaryNav = fragment.children[0];
  primaryNav.className = 'primary-nav';
  nav.append(primaryNav);

  //toggle nav-content-open class on mobilePrimaryNavWrapper when hamburger is clicked default is with class nav-content-open
  hamburger.addEventListener('click', () => {
    mobilePrimaryNavWrapper.classList.toggle('nav-content-open');
  });

  // on scroll down equal to primaryNav height, set class "solid-nav" to primaryNav
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

  // add nav-drop class to nav items with dropdowns
  primaryNav.querySelectorAll('.default-content-wrapper > ul > li').forEach((li) => {
    if (li.querySelector('ul')) {
      const a = document.createElement('a');
      a.setAttribute('href', '#');
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
      mobilePrimaryNavContent.append(li.cloneNode(true));
      mobilePrimaryNavContent.append(secondaryNavBox.cloneNode(true));
    } else {
      mobilePrimaryNavContent.append(li.cloneNode(true));
    }
  });

  const mobilePrimaryNavWrapper = document.createElement('div');
  mobilePrimaryNavWrapper.className = 'mobile-primary-nav-wrapper nav-content-open';
  mobilePrimaryNavWrapper.append(mobilePrimaryNavContent);
  mobilePrimaryNavWrapper.append(socialNavMobile);
  mobileNav.append(mobilePrimaryNavWrapper);

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
  navWrapper.append(mobileNav);
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
