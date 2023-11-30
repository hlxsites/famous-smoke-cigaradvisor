import {
  createOptimizedPicture, readBlockConfig,
} from '../../scripts/aem.js';
export default async function decorate(block) {
  const configs = readBlockConfig(block);
  block.textContent = '';
  const anchor = document.createElement('a');
  anchor.append(createOptimizedPicture(configs.image));
  anchor.setAttribute('href', configs.link);
  block.append(anchor);
}

