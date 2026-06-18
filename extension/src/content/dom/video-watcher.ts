let lastVideoId: string | null = null;

function getVideoId() {
  const url = new URL(location.href);
  return url.searchParams.get("v");
}

export function initVideoWatcher() {
  chrome.runtime.sendMessage({
    type: "RESET_STATS",
  });

  lastVideoId = getVideoId();

  setInterval(() => {
    const currentVideoId = getVideoId();

    if (currentVideoId && currentVideoId !== lastVideoId) {
      lastVideoId = currentVideoId;

      chrome.runtime.sendMessage({
        type: "RESET_STATS",
      });

      chrome.runtime.sendMessage({
        type: "BATCH_END",
      });
    }
  }, 500);
}

export function initVideoResetListener() {
  window.addEventListener("yt-navigate-finish", () => {
    chrome.runtime.sendMessage({
      type: "RESET_STATS",
    });

    chrome.runtime.sendMessage({
      type: "BATCH_END",
    });
  });
}
