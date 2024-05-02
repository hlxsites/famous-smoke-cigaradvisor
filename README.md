# Famous Smoke Cigar Advisor

Edge Delivery Services implementing https://www.famous-smoke.com/cigaradvisor

## Environments
- Preview: https://main--famous-smoke-cigaradvisor--hlxsites.aem.page/cigaradvisor/
- Live: https://main--famous-smoke-cigaradvisor--hlxsites.aem.live/cigaradvisor/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
``` 

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/aem-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Import

Checkout the [import](https://github.com/hlxsites/famous-smoke-cigaradvisor/tree/import) branch to import content 
