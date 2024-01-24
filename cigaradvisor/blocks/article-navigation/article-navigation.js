import { getAllPosts } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const allArticles = await getAllPosts();
  let previousArticle;
  let nextArticle;
  const currentArticle = window.location.href;
  allArticles.forEach((article, index) => {
    if (currentArticle.indexOf(article.path) > -1) {
      previousArticle = allArticles[index + 1];
      nextArticle = allArticles[index - 1];
    }
  });
  const previousArticleNav = document.createElement('div');
  previousArticleNav.classList.add('previous-article-nav');
  const nextArticleNav = document.createElement('div');
  nextArticleNav.classList.add('next-article-nav');

  if (previousArticle) {
    previousArticleNav.innerHTML = `<a href="${previousArticle.path}" rel="prev">
            <h3>Previous Post</h3>    
            <span>${previousArticle.heading}</span></a>`;
  }
  if (nextArticle) {
    nextArticleNav.innerHTML = `<a href="${nextArticle.path}" rel="next">
            <h3>Next Post</h3>    
            <span>${nextArticle.heading}</span></a>`;
  }

  block.replaceChildren(previousArticleNav);
  block.append(nextArticleNav);
}
