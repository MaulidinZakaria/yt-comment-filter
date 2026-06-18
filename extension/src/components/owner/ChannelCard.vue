<script setup lang="ts">
import { YoutubeChannel } from '@/types';
import BaseSpinner from '../BaseSpinner.vue';
import { CircleUser, LogOut } from 'lucide-vue-next';

interface Props {
    channel: YoutubeChannel;
    loading: string | null;
}

const {
    channel,
    loading,
} = defineProps<Props>();

const emit = defineEmits<{
    logout: [];
}>();
</script>
<template>
    <div
        class="flex flex-col items-center justify-center w-full p-4 bg-(--surface) shadow-md rounded-lg border border-(--outline) gap-4">
        <div class="p-3 bg-primary rounded-full text-on-primary">
            <CircleUser :size="28" />
        </div>
        <div class="flex flex-col items-center justify-center px-8">
            <p class="text-base font-medium">{{ channel.channelName }}</p>
            <p class="text-center text-(--foreground)/80"> {{ channel.channelUsername }}</p>
        </div>
        <button @click="emit('logout')" :disabled="loading !== null"
            class="w-full flex justify-center items-center gap-2 p-3 bg-(--danger)/20 text-(--danger) rounded-lg  shadow-sm hover:bg-(--danger)/30 hover:shadow-md transition-colors duration-200">
            <LogOut v-if="loading !== 'logout'" :size="20" />
            <BaseSpinner v-else class="size-5" />
            <p class="text-sm font-semibold">{{ loading === "logout" ? "Logging Out..." : "Log Out" }}</p>
        </button>
    </div>
</template>