import { createOptimizedPicture, readBlockConfig, buildBlock, decorateBlock, loadBlock } from '../../scripts/aem.js';
import ffetch from '../../scripts/ffetch.js';


export default async function decorate(block) {
  const filters = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('article-teaser');
  console.log(filters);
  const teaserContent = await fetchTeaserContent(filters);
  block.append(renderBlockTeaser(teaserContent));
}

async function fetchTeaserContent(filters) {
  return ffetch(`${window.hlx.codeBasePath}/drafts/Kailas/pagemeta.json`)
    // make sure all filters match
    .filter((article) => Object.keys(filters).every(
      (key) => article[key]?.toLowerCase() === filters[key].toLowerCase(),
    ))
    .map(async (article) => {
      return article;
    })
    .all();
}

function renderBlockTeaser(articleinfo) {
  /* eslint-disable indent */
  return div(
    { class: 'article-teaser' },
    div(
      { class: 'article-teaser-thumb' },
      a({ href: articleinfo.path }, createOptimizedPicture(articleinfo.image)),
    ),
    div(
      { class: 'article-teaser-content' },
      h2(a({ href: articleinfo.path }, articleinfo.title)),
      div(
        { class: 'article_meta' },
        articleinfo.publishedDate
          ? div(
            i({ class: 'fa fa-calendar' }),
            span(
              { class: 'article-publish-date' },
              formatDate(blogData.publicationDate, { month: 'long' }),
            ),
          )
          : '',
        blogData.author
          ? div(i({ class: 'fa fa-user' }), span({ class: 'blog-author' }, blogData.author))
          : '',
      ),
      p(blogData.description),
      p(
        { class: 'button-container' },
        a(
          {
            href: blogData.path,
            'aria-label': blogData.c2aButtonText,
            class: 'button primary',
          },
          blogData.c2aButtonText,
        ),
      ),
    ),
  );
  /* eslint-enable indent */
}