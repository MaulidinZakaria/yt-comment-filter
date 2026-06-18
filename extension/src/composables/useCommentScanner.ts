import { ref } from "vue";

export function useCommentScanner() {
  const loading = ref(false);

  const results = ref<any[]>([]);

  const hasScanned = ref(false);

  const loadPreviousScan = async (videoId: string) => {
    const scanData = await chrome.runtime.sendMessage({
      action: "getScanResults",
    });

    if (!scanData) return;

    if (scanData.videoId === videoId) {
      results.value = scanData.results ?? [];

      hasScanned.value = true;
    }
  };

  const scanVideo = async (videoId: string) => {
    loading.value = true;

    try {
      const response = await chrome.runtime.sendMessage({
        action: "scanVideo",
        videoId,
      });

      if (!response?.success) {
        console.error("[SCAN FAILED]", response?.error);

        return;
      }

      results.value = response.results;

      hasScanned.value = true;

      return response;
    } catch (error) {
      console.error("[SCAN EXCEPTION]", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    results,
    hasScanned,
    scanVideo,
    loadPreviousScan,
  };
}
