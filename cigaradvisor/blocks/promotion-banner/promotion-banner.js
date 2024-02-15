// noinspection JSUnusedGlobalSymbols

import { readBlockConfig } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const sheetURL = '/cigaradvisor/promotions.json?sheet=promotions';

let promotions;

async function fetchPromotions() {
  try {
    // fetch the JSON data
    const response = await fetch(sheetURL);

    if (!response.ok) {
      promotions = [];
      return;
    }

    const { data } = await response.json();
    promotions = data;
  } catch (error) {
    promotions = []; // so we don't try to fetch again
  }
}

function convertToDate(input) {
  if (!input || Number.isNaN(+input)) {
    return null;
  }

  // from https://github.com/adobe/helix-sidekick-extension/blob/main/src/extension/view/json.js#L31
  const date = +input > 99999
    ? new Date(+input * 1000)
    : new Date(Math.round((+input - (1 + 25567 + 1)) * 86400 * 1000));

  return date.toString() !== 'Invalid Date' ? date : null;
}

async function getActivePromotions(group) {
  // fetch promotions once, otherwise use cached version
  if (!promotions) {
    await fetchPromotions();
  }

  const date = Date.now();
  return promotions.filter((item) => {
    // check position
    if (item.group.toLocaleLowerCase() !== group.toLocaleLowerCase()) {
      return false;
    }

    // check dates
    const dateFrom = convertToDate(item['start date']);
    const dateTo = convertToDate(item['end date']);
    return (!dateFrom || dateFrom <= date) && (!dateTo || dateTo >= date);
  });
}

async function loadPromotionContent(url) {
  if (!url) {
    return null;
  }
  let path = url;
  if (!(path.charAt(0) === '/')) {
    path = new URL(url).pathname;
  }
  const fragment = await loadFragment(path);
  return fragment ? fragment.querySelector('main > .section .block') : null;
}

export default async function decorate(block) {
  // read block config
  const configs = readBlockConfig(block);
  const { group } = configs;
  block.innerHTML = '';

  // fetch promotion
  const activePromotions = await getActivePromotions(group);
  if (!activePromotions.length) {
    return;
  }
  const promotion = activePromotions[Math.floor(Math.random() * activePromotions.length)];

  await loadPromotionContent(promotion.content).then((content) => {
    if (content) block.parentElement.replaceWith(content);
  });
}
