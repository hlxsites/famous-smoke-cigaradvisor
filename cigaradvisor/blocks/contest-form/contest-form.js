export default async function decorate(block) {
  const iframeWrapper = document.createElement('div');
  iframeWrapper.id = 'vsscript_148868_314195';
  block.replaceChildren(iframeWrapper);
  const p = document.createElement('p');
  const script = document.createElement('script');
  script.async = true;
  script.type = 'text/javascript';
  script.src = 'https://app.viralsweep.com/vsa-widget-bedfd7-148868.js?sid=148868_314195';
  p.appendChild(script);
  block.appendChild(p);
}
