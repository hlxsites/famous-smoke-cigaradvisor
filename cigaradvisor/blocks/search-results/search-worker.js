/* eslint-disable max-len */
/* eslint-disable no-restricted-globals */
const ARTICLE_INDEX_PATH = '/cigaradvisor/index/article-index.json';
const SEARCH_INDEX_PATH = '/cigaradvisor/index/search-index.json';
const articleIndexData = [];

const searchIndexData = [];
/**
 * Retrieves search index data from the server.
 * @returns {Promise<Object>} The search index data.
 */
async function getSearchIndexData(path = SEARCH_INDEX_PATH, flag = false) {
  if (searchIndexData.length === 0 || flag) {
    const resp = await fetch(path);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    jsonData.data.forEach((a) => {
      searchIndexData.push({ ...a });
    });
    // If there are more items to load, load them
    if ((jsonData.total - jsonData.offset) > jsonData.limit) {
      const offset = jsonData.offset + jsonData.limit;
      const indexPath = `${SEARCH_INDEX_PATH}?offset=${offset}&limit=${jsonData.total - offset}`;
      await getSearchIndexData(indexPath, true);
    }
  }
  // Protected against callers modifying the objects
  const ret = [];
  if (searchIndexData) {
    searchIndexData.forEach((a) => {
      ret.push({ ...a });
    });
  }
  return ret;
}

/**
 * Loads posts from the specified path asynchronously.
 * @param {string} path - The path to fetch the posts from.
 * @param {boolean} recurse - Indicates whether to recursively load more articles.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of post objects.
 */
async function loadPosts(path = ARTICLE_INDEX_PATH, recurse = false) {
  if (articleIndexData.length === 0 || recurse) {
    const resp = await fetch(path);
    let jsonData = '';
    if (resp.ok) {
      jsonData = await resp.json();
    }
    jsonData.data.forEach((a) => {
      articleIndexData.push({ ...a });
    });
    // If there are more articles to load, load them
    if ((jsonData.total - jsonData.offset) > jsonData.limit) {
      const offset = jsonData.offset + jsonData.limit;
      const indexPath = `${ARTICLE_INDEX_PATH}?offset=${offset}&limit=${jsonData.total - offset}`;
      await loadPosts(indexPath, true);
    }
  }
  // Protected against callers modifying the objects
  const ret = [];
  if (articleIndexData) {
    articleIndexData.forEach((a) => {
      ret.push({ ...a });
    });
  }
  return ret;
}

const IGNORED_TERMS = [];

const doMatch = (property, term) => {
  const regex = new RegExp(term, 'gi');
  if (property) {
    return property.match(regex);
  }
  return false;
};

function filterData(fullTerm, data) {
  const searchTokens = [];
  searchTokens.push(fullTerm);

  searchTokens.push(...fullTerm.toLowerCase().split(/\s+/).filter((term) => term && term.length > 2 && term !== fullTerm.toLowerCase()));

  // Object
  // {
  //    priority: Number
  //    article:  article
  //    count: Number
  // }
  const results = [];
  data.forEach((result) => {
    const found = {
      article: result,
      count: 0,
    };

    searchTokens.forEach((token) => {
      if (IGNORED_TERMS.includes(token.toLowerCase().trim())) return;
      // eslint-disable-next-line no-param-reassign
      if (token.endsWith('s')) token = token.substring(0, token.length - 1); // Handle potential pluralization of token.

      if (doMatch(result.title, token)) {
        found.rank ||= 1;
        found.count += 1;
      }
      if (doMatch(result.heading, token)) {
        found.rank ||= 2;
        found.count += 1;
      }
      if (doMatch(result.description, token)) {
        found.rank ||= 3;
        found.count += 1;
      }
      if (doMatch(result.blurb, token)) {
        found.rank ||= 4;
        found.count += 1;
      }
      if (doMatch(result.text, token)) {
        found.rank ||= 5;
        found.count += 1;
      }
    });

    if (found.count > 0) {
      results.push(found);
    }
  });

  return results.sort((l, r) => {
    if (l.rank < r.rank) {
      return -1;
    }
    if (l.rank === r.rank) {
      if (l.count > r.count) {
        return -1;
      }
      if (l.count < r.count) {
        return 1;
      }
      return 0;
    }
    return 1; // Left rank is greater than right rank - move it down the list.
  }).map((r) => r.article);
}

self.onmessage = async function handleSearch(event) {
  const data = await getSearchIndexData();
  const allArticles = await loadPosts();
  const { searchValue } = event.data;
  const searchResults = filterData(searchValue, data);

  const paths = searchResults.map((r) => r.path);
  const filteredArticles = allArticles.filter((a) => paths.includes(a.path)).sort((a, b) => {
    const indexA = paths.indexOf(a.path);
    const indexB = paths.indexOf(b.path);
    return indexA - indexB;
  });
  self.postMessage({ results: filteredArticles });
};
