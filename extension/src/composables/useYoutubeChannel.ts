import { YoutubeChannel } from "@/types";
import { ref } from "vue";

export function useYoutubeChannel() {
  const channel = ref<YoutubeChannel | null>(null);
  const loading = ref<"connect" | "switch" | "logout" | null>(null);

  const loadChannel = async () => {
    const result = await chrome.runtime.sendMessage({
      action: "getYoutubeChannel",
    });

    channel.value = result.channel;
  };

  const connectYoutube = async () => {
    loading.value = "connect";

    try {
      const result = await chrome.runtime.sendMessage({
        action: "connectYoutube",
      });

      if (result.success) {
        channel.value = result.channel;
      }
    } finally {
      loading.value = null;
    }
  };

  const logoutYoutube = async () => {
    loading.value = "logout";

    try {
      const result = await chrome.runtime.sendMessage({
        action: "logoutYoutube",
      });

      if (result.success) {
        channel.value = null;
      }
    } finally {
      loading.value = null;
    }
  };

  return {
    channel,
    loading,
    loadChannel,
    connectYoutube,
    logoutYoutube,
  };
}
