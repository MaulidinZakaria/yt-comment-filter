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
      await chrome.storage.session.get([
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
    color: "primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
  },
  {
    label: "Normal",
    value: normalCount.value,
    subtitle: "Aman",
    color: "(--success)",
    bgClass: "bg-(--success)/10",
    borderClass: "border-(--success)/20",
  },
  {
    label: "Judol",
    value: judolCount.value,
    subtitle: "Indikasi",
    color: "(--danger)",
    bgClass: "bg-(--danger)/10",
    borderClass: "border-(--danger)/20",
  },
]);

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

  await chrome.storage.session.set({
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
  exportJudolCsv(
    results.value,
    selectedVideoTitle.value,
  );
};

/**
 * SELECTION
 */
const toggleSelectAll = () => {
  const allSelected =
    selectedCommentIds.value.length ===
    judolResults.value.length;

  if (allSelected) {
    selectedCommentIds.value = [];
    return;
  }

  selectedCommentIds.value =
    judolResults.value.map(
      (item) => item.commentId,
    );
};

/**
 * DELETE
 */
const handleDeleteSelected =
  async () => {
    const count =
      selectedCommentIds.value.length;

    const confirmed = confirm(
      `Hapus ${count} komentar?`,
    );

    if (!confirmed) {
      return;
    }

    const result =
      await deleteComments(
        selectedCommentIds.value,
        "deleteSelected",
      );

    if (!result.success) {
      return;
    }

    results.value = results.value.filter(
      (item) =>
        !selectedCommentIds.value.includes(
          item.commentId,
        ),
    );

    selectedCommentIds.value = [];
  };

const handleDeleteAll =
  async () => {
    const commentIds =
      judolResults.value.map(
        (item) => item.commentId,
      );

    const confirmed = confirm(
      `Hapus ${commentIds.length} komentar judol?`,
    );

    if (!confirmed) {
      return;
    }

    const result =
      await deleteComments(
        commentIds,
        "deleteAll",
      );

    if (!result.success) {
      return;
    }

    results.value = results.value.filter(
      (item) =>
        item.prediction !== "judol",
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
      <button @click="connectYoutube" :disabled="loading !== null"
        class="w-full flex justify-center items-center gap-2 p-3 bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary/80 hover:shadow-md transition-colors duration-200">
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
    <CommentResultTable :scan-loading="scanLoading" :has-scanned="hasScanned" :judol-results="judolResults"
      :selected-comment-ids="selectedCommentIds" @update:selectedCommentIds="
        selectedCommentIds = $event
        " @toggleSelectAll="toggleSelectAll" />
    <div class="w-full flex gap-3 justify-center items-center">
      <button @click="handleDeleteSelected" :disabled="judolResults.length === 0 || selectedCommentIds.length === 0"
        class="flex-1 w-full flex justify-center items-center gap-2 py-3 px-2 bg-(--danger) text-on-primary rounded-lg shadow-lg hover:bg-(--danger)/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed!">
        <BaseSpinner v-if="deleteLoading === 'deleteSelected'" class="size-4" />
        <Trash v-else :size="18" />
        <p class="text-xs font-semibold">Hapus Terpilih ({{ selectedCommentIds.length }})</p>
      </button>
      <button @click="handleDeleteSelected" :disabled="judolResults.length === 0 || selectedCommentIds.length === 0"
        class="flex-1 w-full flex justify-center items-center gap-2 py-3 px-2 bg-primary text-on-primary rounded-lg shadow-lg hover:bg-primary/80 transition-colors duration-180 disabled:opacity-50 disabled:cursor-not-allowed!">
        <BaseSpinner v-if="deleteLoading === 'deleteSelected'" class="size-4" />
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
