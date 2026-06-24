import { injectStyles } from "./dom/comment-style";
import { initializeObserver } from "./dom/observer";

import { getSettings } from "./storage";
import { initializeMessageListener } from "./message-listener";

import { setRole, setFilterMode, setIsEnabled } from "./state";

import { scanAndQueue } from "./filters/comment-filter";
import { initVideoResetListener, initVideoWatcher } from "./dom/video-watcher";
import {
  extractVideoMetadata,
  watchShorts,
} from "./services/video-metadata-service";

let lastUrl = location.href;

async function initializeContentScript() {
  injectStyles();

  const settings = await getSettings();

  setRole(settings.role);

  setFilterMode(settings.filterMode);
  setIsEnabled(settings.isEnabled);

  initializeMessageListener();

  setTimeout(() => {
    initializeObserver();
  }, 1000);

  watchRouteChange();
  watchShorts();

  initVideoWatcher();
  initVideoResetListener();

  setTimeout(() => {
    if (settings.role === "viewer") {
      scanAndQueue(settings.role, settings.filterMode);
    }
  }, 100);
}

initializeContentScript();

export function watchRouteChange() {
  const observer = new MutationObserver(async () => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    // ✅ Shorts dihandle sepenuhnya oleh watchShorts
    if (location.pathname.startsWith("/shorts")) return;

    const metadata = extractVideoMetadata();
    await chrome.storage.local.set({ currentVideoMetadata: metadata });
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
  });
}
