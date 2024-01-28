import * as fs from 'node:fs';
import { JSDOM } from 'jsdom';

const extract = (node) => {
  if (node.querySelector('p')) {
    const text = [...node.querySelector('p').childNodes].find((child) => {
      return child.nodeType === 3; // Node.TEXT_NODE === 3 -jsdom doesn't have this constant.
    });
    return text && text.textContent.trim();
  }
  return node.textContent.trim();
}

const start = 'https://www.famous-smoke.com/cigaradvisor/moreposts';
let page = start;

const file = './blurbs.js'

try {
  fs.writeFileSync(file, 'export const blurbs = {\n');
} catch (err) {
  console.log(err);
}
while (page) {
  console.log(page);
  const resp = await fetch(page);
  if (!resp.ok) {
    break;
  }
  const { document } = new JSDOM(await resp.text()).window;
  const main = document.querySelector('main')
  main.querySelectorAll('article').forEach((article) => {
    const href = article.querySelector('a.read_more').href;
    const name = href.substring(href.lastIndexOf('/') + 1);
    const blurb = extract(article.querySelector('div.article__excerpt'));
    try {
      fs.appendFileSync(file, `  "${name}": ${JSON.stringify(blurb)},\n`);
    } catch (err) {
      console.log(err);
    }
  })
  page = main.querySelector('.pagination-container ol.pagination li a.next')?.href;
}

try {
  fs.appendFileSync(file, '};');
} catch (err) {
  console.log(err);
}


