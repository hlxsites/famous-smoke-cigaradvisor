import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';


export default function decorate(block) {
  const filters = readBlockConfig(block);
  block.textContent = '';
  console.log(filters);
}


async function fetchArticlesAndCreateTeaser(filters) {
  return ffetch(`${window.hlx.codeBasePath}/articles.json`)
    .sheet('section-carousel')
    // make sure all filters match
    .filter((article) => Object.keys(filters).every(
      (key) => article[key]?.toLowerCase() === filters[key].toLowerCase(),
    ))
    .map(async (article) => {
      const wrapper = document.createElement('div');
      const card = createCardBlock(article, wrapper);
      if (article.section) {
        card.classList.add(toClassName(article.section));
      }

      await loadBlock(card);
      return wrapper;
    })
    .all();
}