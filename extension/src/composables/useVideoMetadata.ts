import { ref } from "vue";
import type { VideoMetadata } from "@/types";
import { getVideoMetadata } from "@/content/services/video-metadata-service";

export function useVideoMetadata() {
  const video = ref<VideoMetadata | null>(null);

  const loading = ref(false);

  const loadVideoMetadata = async () => {
    loading.value = true;

    try {
      video.value = await getVideoMetadata();
    } finally {
      loading.value = false;
    }
  };

  const startMetadataListener = () => {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;

      const newVal = changes.currentVideoMetadata?.newValue as
        | VideoMetadata
        | undefined;

      if (!newVal) return;

      video.value = newVal;

      loading.value = !newVal.channelName;
    });
  };

  return {
    video,
    loading,
    loadVideoMetadata,
    startMetadataListener,
  };
}
