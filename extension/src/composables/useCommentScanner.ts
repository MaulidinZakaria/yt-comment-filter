import { ref } from "vue";
import { ScanResult } from "@/types";

export function useCommentScanner() {
  const loading = ref(false);

  const results = ref<ScanResult[]>([]);

  const hasScanned = ref(false);

  const loadPreviousScan = async (videoId: string) => {
    const scanResults = await chrome.runtime.sendMessage({
      action: "getScanResults",
    });

    if (!scanResults) return;

    if (scanResults.videoId === videoId) {
      results.value = scanResults.results ?? [];

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
