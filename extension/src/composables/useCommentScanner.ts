import { ref } from "vue";
import { ScanResult } from "@/types";
import { toast } from "@/shared/toast";

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
        toast({
          title: "Gagal",
          message: response?.error ?? "Tidak dapat memindai komentar",
          type: "error",
        });

        return;
      }

      results.value = response.results;
      hasScanned.value = true;

      toast({
        title: "Berhasil",
        message: `${response.results.length} komentar berhasil dipindai`,
        type: "success",
      });

      return response;
    } catch (error) {
      console.error("[SCAN EXCEPTION]", error);

      toast({
        title: "Gagal",
        message: "Terjadi kesalahan saat memindai komentar",
        type: "error",
      });
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
