// noinspection JSUnusedGlobalSymbols

import { createOptimizedPicture, readBlockConfig } from '../../scripts/aem.js';
import { isInternal } from '../../scripts/scripts.js';

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

function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({
      width: img.width,
      height: img.height,
    });
    img.onerror = (error) => reject(error);
    img.src = url;
  });
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

  // create anchor
  const anchor = document.createElement('a');

  // add image and CLS placeholder
  const picture = createOptimizedPicture(promotion.image, promotion.alt || '');
  const img = await getImageDimensions(promotion.image);
  const ratio = (parseInt(img.height, 10) / parseInt(img.width, 10)) * 100;
  // noinspection JSUnresolvedVariable
  picture.style.paddingBottom = `${ratio}%`;
  anchor.style.maxWidth = `${img.width}px`;
  anchor.append(picture);

  // populate anchor
  anchor.setAttribute('href', promotion.url);
  anchor.setAttribute('target', !isInternal(promotion.url) ? '_blank' : '_self');
  anchor.setAttribute('title', promotion.alt);

  block.appendChild(anchor);
}
