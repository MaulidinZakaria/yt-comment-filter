import { VideoMetadata } from "@/types";

export function extractVideoMetadata(): VideoMetadata {
  const videoId = new URLSearchParams(window.location.search).get("v") ?? "";

  const title =
    document.querySelector("ytd-watch-metadata h1")?.textContent?.trim() ?? "";

  const channelName =
    document.querySelector("#channel-name a")?.textContent?.trim() ?? "";

  return {
    videoId,
    title,
    channelName,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
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
