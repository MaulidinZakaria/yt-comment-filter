<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

import ChannelCard from "@/components/owner/ChannelCard.vue";
import CommentResultTable from "@/components/owner/CommentResultTable.vue";
import StatisticsCard from "@/components/owner/StatisticsCard.vue";
import VideoSelector from "@/components/owner/VideoSelector.vue";

import { useYoutubeChannel } from "@/composables/useYoutubeChannel";
import { useOwnerVideos } from "@/composables/useOwnerVideos";
import { useCommentScanner } from "@/composables/useCommentScanner";
import { useCommentDelete } from "@/composables/useCommentDelete";

import { exportJudolCsv } from "@/utils/export-csv";
import { YoutubeVideo } from "@/types";
import { BadgeCheck, CircleUser, Download, Info, SearchAlert, ShieldCheck, Trash } from "lucide-vue-next";
import BaseSpinner from "@/components/BaseSpinner.vue";
import { useCommentCorrection } from "@/composables/useCommentCorrection";
import { toast } from "@/shared/toast";
import { confirm } from "@/shared/confirm";

/**
 * COMPOSABLES
 */
const {
  channel,
  loading,
  loadChannel,
  connectYoutube,
  logoutYoutube,
} = useYoutubeChannel();

const {
  videos,
  loading: loadingVideos,
  loadVideos,
} = useOwnerVideos();

const {
  loading: scanLoading,
  results,
  scanVideo,
  hasScanned,
  loadPreviousScan
} = useCommentScanner();

const {
  deleteComments,
  loading: deleteLoading,
} = useCommentDelete();

const {
  loading: markAsSafeLoading,
  markAsSafe,
} = useCommentCorrection()

/**
 * STATE
 */
const selectedVideoId = ref("");
const selectedVideoTitle = ref("");

const search = ref("");

const selectedCommentIds = ref<string[]>([]);

/**
 * LIFECYCLE
 */
onMounted(async () => {
  await loadChannel();
});


