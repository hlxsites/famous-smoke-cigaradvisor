import * as fs from 'node:fs';
import { JSDOM } from 'jsdom';

const extractBlurb = (node) => {
  if (node.querySelector('p')) {
    const text = [...node.querySelector('p').childNodes].find((child) => {
      return child.nodeType === 3; // Node.TEXT_NODE === 3 -jsdom doesn't have this constant.
    });
    return text && text.textContent.trim();
  }
  return node.textContent.trim();
}

const extractCategory = (a) => {
  const path = a.pathname;
  return path.substring(path.lastIndexOf('/') + 1);
}

const start = 'https://www.famous-smoke.com/cigaradvisor/moreposts';
let page = start;

const file = 'tools/importer/metadata.js'

try {
  fs.writeFileSync(file, 'export const metadata = {\n');
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
    const blurb = extractBlurb(article.querySelector('div.article__excerpt'));
    const category = extractCategory(article.querySelector('a.article__category'));
    try {
      fs.appendFileSync(file, `  "${name}": { category: "${category}", blurb: ${JSON.stringify(blurb)} },\n`);
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


