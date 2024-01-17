import { buildBlock, createOptimizedPicture, getMetadata } from '../aem.js';

export default async function decorate(main) {
  const hero = getMetadata('hero-image');
  const picture = createOptimizedPicture(hero, true);
  const section = document.createElement('div');
  const block = buildBlock('hero', {elems: [picture] });
  block.classList.add('no-search');
  section.append(block);
  main.prepend(section);
}
