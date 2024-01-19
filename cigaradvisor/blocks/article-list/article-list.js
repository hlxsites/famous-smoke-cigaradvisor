import { readBlockConfig } from '../../scripts/aem.js';
import { fetchData, getRelativePath } from '../../scripts/scripts.js';
import { buildArticleTeaser } from '../article-teaser/article-teaser.js';

export default async function decorate(block) {
  const configs = readBlockConfig(block);
  const { category } = configs;
  if (category) {
    const articles = await fetchData(getRelativePath(category), '/cigaradvisor/posts/query-index.json', 'category');
    if (!articles || articles.length === 0) {
      return;
    }
    const articlesList = document.createElement('div');
    articlesList.classList.add('article-teaser-list');
    [...articles].map(async (article) => {
      await buildArticleTeaser(articlesList, article);
    });
    block.replaceChildren(articlesList);
  }
}
