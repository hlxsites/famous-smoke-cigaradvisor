import { getAllPosts } from '../../scripts/scripts.js';

function getFinalOrCurrentUrl(url) {
  return fetch(url, { method: 'HEAD', redirect: 'follow' })
    .then((response) => {
      if (response.ok) {
        // Not redirected, use the current page URL
        return url;
      } if (response.redirected) {
        // Redirected, get the final URL
        return response.url;
      }
      // Handle other cases if needed
      throw new Error('Unexpected response status');
    });
}

export default async function decorate(block) {
  const allArticles = await getAllPosts();
  let previousArticle;
  let nextArticle;
  getFinalOrCurrentUrl(window.location.href)
    .then((currentArticle) => {
      allArticles.forEach((article, index) => {
        if (currentArticle.indexOf(article.path) > -1) {
          previousArticle = allArticles[index - 1];
          nextArticle = allArticles[index + 1];
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
    })
    .catch((error) => console.log('Error:', error));
}
