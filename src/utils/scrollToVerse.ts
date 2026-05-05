const TARGET_HIGHLIGHT_CLASS = 'animate-pulse-gold';
const HIGHLIGHT_DURATION_MS = 3000;
const RETRY_DELAY_MS = 120;

function getVerseSelector(verseKey: string) {
  const escapedVerseKey = verseKey.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return `[data-verse-key="${escapedVerseKey}"]`;
}

function getViewportPadding() {
  const isMobile = window.innerWidth < 1024;

  return {
    top: isMobile ? 96 : 128,
    bottom: isMobile ? 190 : 132,
  };
}

function scrollElementIntoReadingView(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  const { top, bottom } = getViewportPadding();
  const availableHeight = Math.max(240, window.innerHeight - top - bottom);
  const targetTop = rect.height <= availableHeight
    ? absoluteTop - top - ((availableHeight - rect.height) / 2)
    : absoluteTop - top - 16;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: 'smooth',
  });
}

function highlightElement(element: HTMLElement) {
  element.classList.remove(TARGET_HIGHLIGHT_CLASS);
  window.requestAnimationFrame(() => {
    element.classList.add(TARGET_HIGHLIGHT_CLASS);
    window.setTimeout(() => element.classList.remove(TARGET_HIGHLIGHT_CLASS), HIGHLIGHT_DURATION_MS);
  });

  element.focus({ preventScroll: true });
}

export function scrollToVerse(verseKey: string, attempts = 20) {
  const element = document.querySelector<HTMLElement>(getVerseSelector(verseKey));

  if (element) {
    scrollElementIntoReadingView(element);
    window.setTimeout(() => highlightElement(element), 350);
    return true;
  }

  if (attempts > 0) {
    window.setTimeout(() => scrollToVerse(verseKey, attempts - 1), RETRY_DELAY_MS);
  }

  return false;
}
