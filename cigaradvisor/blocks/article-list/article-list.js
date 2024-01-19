import { readBlockConfig } from '../../scripts/aem.js';
import { fetchData, getRelativePath } from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';

export default async function decorate(block) {
  const configs = readBlockConfig(block);
  const { category } = configs;
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('section');
  parentDiv.dataset.layout = '50/50';
  const leftDiv = document.createElement('div');
  leftDiv.classList.add('left-grid');
  const rightDiv = document.createElement('div');
  rightDiv.classList.add('right-grid');
  let current = rightDiv;
  if (category) {
    const articles = await fetchData(getRelativePath(category), '/cigaradvisor/posts/query-index.json', 'category');
    if (!articles || articles.length === 0) {
      return;
    }
    const articlePromises = [...articles].map(async (article) => {
      const articletTeaserWrapper = document.createElement('div');
      articletTeaserWrapper.classList.add('article-teaser-wrapper');
      const articleTeaser = document.createElement('div');
      articleTeaser.classList.add('article-teaser');
      articleTeaser.classList.add('block');
      articletTeaserWrapper.append(articleTeaser);
      current = (current === leftDiv) ? rightDiv : leftDiv;
      current.append(articletTeaserWrapper);
      await buildArticleTeaser(articleTeaser, article);
    });
    await Promise.all(articlePromises);

    parentDiv.append(leftDiv);
    parentDiv.append(rightDiv);
    block.replaceChildren(parentDiv);
  }
}
