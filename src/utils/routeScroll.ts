function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function scrollToTopForPageNavigation() {
  window.requestAnimationFrame(scrollToPageTop);
}

export { scrollToPageTop };
