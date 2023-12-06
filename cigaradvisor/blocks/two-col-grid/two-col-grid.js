import { buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';

export default function decorate(block) {
  const container = block.querySelector(':scope > div');
  container.children[0].classList.add('left-column');
  [...container.children[0].children].forEach((child) => {
    const blockName = child.classList.item(0);
    const childBlock = buildBlock(blockName, child);
    block.append(childBlock);
    decorateBlock(childBlock);
    loadBlock(childBlock);
    container.children[0].append(childBlock);
  });
  container.children[1].classList.add('right-column');
  [...container.children[1].children].forEach((child) => {
    const blockName = child.classList.item(0);
    const childBlock = buildBlock(blockName, child);
    block.append(childBlock);
    decorateBlock(childBlock);
    loadBlock(childBlock);
    container.children[1].append(childBlock);
  });
}
