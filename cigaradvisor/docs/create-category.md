# Creating a new category

In order to create a new category both code changes and content changes are needed. The following document will elaborate these in more detail.

All the necessary code changes are also captured in [this example PR](https://github.com/hlxsites/famous-smoke-cigaradvisor/pull/288). 

## Step 1: Create index configuration

The configurations for the indices are located in [helix-query.yaml](../../helix-query.yaml).
In here you just need to copy one of the existing category indices and replace all name occurrences:

```diff
@@ -259,6 +259,12 @@
     exclude: *excludes
     target: /cigaradvisor/index/article-index-cuban-cigar-guides.json
     properties: *articles_properties
+  <new-category>:
+    include:
+      - /cigaradvisor/<new-category>/*
+    exclude: *excludes
+    target: /cigaradvisor/index/article-index-cuban-cigar-guides.json
+    properties: *articles_properties
   uncategorized:
     include:
       - /cigaradvisor/uncategorized/*
```

The `pages`, `categories`, `authors` and `article` indices also contain a list of all the category paths in either their `includes` or `excludes`. Add the path of the new category (matching the structure of the other categories) to all of these lists.

## Step 2: Create sitemap configuration

The configurations for the indices are located in [helix-sitemap.yaml](../../helix-sitemap.yaml).
In here you just need to copy one of the existing category indices and replace all name occurrences:

```diff
@@ -59,6 +59,11 @@
     source: /cigaradvisor/index/article-index-cuban-cigar-guides.json
     destination: /cigaradvisor/article-sitemap-cuban-cigar-guides.xml
     lastmod: YYYY-MM-DD hh:mm:ss
+  <new-category>:
+    origin: https://www.famous-smoke.com
+    source: /cigaradvisor/index/article-index-<new-category>.json
+    destination: /cigaradvisor/article-sitemap-<new-category>.xml
+    lastmod: YYYY-MM-DD hh:mm:ss
   uncategorized:
     origin: https://www.famous-smoke.com
     source: /cigaradvisor/index/article-index-uncategorized.json

```

## Step 3: Apply the configuration changes

After merging the configuration / code changes to the `main` branch, the code-pipeline will apply your changes and register the new index and sitemap.

## Step 4: Create sharepoint files

Within Sharepoint you need to create a new directory with the same name as the category itself in the [cigaradvisor directory](https://famoussmokeshop.sharepoint.com/:f:/r/sites/AEM/webroot/www/cigaradvisor/cigaradvisor?csf=1&web=1&e=itmkNa).

In the same parent folder you also need to create a new file for the category page. The easiest way to do so is duplicating one of the existing category pages and modifying the name and content to fit the new category. Furthermore, remember to also preview and publish this file.

## Step 5: Publish new articles

Now you should be all set to create and publish new pages in your previously created category directory.

After publishing, they should appear in the corresponding index and sitemap (it may take a moment to generate these):

- `https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page/cigaradvisor/index/article-index-<new-category>.json`
- `https://main--famous-smoke-cigaradvisor--hlxsites.hlx.page/cigaradvisor/article-sitemap-<new-category>.xml`
