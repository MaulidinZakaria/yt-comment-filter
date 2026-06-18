import { currentIsEnabled, isUpdating } from "../state";

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
  const waitForComments = window.setInterval(() => {
    const commentsContainer = document.querySelector("#comments");

    if (!commentsContainer) return;

    clearInterval(waitForComments);

    const observer = new MutationObserver((mutations) => {
      if (!currentIsEnabled) return;
      if (isUpdating) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) {
            continue;
          }

          const isCommentNode =
            node.matches("ytd-comment-renderer") ||
            node.matches("ytd-comment-thread-renderer") ||
            node.querySelector("ytd-comment-renderer") ||
            node.querySelector("ytd-comment-thread-renderer");

          if (isCommentNode) {
            scheduleStableScan();
            return;
          }
        }
      }
    });

    observer.observe(commentsContainer, {
      childList: true,
      subtree: true,
    });

    // console.log("[Comment Filter] Observer initialized");
  }, 500);

  initializeSortMenuObserver();
}

function initializeSortMenuObserver() {
  const sortMenu =
    document.querySelector("ytd-comments-header-renderer") ||
    document.querySelector("ytd-sort-filter-sub-menu-renderer");

  if (!sortMenu) return;

  sortMenu.addEventListener("click", () => {
    scheduleStableScan();
  });
}
