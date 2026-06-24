import { VideoMetadata } from "@/types";

const shortsChannelCache: Record<string, string> = {};
let lastVideoId = "";

function getVideoId(): string {
  const url = new URL(location.href);

  const v = url.searchParams.get("v");
  if (v) return v;

  const shortsMatch = url.pathname.match(/shorts\/([^/?]+)/);

  if (shortsMatch) {
    return shortsMatch[1];
  }

  return "";
}

function watchShortsChannel() {
  const videoId = getVideoId();
  if (!videoId) return;

  let saved = false;

  const tryFind = (): boolean => {
    const renderer = document.querySelector("ytd-reel-video-renderer");

    if (!renderer) return false;

    const shortsHref =
      renderer.querySelector("a[href*='/shorts/']")?.getAttribute("href") ?? "";

    if (!shortsHref.includes(videoId)) {
      return false;
    }

    const channelHref =
      renderer.querySelector("a[href*='/@']")?.getAttribute("href") ?? "";

    const channel = channelHref.match(/@([^/]+)/)?.[1];

    if (!channel) {
      return false;
    }

    if (!saved) {
      saved = true;

      shortsChannelCache[videoId] = channel;

      const metadata = extractVideoMetadata();

      chrome.storage.local.set({
        currentVideoMetadata: metadata,
      });
    }

    return true;
  };

  setTimeout(() => {
    if (tryFind()) return;

    const observer = new MutationObserver(() => {
      if (tryFind()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });

    setTimeout(() => observer.disconnect(), 10000);
  }, 200);
}

export function watchShorts() {
  watchShortsChannel();

  const observer = new MutationObserver(() => {
    const vid = getVideoId();

    if (vid !== lastVideoId) {
      lastVideoId = vid;

      chrome.storage.local.set({
        currentVideoMetadata: {
          videoId: vid,
          title: "",
          channelName: "",
          thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        },
      });

      watchShortsChannel();
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}

export function extractVideoMetadata(): VideoMetadata {
  const isShorts = location.pathname.startsWith("/shorts");

  if (isShorts) {
    const videoId = getVideoId();

    const title =
      Array.from(document.querySelectorAll(".ytp-title-link"))
        .find((el) => el.getAttribute("href")?.includes(videoId))
        ?.textContent?.trim() ?? "";

    const channelName = shortsChannelCache[videoId] ?? "";

    return {
      videoId,
      title,
      channelName,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const videoId = getVideoId();

  const title =
    document.querySelector("ytd-watch-metadata h1")?.textContent?.trim() ?? "";

  const channelName =
    document.querySelector("#channel-name a")?.textContent?.trim() ?? "";

  return {
    videoId,
    title,
    channelName,
    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "",
  };
}

export async function getVideoMetadata() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return chrome.tabs.sendMessage(tab.id!, {
    action: "GET_VIDEO_METADATA",
  });
}
