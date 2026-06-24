<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { onToast } from "@/shared/toast";
import {
  CircleCheck,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
} from "lucide-vue-next";

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
};

const show = ref(false);
const title = ref("");
const message = ref("");
const type = ref<"success" | "error" | "info" | "warning">("info");

const currentIcon = computed(() => icons[type.value]);

let timeout: any;

onMounted(() => {
  onToast((payload) => {
    title.value = payload.title
    message.value = payload.message;
    type.value = payload.type ?? "info";
    show.value = true;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      show.value = false;
    }, payload.duration ?? 2000);
  });
});

const closeToast = () => {
  show.value = false;

  clearTimeout(timeout);
};
</script>

<template>
  <transition name="fade">
    <div v-if="show"
      class="fixed left-1/2 top-4 -translate-x-1/2 w-[80%] px-4 py-3 rounded-md shadow-lg text-sm z-9999 flex items-center gap-3"
      :class="{
        'bg-(--success) text-(--success-foreground)': type === 'success',
        'bg-(--danger) text-(--danger-foreground)': type === 'error',
        'bg-(--warning) text-(--warning-foreground)': type === 'warning',
        'bg-primary text-white': type === 'info',
      }">
      <div class="flex-none text-center">
        <component :is="currentIcon" :size="24" />
      </div>
      <div class="flex flex-col flex-1">
        <p class="text-xs font-bold">{{ title }}</p>
        <p class="text-xs">{{ message }}</p>
      </div>
      <button type="button" @click="closeToast"
        class="flex-none p-1 rounded hover:bg-white/10 transition-all cursor-pointer">
        <X :size="18" />
      </button>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>