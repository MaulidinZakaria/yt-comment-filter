<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Info, ShieldCheck } from "lucide-vue-next";
import { getSettings, saveSettings } from "@/content/storage";
import { useCommentStats } from '@/composables/useCommentStats';
import { useVideoMetadata } from '@/composables/useVideoMetadata';

const {
  video,
  loadVideoMetadata,
} = useVideoMetadata();

const filterMode = ref<
  "hideWithText" | "showWithLabel"
>("showWithLabel");

const isEnabled = ref<boolean>(true);
const { judolCount, scannedCount, loading } = useCommentStats();

onMounted(async () => {
  await loadVideoMetadata();

  const settings = await getSettings();

  filterMode.value = settings.filterMode;
  isEnabled.value = settings.isEnabled;
});

watch(filterMode, async (value) => {
  await saveSettings({
    filterMode: value,
    isEnabled: isEnabled.value,
  });

  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: "setMode",
        filterMode: value,
      });
    }
  );
});

watch(isEnabled, async (value) => {
  await saveSettings({
    isEnabled: value,
    filterMode: filterMode.value,
  });

  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, {
        action: "setMode",
        isEnabled: value,
      });
    }
  );

});

const percentage = computed(() => {
  if (scannedCount.value === 0) return 0;

  const nonJudolCount = scannedCount.value - judolCount.value;

  return (nonJudolCount / scannedCount.value) * 100;
});

const donutStyle = computed(() => ({
  background: `conic-gradient(
    var(--color-primary) ${percentage.value}%,
    var(--surface-container-high) ${percentage.value}% 100%
  )`,
}));

</script>

<template>
  <div class="p-4 mb-2 flex flex-col gap-4 justify-center items-start">
    <div class="flex flex-col">
      <p class="text-(--foreground) font-bold text-xl">Viewer Mode</p>
      <p class="text-(--foreground)/80">Pantau dan kelola filter komentar saat menonton video.</p>
    </div>
    <div
      class="flex flex-col justify-center items-center w-full p-4 bg-(--surface) shadow-md rounded-lg border border-(--outline) gap-4">
      <div class="w-full flex items-center justify-between border-b border-(--outline) gap-4 pb-4">
        <div class="w-20 h-12 rounded-sm shrink-0 flex items-center justify-center bg-(--surface-container)">
          <img v-if="video?.videoId" :src="video.thumbnail" class="w-full h-full rounded-sm object-cover" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" class="w-14">
            <path
              d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.5v-7L16 12l-6.4 3.5z" />
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-(--foreground) truncate">
            {{ video?.videoId ? video.title : "Tidak ada video aktif" }}
          </p>

          <p class="text-xs text-(--foreground)/70" :class="{ truncate: video?.videoId }">
            {{
              video?.videoId
                ? video.channelName
                : "Buka halaman video YouTube untuk melihat informasi video"
            }}
          </p>
        </div>
      </div>
      <div class="flex items-center justify-between w-full gap-4">
        <div class="flex flex-col text-(--foreground)">
          <p class="text-sm font-medium">Hasil Pemindaian</p>
          <span>
            <div v-if="loading" class="flex justify-center items-center gap-3 py-2">
              <span class="relative flex size-3">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75 [animation-duration:1.5s]"></span>

                <span class="relative inline-flex size-3 rounded-full bg-primary"></span>
              </span>

              <p class="text-xl font-semibold text-primary animate-pulse [animation-duration:1.5s]">
                Memindai...
              </p>
            </div>
            <p v-else>
              <span class="text-4xl font-semibold text-primary">{{ judolCount }}</span>
              <span class="text-base">/ {{ scannedCount }}</span>
            </p>
          </span>
          <p>Komentar terindikasi judol</p>
        </div>
        <div class="relative w-15 h-15 rounded-full flex items-center justify-center" :style="donutStyle">
          <div class="absolute inset-1.5 rounded-full bg-(--surface)" />

          <ShieldCheck :size="26" class="relative z-10 text-primary" />
        </div>
      </div>
    </div>
    <div
      class="flex items-center justify-between w-full p-4 bg-(--surface) shadow-md rounded-lg border border-(--outline) gap-4">
      <div class="flex flex-col text-(--foreground)">
        <p class="text-sm font-medium">Aktifkan Filter</p>
        <p>Moderasi otomatis berbasis AI</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" class="peer sr-only" v-model="isEnabled" />

        <div class="
        w-11 h-6
        rounded-full
        bg-gray-300
        transition-colors

        peer-checked:bg-primary

        after:content-['']
        after:absolute
        after:top-0.5
        after:left-0.5
        after:h-5
        after:w-5
        after:rounded-full
        after:bg-white
        after:transition-transform

        peer-checked:after:translate-x-5
      "></div>
      </label>
    </div>
    <p class="text-lg font-medium text-(--foreground)/80">Opsi Tampilan</p>
    <div class="flex flex-col gap-4 w-full">
      <label for="filter-hide" class="
      flex items-center gap-3
      p-4
      bg-(--surface)
      border border-(--outline)
      rounded-lg
      shadow-sm
      cursor-pointer
      transition-all duration-200

      hover:-translate-y-0.5
      hover:shadow-md
      hover:border-primary
    " :class="filterMode === 'hideWithText' ? 'border-primary bg-primary/5' : 'border-(--outline)'">
        <input v-model="filterMode" id="filter-hide" type="radio" name="filterMode" value="hideWithText" class="
        h-4 w-4
        accent-primary
      " />

        <div class="flex flex-col">
          <span class="text-sm font-medium text-(--foreground)">
            Sembunyikan Komentar
          </span>
          <span class="text-xs text-(--foreground-muted)">
            Komentar terindikasi akan disembunyikan dan diganti dengan pesan peringatan.
          </span>
        </div>
      </label>

      <label for="filter-label" class="
      flex items-center gap-3
      p-4
      bg-(--surface)
      border border-(--outline)
      rounded-lg
      shadow-sm
      cursor-pointer
      transition-all duration-200

      hover:-translate-y-0.5
      hover:shadow-md
      hover:border-primary
    " :class="filterMode === 'showWithLabel' ? 'border-primary bg-primary/5' : 'border-(--outline)'">
        <input v-model="filterMode" id="filter-label" type="radio" name="filterMode" value="showWithLabel" checked
          class="
        h-4 w-4
        accent-primary
      " />

        <div class="flex flex-col">
          <span class="text-sm font-medium text-(--foreground)">
            Tampilkan dengan Peringatan
          </span>
          <span class="text-xs text-(--foreground-muted)">
            Komentar tetap ditampilkan dengan label peringatan.
          </span>
        </div>
      </label>
    </div>
    <div class="flex items-start w-full p-4 bg-primary/5 rounded-lg border border-(--outline) gap-4">
      <div>
        <Info :size="20" class="text-primary" />
      </div>
      <div class="w-full flex flex-col text-(--foreground) gap-1 -mt-1">
        <p class="text-justify">
          AI membantu mendeteksi komentar yang terindikasi promosi judi online untuk menciptakan pengalaman menonton
          yang lebih nyaman.
        </p>
      </div>
    </div>
  </div>
</template>
