import { ref, onMounted, onUnmounted } from "vue";

export function useCommentStats() {
  const judolCount = ref(0);
  const scannedCount = ref(0);
  const loading = ref(true);

  const messageListener = (message: any) => {
    if (message.type === "COMMENT_STATS_UPDATED") {
      judolCount.value = message.judolCount ?? 0;
      scannedCount.value = message.scannedCount ?? 0;
    }

    if (message.type === "COMMENT_STATS_STATUS") {
      loading.value = message.status === "loading";
    }
  };

  const fetchInitial = async () => {
    const stats = await chrome.runtime.sendMessage({
      type: "GET_COMMENT_STATS",
    });

    judolCount.value = stats?.judolCount ?? 0;
    scannedCount.value = stats?.scannedCount ?? 0;

    loading.value = false;
  };

  onMounted(async () => {
    chrome.runtime.onMessage.addListener(messageListener);

    await fetchInitial();
  });

  onUnmounted(() => {
    chrome.runtime.onMessage.removeListener(messageListener);
  });

  return {
    judolCount,
    scannedCount,
    loading,
  };
}
