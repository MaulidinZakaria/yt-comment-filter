import { ref } from "vue";

export function useCommentCorrection() {
  const loading = ref(false);

  const markAsSafe = async (commentIds: string[]) => {
    loading.value = true;

    try {
      return await chrome.runtime.sendMessage({
        action: "markAsSafe",
        commentIds,
      });
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    markAsSafe,
  };
}
