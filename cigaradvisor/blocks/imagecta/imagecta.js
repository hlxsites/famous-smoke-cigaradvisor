export default function decorate(block) {
  const anchor = document.createElement('a');
  [...block.children].forEach((row) => {
    var link;
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        anchor.append(pic);
      }
      if (col.textContent.toLowerCase() !== "image" && col.textContent.toLowerCase() !== "link") {
        link = col.textContent;
      }
    });
    anchor.setAttribute("href", link);

    const children = block.children;

    // Loop through the children and remove those that are not anchor tags
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].tagName !== 'A') {
        console.log(children[i].tagName);
        block.removeChild(children[i]);
      }
    }
  });
  block.append(anchor);
}