export default async function decorate(block) {
  const iframe = document.createElement('iframe');
  const link = block.querySelector('a')?.getAttribute('href');
  iframe.src = link;
  iframe.setAttribute('frameborder', 0);
  const options = {
    root: null,
    rootMargin: '20%',
    threshold: 1.0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.replaceChildren(iframe);
        const height = iframe.contentDocument.body.scrollHeight;
        iframe.style.height = `${height} px`;
        observer.unobserve(block);
      }
    });
  }, options);

  observer.observe(block);
}
