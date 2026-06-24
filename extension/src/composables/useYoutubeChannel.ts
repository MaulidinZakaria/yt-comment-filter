import { toast } from "@/shared/toast";
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

        toast({
          title: "Berhasil",
          message: "Channel YouTube berhasil terhubung",
          type: "success",
        });
      } else {
        toast({
          title: "Gagal",
          message: result.error ?? "Tidak dapat menghubungkan akun YouTube",
          type: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal",
        message: "Terjadi kesalahan saat menghubungkan akun",
        type: "error",
      });
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
      } else {
        toast({
          title: "Gagal",
          message: result.error ?? "Tidak dapat keluar dari akun",
          type: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Gagal",
        message: "Terjadi kesalahan saat logout",
        type: "error",
      });
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
