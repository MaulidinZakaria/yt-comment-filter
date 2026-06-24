<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onConfirm } from "@/shared/confirm";

const show = ref(false);

const title = ref("");
const message = ref("");

const confirmText = ref("Hapus");
const cancelText = ref("Batal");
const type = ref<"success" | "error" | "info" | "warning">("info");

let resolver: ((value: boolean) => void) | null = null;

const handleConfirm = () => {
    resolver?.(true);
    show.value = false;
};

const handleCancel = () => {
    resolver?.(false);
    show.value = false;
};

onMounted(() => {
    onConfirm((payload, resolve) => {
        title.value = payload.title;
        message.value = payload.message;

        confirmText.value = payload.confirmText ?? "Ya";
        cancelText.value = payload.cancelText ?? "Batal";
        type.value = payload.type ?? "info"

        resolver = resolve;

        show.value = true;
    });
});
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="fixed inset-0 z-9999 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/50" @click="handleCancel" />
            <div class="relative w-[90%] max-w-sm rounded-lg bg-(--surface) border border-(--outline) shadow-xl p-5">
                <h3 class="text-base font-bold text-(--foreground)">
                    {{ title }}
                </h3>

                <p class="mt-2 text-sm text-(--foreground)/70">
                    {{ message }}
                </p>

                <div class="mt-5 flex justify-end gap-2">
                    <button @click="handleCancel" class="px-3 py-2 rounded-md border border-(--outline)">
                        {{ cancelText }}
                    </button>

                    <button @click="handleConfirm" class="px-3 py-2 rounded-md" :class="{
                        'bg-(--success) text-(--success-foreground)': type === 'success',
                        'bg-(--danger) text-(--danger-foreground)': type === 'error',
                        'bg-(--warning) text-(--warning-foreground)': type === 'warning',
                        'bg-primary text-white': type === 'info',
                    }">
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>