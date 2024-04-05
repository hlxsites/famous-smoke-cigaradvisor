async function publishUrl(url) {
  const response = await fetch(url, {
    method: 'POST'
  });
  return response.status;
}
async function publish() {
  const response = await fetch('https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page/cigaradvisor/index/search-index.json?limit=10000');
  if (response.ok) {
    const articles = await response.json();
    const total = articles['total'];
    console.log(`Publishing ${total} articles`)
    var published = 0;
    for (let article of articles.data) {
      const url = `https://admin.hlx.page/live/hlxsites/famous-smoke-cigaradvisor/main${article.path}`;
      const status = await publishUrl(url);
      if (status === 200) {
        console.log(`Published ${url} (${++published}/${total})`);
      } else {
        console.log(`Failed to published ${url} with status ${status} (${++published}/${total})`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } else {
    console.log(`Failed to fetch search-index.json ${response.status}`)
  }
}

await publish();

