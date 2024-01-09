import { readBlockConfig } from '../../scripts/aem.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);
  const iframeWrapper = document.createElement('div');
  iframeWrapper.id = config.formid;
  block.replaceChildren(iframeWrapper);
  const p = document.createElement('p');
  function loadScript() {
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = config.formurl;
    p.appendChild(script);
  }
  block.appendChild(p);
  setTimeout(loadScript, 3000);
}
