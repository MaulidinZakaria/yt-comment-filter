import { YoutubeVideo } from "@/types";
import { ref } from "vue";

export function useOwnerVideos() {
  const videos = ref<YoutubeVideo[]>([]);
  const loading = ref(false);

  const loadVideos = async () => {
    loading.value = true;

    try {
      const result = await chrome.runtime.sendMessage({
        action: "getOwnerVideos",
      });

      if (result.success) {
        videos.value = result.videos;
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    videos,
    loading,
    loadVideos,
  };
}
