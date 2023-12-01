export default async function decorate(block) {
  const children = [];
  const anchor = document.createElement('a');
  anchor.append(block.querySelector('picture'));
  anchor.setAttribute('href', block.querySelector('a').getAttribute('href'));
  children.push(anchor);
  block.replaceChildren(...children);
}
