import {
  clearPredictionCache,
  currentIsEnabled,
  isUpdating,
  resetCommentUI,
} from "../state";

import { scanAndQueue } from "../filters/comment-filter";

function scheduleStableScan() {
  clearTimeout((window as any).__commentScanTimer);

  (window as any).__commentScanTimer = window.setTimeout(() => {
    if (!currentIsEnabled) return;
    if (isUpdating) return;

    scanAndQueue();
  }, 100);
}

export function initializeObserver() {
  const waitForComments = setInterval(() => {
    const commentsContainer = document.querySelector("ytd-comments, #comments");

    if (!commentsContainer) return;

    clearInterval(waitForComments);

    const observer = new MutationObserver(() => {
      if (!currentIsEnabled) return;
      if (isUpdating) return;

      scheduleStableScan();
    });

    observer.observe(commentsContainer, {
      childList: true,
      subtree: true,
    });

    // 🔥 SORT CHANGE HOOK (INI YANG SUDAH BENAR)
    initializeSortObserver(() => {
      console.log("[SORT CHANGE DETECTED]");

      clearPredictionCache();
      resetCommentUI(); // clear label lama
      scheduleStableScan(); // rescan semua
    });
  }, 500);
}

function getSortMode(): string {
  return (
    document.querySelector("tp-yt-paper-button#label")?.textContent?.trim() ??
    ""
  );
}

export function initializeSortObserver(onChange: () => void) {
  const wait = setInterval(() => {
    const container =
      document.querySelector("ytd-comments-header-renderer") ||
      document.querySelector("#sort-menu") ||
      document.body;

    if (!container) return;

    clearInterval(wait);

    let lastSort = getSortMode();

    const observer = new MutationObserver(() => {
      const currentSort = getSortMode();

      if (!currentSort) return;

      if (currentSort !== lastSort) {
        lastSort = currentSort;

        console.log("[SORT CHANGE]", currentSort);

        onChange();
      }
    });

    observer.observe(container, {
      subtree: true,
      childList: true,
    });
  }, 500);
}
