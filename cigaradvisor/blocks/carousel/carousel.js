import { decorateIcons } from '../../scripts/aem.js';
import { isExternal } from '../../scripts/scripts.js';

function setAutoScroll(moveSlides, slidesWrapper) {
  // Set interval for auto-scrolling (change slide every 3 seconds)
  let interval;
  setTimeout(() => {
    interval = setInterval(() => {
      moveSlides('next');
    }, 3000);

    // Stop auto-scroll on user interaction
    slidesWrapper.addEventListener('mouseenter', () => {
      clearInterval(interval);
    });
    slidesWrapper.addEventListener('mouseleave', () => {
      console.log('mouseleave');
      interval = setInterval(() => {
        moveSlides('next');
      }, 6000);
    });
  }, 3000);
}

function createButtons(moveSlides) {
  return ['prev', 'next'].map((direction) => {
    const button = document.createElement('button');
    button.ariaLabel = `show ${direction} slide`;
    button.classList.add(direction);
    const iconDiv = document.createElement('div');
    iconDiv.classList.add(`arrow-${direction}`);
    iconDiv.classList.add('carousel-arrow');
    button.appendChild(iconDiv);
    button.addEventListener('click', () => moveSlides(direction));
    return button;
  });
}

/**
 * Generic carousel block, which can be used for any content or blocks.
 * Each row is a slide.
 * @param block
 */
export default async function decorate(block) {
  const mobile = (window.screen.width < 600);
  const offset = mobile ? 100 : 50;
  const itemsToShow = mobile ? 1 : 2;
  const slidesWrapper = document.createElement('div');
  slidesWrapper.classList.add('slides-wrappper');
  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.classList.add('slide');
    let pic;
    let anchor;
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) {
        pic = col.querySelector('picture');
      }
      if (col.querySelector('a')) {
        anchor = col.querySelector('a');
      }
    });
    const img = pic.querySelector('img');
    const link = anchor.getAttribute('href');
    anchor.setAttribute('target', isExternal(link) ? '_blank' : '_self');
    anchor.setAttribute('title', img.alt);
    anchor.replaceChildren(pic);
    slide.append(anchor);
    slidesWrapper.append(slide);
  });

  block.replaceChildren(slidesWrapper);

  let currentIndex = 0;
  const items = slidesWrapper.querySelectorAll('.slide');
  function moveSlides(prevOrNext) {
    if (prevOrNext === 'next') {
      if (currentIndex < (items.length - itemsToShow)) {
        currentIndex += 1;
        slidesWrapper.style.transform = `translate3d(-${currentIndex * offset}%, 0, 0)`;
        if (!mobile) {
          block.querySelector('.arrow-prev').style.display = 'inline-block';
        }
        if (currentIndex === (items.length - itemsToShow)) {
          block.querySelector('.arrow-next').style.display = 'none';
        }
      }
    } else if (currentIndex >= 1) {
      currentIndex -= 1;
      slidesWrapper.style.transform = `translate3d(-${currentIndex * offset}%, 0, 0)`;
      if (currentIndex <= 1) {
        block.querySelector('.arrow-prev').style.display = 'none';
      }
    }
  }

  block.append(...createButtons(moveSlides));
  await decorateIcons(block);
  setAutoScroll(moveSlides, block);
}
