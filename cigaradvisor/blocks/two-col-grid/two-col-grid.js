import { buildBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const container = block.querySelector(':scope > div');
  container.children[0].classList.add('left-column');
  container.children[1].classList.add('right-column');
}
