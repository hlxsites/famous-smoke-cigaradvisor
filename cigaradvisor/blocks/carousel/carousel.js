import { decorateIcons } from '../../scripts/aem.js';

/**
 * Generic carousel block, which can be used for any content or blocks.
 * Each row is a slide.
 * @param block
 */
export default async function decorate(block) {
  console.log(block);
  [...block.children].forEach((child, index) => {
    child.classList.add('slide');
    child.dataset.slideId = index;
  });

  // make a total of 3 copies of the slides, so it appears to be infinite scrolling
  const originalSlides = [...block.querySelectorAll('.slide')];
  // block.prepend(...(cloneSlides(originalSlides)));
  // block.append(...(cloneSlides(originalSlides)));

  const slidesWrapper = document.createElement('div');
  slidesWrapper.classList.add('slides-wrappper');
  while (block.firstChild) {
    let child = block.firstChild;
    slidesWrapper.append(child);
  }
  block.innerHTML = '';
  block.append(slidesWrapper);

  let currentIndex = 0;
  const items = slidesWrapper.querySelectorAll('.slide');
  function moveSlides(prevOrNext, smooth = 'smooth') {
    currentIndex = (currentIndex + 1) % items.length;
    slidesWrapper.style.transform = `translate3d(-${currentIndex * 50}%, 0, 0)`;
  }

  // set initial position, delay scrolling until the elements are properly laid out
  // requestAnimationFrame(function initialScroll() {
  //   if (originalSlides[0].offsetLeft > 0) {
  //     block.scrollTo({ top: 0, left: originalSlides[0].offsetLeft, behavior: 'instant' });
  //   } else {
  //     setTimeout(initialScroll, 200);
  //   }
  // });

  // once the scroll is finished, jump back to an original slide in the middle
  // onScrollEnd(block, () => {
  //   const original = getOriginalSlide(getCurrentSlide(block), block);
  //   if (original) {
  //     block.scrollTo({ top: 0, left: original.offsetLeft, behavior: 'instant' });
  //   }
  // }, false);

  block.append(...createButtons(moveSlides));
  await decorateIcons(block);
}

function cloneSlides(originalSlides) {
  return originalSlides.map((child) => {
    const clone = child.cloneNode(true);
    clone.dataset.slideCloneId = child.dataset.slideId;
    delete clone.dataset.slideId;
    return clone;
  });
}

function getCurrentSlide(block) {
  const viewStart = block.scrollLeft;
  const viewEnd = block.scrollLeft + block.clientWidth;
  return [...block.querySelectorAll('.slide')]
    .find((slide) => viewStart <= slide.offsetLeft && slide.offsetLeft < viewEnd);
}

function getOriginalSlide(slide, block) {
  if (slide.dataset.slideCloneId) {
    return block.querySelector(`[data-slide-id="${slide.dataset.slideCloneId}"]`);
  }
  return null;
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

/** Fallback for Safari, see explanation on https://developer.chrome.com/blog/scrollend-a-new-javascript-event/
 and https://stackoverflow.com/a/4620986/79461 */
function onScrollEnd(block, callback, once = false) {
  if ('onscrollend' in window) {
    block.addEventListener('scrollend', callback, { once });
    return;
  }
  let timer = null;
  const scrollListener = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // no scrolling happened for 150ms
      if (once) block.removeEventListener('scroll', scrollListener);
      callback();
    }, 150);
  };
  block.addEventListener('scroll', scrollListener);
}
