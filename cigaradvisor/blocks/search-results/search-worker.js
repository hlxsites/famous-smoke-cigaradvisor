const ARTICLE_INDEX_PATH = '/cigaradvisor/index/article-index.json';
const SEARCH_INDEX_PATH = '/cigaradvisor/index/search-index.json';

const BUCKET_SIZE = 500;
const IGNORED_TERMS = [];

async function getTotal(index) {
  const resp = await fetch(`${index}?limit=1`);
  if (resp.ok) {
    const json = await resp.json();
    return json.total;
  }
  return 0;
}

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

  return results;
}

function sortData(results) {
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

async function doSearch(value) {
  const total = await getTotal(SEARCH_INDEX_PATH);
  const promises = [];
  const buckets = Math.ceil(total / BUCKET_SIZE);

  for (let i = 0; i < buckets; i += 1) {
    promises.push(new Promise((resolve) => {
      const offset = i * BUCKET_SIZE;
      fetch(`${SEARCH_INDEX_PATH}?offset=${offset}&limit=${BUCKET_SIZE}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        })
        .then((json) => {
          const { data } = json;
          if (data) {
            resolve(filterData(value, data));
          }
          resolve([]);
        });
    }));
  }

  return Promise.all(promises).then((results) => {
    const matches = [];
    results.forEach((r) => {
      matches.push(...r);
    });
    return sortData(matches).map((m) => m.path);
  });
}

async function getArticles(paths) {
  const total = await getTotal(ARTICLE_INDEX_PATH);
  const promises = [];
  const buckets = Math.ceil(total / BUCKET_SIZE);

  for (let i = 0; i < buckets; i += 1) {
    promises.push(new Promise((resolve) => {
      const offset = i * BUCKET_SIZE;
      fetch(`${ARTICLE_INDEX_PATH}?offset=${offset}&limit=${BUCKET_SIZE}`)
        .then((resp) => {
          if (resp.ok) {
            return resp.json();
          }
          return {};
        })
        .then((json) => {
          const { data } = json;
          if (data) {
            resolve(data.filter((a) => paths.includes(a.path)));
          }
          resolve([]);
        });
    }));
  }
  return Promise.all(promises).then((results) => {
    const matches = [];
    results.forEach((a) => {
      matches.push(...a);
    });
    return matches;
  });
}

onmessage = async function handleSearch(event) {
  const { searchValue } = event.data;
  const paths = await doSearch(searchValue);
  const found = await getArticles(paths);

  found.sort((a, b) => {
    const indexA = paths.indexOf(a.path);
    const indexB = paths.indexOf(b.path);
    return indexA - indexB;
  });
  postMessage({ results: found });
};
