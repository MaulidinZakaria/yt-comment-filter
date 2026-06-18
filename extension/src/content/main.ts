import { injectStyles } from "./dom/comment-style";
import { initializeObserver } from "./dom/observer";

import { getSettings } from "./storage";
import { initializeMessageListener } from "./message-listener";

import { setRole, setFilterMode, setIsEnabled } from "./state";

import { scanAndQueue } from "./filters/comment-filter";
import { initVideoResetListener, initVideoWatcher } from "./dom/video-watcher";

async function initializeContentScript() {
  injectStyles();

  const settings = await getSettings();

  setRole(settings.role);

  setFilterMode(settings.filterMode);
  setIsEnabled(settings.isEnabled);

  initializeMessageListener();

  initializeObserver();

  initVideoWatcher();
  initVideoResetListener();

  setTimeout(() => {
    if (settings.role === "viewer") {
      scanAndQueue(settings.role, settings.filterMode);
    }
  }, 100);
}

initializeContentScript();
