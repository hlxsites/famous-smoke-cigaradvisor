/**
 * Loads an author.
 * @param {string} path The path to the author
 * @returns {HTMLElement} The root element of the author
 */
async function loadAuthor(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const div = document.createElement('div');
      div.innerHTML = await resp.text();
      return div;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  block.innerHTML = '';
  const author = await loadAuthor(path);
  if (author) {
    // add updated link to all author articles
    const authorName = author.querySelector('h2').innerHTML;
    link.textContent = `Show all ${authorName}'s Articles`;
    author.append(link);
    block.append(author);
  }
}
