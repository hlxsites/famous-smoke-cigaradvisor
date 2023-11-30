export default function decorate(block) {
  const anchor = document.createElement('a');
  [...block.children].forEach((row) => {
    let link;
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        anchor.append(pic);
      }
      if (col.textContent.toLowerCase() !== 'image' && col.textContent.toLowerCase() !== 'link') {
        link = col.textContent;
      }
    });
    anchor.setAttribute('href', link);
  });
  block.append(anchor);
  const children = block.children;

  // Loop through the children and remove those that are not anchor tags
  Array.from(children).forEach((child) => {
    if (child.tagName !== 'A') {
      console.log(child.tagName);
      block.removeChild(child);
    }
  });

}