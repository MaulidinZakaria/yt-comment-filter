<script setup lang="ts">
import { computed } from "vue";
import { Search } from "lucide-vue-next";
import { formatDate } from "@/utils/format-date";
import { YoutubeVideo } from "@/types";

interface Props {
    videos: YoutubeVideo[];
    selectedVideoId: string;
    loading: boolean;
    search: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:search": [value: string];
    select: [video: YoutubeVideo];
}>();

const filteredVideos = computed(() =>
    props.videos.filter((video) =>
        video.title
            .toLowerCase()
            .includes(props.search.toLowerCase()),
    ),
);

const handleSearch = (event: Event) => {
    emit(
        "update:search",
        (event.target as HTMLInputElement).value,
    );
};

const handleSelectedVideo = (
    video: YoutubeVideo,
) => {
    emit("select", video);
};
</script>
<template>
    <div class="flex flex-col gap-3 w-full">
        <p class="text-lg font-medium text-(--foreground)/80">
            Pilih Video
        </p>

        <!-- Search -->
        <div
            class="flex items-center gap-2 w-full bg-(--surface-container) rounded-md px-3 py-2 border border-(--outline)">
            <Search :size="16" class="text-(--foreground)/60" />

            <input :value="search" @input="handleSearch" type="text" placeholder="Cari video..."
                class="flex-1 bg-transparent outline-none text-sm text-(--foreground)" />
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col gap-2">
            <div v-for="n in 3" :key="n"
                class="flex items-center gap-3 p-2 rounded-md border border-(--outline) animate-pulse">
                <div class="w-20 h-12 rounded-sm bg-(--surface-container-high)" />

                <div class="flex-1">
                    <div class="h-4 w-3/4 rounded bg-(--surface-container-high) mb-2" />

                    <div class="h-3 w-1/3 rounded bg-(--surface-container-high)" />
                </div>
            </div>
        </div>

        <!-- Video List -->
        <div v-else class="flex flex-col gap-2 max-h-54 overflow-y-auto">
            <div v-for="video in filteredVideos" :key="video.videoId" :id="`video-${video.videoId}`"
                @click="handleSelectedVideo(video)" :class="[
                    'flex items-center gap-3 p-2 rounded-md border cursor-pointer transition-all duration-200 bg-(--surface) hover:shadow-md hover:border-primary',
                    selectedVideoId === video.videoId
                        ? 'border-primary bg-primary/10 dark:bg-primary/5 border-2'
                        : 'border-(--outline) hover:bg-(--surface-container)'
                ]">
                <img :src="video.thumbnail" class="w-20 h-12 rounded-sm object-cover shrink-0" />

                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-(--foreground) truncate">
                        {{ video.title }}
                    </p>

                    <p class="text-xs text-(--foreground)/70">
                        {{ formatDate(video.publishedAt) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>