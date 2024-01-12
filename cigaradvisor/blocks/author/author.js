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
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('image-wrapper');
    const picture = author.querySelector('picture');
    imageWrapper.append(picture);
    const authorName = author.querySelector('h2').innerHTML;
    const authorDetails = document.createElement('div');
    authorDetails.classList.add('author-details');
    const authorHeadingWrapper = document.createElement('div');
    authorHeadingWrapper.classList.add('author-heading-wrapper');
    const authorHeading = document.createElement('div');
    authorHeading.classList.add('author-heading');
    authorHeading.append(author.querySelector('h2'));
    authorHeading.append(author.querySelector('h3'));
    authorHeadingWrapper.append(authorHeading);
    authorDetails.append(authorHeadingWrapper);
    const authorP = author.querySelectorAll('p');
    const authorPCount = authorP.length;
    const authorPIndex = authorPCount - 1;
    const authorPContent = authorP[authorPIndex];
    authorDetails.append(authorPContent);
    link.textContent = `Show all ${authorName}'s Articles`;
    authorDetails.append(link);
    author.replaceChildren(imageWrapper);
    author.append(authorDetails);
    block.append(author);
  }
}
