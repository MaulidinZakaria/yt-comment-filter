import { ref } from "vue";

type LoadingAction = "deleteSelected" | "deleteAll";

export function useCommentDelete() {
  const loading = ref<LoadingAction | null>(null);

  const deleteComments = async (
    commentIds: string[],
    loadingAction: LoadingAction,
  ) => {
    loading.value = loadingAction;

    try {
      return await chrome.runtime.sendMessage({
        action: "deleteComments",
        commentIds,
      });
    } finally {
      loading.value = null;
    }
  };

  return {
    loading,
    deleteComments,
  };
}