watch(
  () => channel.value?.connected,
  async (connected) => {
    if (!connected) return;

    await loadVideos();

    if (!videos.value.length) return;

    const data =
      await chrome.storage.local.get([
        "selectedVideoId",
        "selectedVideoTitle",
      ]) as {
        selectedVideoId?: string;
        selectedVideoTitle?: string;
      };

    const savedVideo = videos.value.find(
      (v) =>
        v.videoId === data.selectedVideoId,
    );

    if (savedVideo) {
      selectedVideoId.value =
        savedVideo.videoId;

      selectedVideoTitle.value =
        savedVideo.title;
    } else {
      selectedVideoId.value =
        videos.value[0].videoId;

      selectedVideoTitle.value =
        videos.value[0].title;
    }

    await nextTick();

    document
      .getElementById(
        `video-${selectedVideoId.value}`,
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

    await loadPreviousScan(
      selectedVideoId.value,
    );
  },
  {
    immediate: true,
  },
);


/**
 * COMPUTED
 */
const judolResults = computed(() =>
  results.value.filter(
    (item) => item.prediction === "judol",
  ),
);

const normalCount = computed(
  () =>
    results.value.filter(
      (item) => item.prediction === "normal",
    ).length,
);

const judolCount = computed(
  () =>
    results.value.filter(
      (item) => item.prediction === "judol",
    ).length,
);

const stats = computed(() => [
  {
    label: "Total",
    value: results.value.length,
    subtitle: "Terdeteksi",
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
  },
  {
    label: "Normal",
    value: normalCount.value,
    subtitle: "Aman",
    colorClass: "text-(--success)",
    bgClass: "bg-(--success)/10",
    borderClass: "border-(--success)/20",
  },
  {
    label: "Judol",
    value: judolCount.value,
    subtitle: "Indikasi",
    colorClass: "text-(--danger)",
    bgClass: "bg-(--danger)/10",
    borderClass: "border-(--danger)/20",
  },
]);

const globalLoading = computed(() =>
  scanLoading.value ||
  markAsSafeLoading.value ||
  deleteLoading.value === 'deleteSelected' ||
  deleteLoading.value === 'deleteAll',
);

/**
 * VIDEO
 */
const handleSelectedVideo = async (
  video: YoutubeVideo,
) => {
  selectedVideoId.value =
    video.videoId;

  selectedVideoTitle.value =
    video.title;

  await chrome.storage.local.set({
    selectedVideoId: video.videoId,
    selectedVideoTitle: video.title
  });
};

const handleScan = async () => {
  if (!selectedVideoId.value) {
    return;
  }

  await scanVideo(
    selectedVideoId.value,
  );
};

/**
 * EXPORT
 */
const handleExportCsv = () => {
  try {
    exportJudolCsv(
      results.value,
      selectedVideoTitle.value,
    );

    toast({
      title: "Berhasil",
      message: "Data berhasil diexport ke CSV",
      type: "success",
    });
  } catch (error) {
    toast({
      title: "Gagal",
      message:
        error instanceof Error
          ? error.message
          : "Tidak dapat membuat file CSV",
      type: "error",
    });
  }
};

/**
 * SELECTION
 */
const toggleSelectAll = () => {
  const judolIds = judolResults.value.map(
    (item) => item.commentId,
  );

  const allSelected =
    selectedCommentIds.value.length ===
    judolIds.length &&
    judolIds.every((id) =>
      selectedCommentIds.value.includes(id),
    );

  if (allSelected) {
    selectedCommentIds.value = [];
    return;
  }

  selectedCommentIds.value = [...judolIds];
};

/**
 * DELETE
 */

const handleDeleteSelected = async () => {
  const count =
    selectedCommentIds.value.length;

  if (count === 0) return;

  const confirmed = await confirm({
    title: "Hapus Komentar",
    message: `Yakin ingin menghapus ${count} komentar?`,
    confirmText: "Hapus",
    cancelText: "Batal",
    type: "error"
  });

  if (!confirmed) return;

  const result = await deleteComments(
    selectedCommentIds.value,
    "deleteSelected",
  );

  if (!result.success) {
    toast({
      title: "Gagal",
      message: "Terjadi kesalahan saat menghapus komentar",
      type: "error",
    });
    return;
  }

  toast({
    title: "Berhasil",
    message: `${count} komentar berhasil dihapus`,
    type: "success",
  });

  await loadPreviousScan(
    selectedVideoId.value,
  );

  selectedCommentIds.value = [];
};

const handleDeleteAll = async () => {
  const commentIds = judolResults.value.map(
    (item) => item.commentId,
  );

  const confirmed = await confirm({
    title: "Hapus Semua Komentar",
    message: `Yakin ingin menghapus ${commentIds.length} komentar yang terdeteksi?`,
    confirmText: "Hapus",
    cancelText: "Batal",
    type: "error"
  });

  if (!confirmed) return;

  const result = await deleteComments(
    commentIds,
    "deleteAll",
  );

  if (!result.success) {
    toast({
      title: "Gagal",
      message: "Terjadi kesalahan saat menghapus komentar",
      type: "error",
    });
    return;
  }

  toast({
    title: "Berhasil",
    message: `${commentIds.length} komentar berhasil dihapus`,
    type: "success",
  });

  await loadPreviousScan(
    selectedVideoId.value,
  );

  selectedCommentIds.value = [];
};

const handleMarkAsSafe = async () => {
  const count =
    selectedCommentIds.value.length;

  if (count === 0) return;

  const confirmed = await confirm({
    title: "Tandai Komentar Aman",
    message: `Yakin ingin menandai ${count} komentar sebagai aman?`,
    confirmText: "Tandai Aman",
    cancelText: "Batal",
    type: "info"
  });

  if (!confirmed) return;

  const result = await markAsSafe(
    selectedCommentIds.value,
  );

  if (!result.success) {
    toast({
      title: "Gagal",
      message: "Terjadi kesalahan saat menandai aman komentar",
      type: "error",
    });
    return;
  }

  toast({
    title: "Berhasil",
    message: `${count} komentar berhasil ditandai aman`,
    type: "success",
  });

  await loadPreviousScan(
    selectedVideoId.value,
  );

  selectedCommentIds.value = [];
};
</script>

<template>
  <div v-if="channel === null" class="p-4 mb-2 flex flex-col gap-4 justify-center items-start">
    <div class="flex flex-col">
      <p class="text-(--foreground) font-bold text-xl">
        Owner Mode
      </p>
      <p class="text-(--foreground)/80">
        Kelola dan moderasi komentar pada video di channel Anda.
      </p>
    </div>
    <div
      class="flex flex-col items-center justify-center w-full p-4 bg-(--surface) shadow-md rounded-lg border border-(--outline) gap-4">
      <div class="p-3 bg-primary rounded-full text-on-primary">
        <CircleUser :size="28" />
      </div>
      <div class="flex flex-col items-center justify-center px-8">
        <p class="text-base font-medium">Belum Terhubung</p>
        <p class="text-center text-(--foreground)/80">Otorisasi akun YouTube Anda untuk mulai memindai komentar.</p>
      </div>
      <button @click="connectYoutube" :disabled="loading === 'connect'"
        class="w-full flex justify-center items-center gap-2 p-3 bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/80 hover:shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed!">
        <ShieldCheck v-if="loading !== 'connect'" :size="20" />
        <BaseSpinner v-else class="size-5" />
        <p class="text-sm font-semibold">
          {{ loading === "connect" ? "Connecting..." : "Otorisasi Akun Google" }}
        </p>
      </button>
    </div>
    <div class="flex items-center  w-full p-4 bg-primary/5 rounded-lg border border-(--outline) gap-3">
      <div>
        <Info :size="20" class="text-primary" />
      </div>
      <div class="text-(--foreground)">
        Status pemindaian saat ini: <span class="font-bold">Menunggu Otorisasi</span>
      </div>
    </div>
  </div>
  <div v-else class="p-4 mb-2 flex flex-col gap-4 justify-center items-start">
    <div class="flex flex-col">
      <p class="text-(--foreground) font-bold text-xl">
        Owner Mode
      </p>
      <p class="text-(--foreground)/80">
        Kelola dan moderasi komentar pada video di channel Anda.
      </p>
    </div>
    <ChannelCard :channel="channel!" :loading="loading" @logout="logoutYoutube" />
    <VideoSelector :videos="videos" :loading="loadingVideos" :search="search" :selected-video-id="selectedVideoId"
      @update:search="search = $event" @select="handleSelectedVideo" />
    <button @click="handleScan" :disabled="scanLoading || !selectedVideoId"
      class="w-full flex justify-center items-center gap-2 p-3 bg-primary rounded-lg shadow-lg text-on-primary hover:bg-primary/70 transition-colors duration-200 disabled:bg-primary/50 disabled:cursor-not-allowed">
      <SearchAlert v-if="!scanLoading" :size="20" />
      <BaseSpinner v-else class="size-5" />
      <p class="text-sm font-semibold">Scan Komentar</p>
    </button>
    <div class="flex flex-col">
      <p class="text-lg font-medium text-(--foreground)/90">
        Status Moderasi
      </p>
      <p class="text-(--foreground)/80">
        Ringkasan hasil dari video yang dipilih.
      </p>
    </div>
    <div class="w-full grid grid-cols-3 gap-3">
      <StatisticsCard v-for="stat in stats" :stat="stat" :loading="scanLoading" />
    </div>
    <div class="w-full flex gap-3 justify-center items-center">
      <button @click="handleExportCsv" :disabled="judolResults.length === 0"
        class="flex-1 w-full flex justify-center items-center gap-2 p-3 bg-primary/20 rounded-lg shadow-lg text-primary hover:bg-primary/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed!">
        <Download :size="18" />
        <p class="text-xs font-semibold">Download CSV</p>
      </button>
      <button @click="handleDeleteAll" :disabled="judolResults.length === 0"
        class="flex-1 w-full flex justify-center items-center gap-2 py-3 px-2 bg-(--danger)/20 text-(--danger) rounded-lg shadow-lg hover:bg-(--danger)/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed!">
        <BaseSpinner v-if="deleteLoading === 'deleteAll'" class="size-4" />
        <Trash v-else :size="18" />
        <p class="text-xs font-semibold">Hapus Semua Judol</p>
      </button>
    </div>
    <CommentResultTable :scan-loading="globalLoading" :has-scanned="hasScanned" :judol-results="judolResults"
      :selected-comment-ids="selectedCommentIds" @update:selectedCommentIds="
        selectedCommentIds = $event
        " @toggleSelectAll="toggleSelectAll" />
    <div class="w-full flex gap-3 justify-center items-center">
      <button @click="handleDeleteSelected"
        :disabled="judolResults.length === 0 || selectedCommentIds.length === 0 || deleteLoading === 'deleteSelected'"
        class="flex-1 w-full flex justify-center items-center gap-2 py-3 px-2 bg-(--danger) text-on-primary rounded-lg shadow-lg hover:bg-(--danger)/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed!">
        <BaseSpinner v-if="deleteLoading === 'deleteSelected'" class="size-4" />
        <Trash v-else :size="18" />
        <p class="text-xs font-semibold">Hapus Terpilih ({{ selectedCommentIds.length }})</p>
      </button>
      <button @click="handleMarkAsSafe" :disabled="judolResults.length === 0 || selectedCommentIds.length === 0"
        class="flex-1 w-full flex justify-center items-center gap-2 py-3 px-2 bg-primary text-on-primary rounded-lg shadow-lg hover:bg-primary/80 transition-colors duration-180 disabled:opacity-50 disabled:cursor-not-allowed!">
        <BaseSpinner v-if="markAsSafeLoading" class="size-4" />
        <BadgeCheck v-else :size="18" />
        <p class="text-xs font-semibold">Tandai Aman ({{ selectedCommentIds.length }})</p>
      </button>
    </div>
    <div class="flex items-start w-full p-4 bg-primary/5 rounded-lg border border-(--outline) gap-4 mb-2">
      <div>
        <Info :size="20" class="text-primary" />
      </div>
      <div class="w-full flex flex-col text-(--foreground) gap-1 -mt-1">
        <p class="text-justify">
          AI membantu mendeteksi komentar yang terindikasi promosi judi online sehingga Anda dapat meninjau dan
          memoderasinya dengan lebih cepat.
        </p>
      </div>
    </div>
  </div>
</template>
