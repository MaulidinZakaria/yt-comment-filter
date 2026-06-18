<script setup lang="ts">
import { ScanResult } from '@/types';
import { computed } from 'vue';

interface Props {
    scanLoading: boolean;
    hasScanned: boolean;
    judolResults: ScanResult[];
    selectedCommentIds: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "update:selectedCommentIds": [string[]];
    toggleSelectAll: [];
}>();

const isAllSelected = computed(() => {
    return (
        props.judolResults.length > 0 &&
        props.selectedCommentIds.length ===
        props.judolResults.length
    );
});

const updateSelected = (
    event: Event,
    commentId: string,
) => {
    const checked = (
        event.target as HTMLInputElement
    ).checked;

    let updated = [
        ...props.selectedCommentIds,
    ];

    if (checked) {
        if (!updated.includes(commentId)) {
            updated.push(commentId);
        }
    } else {
        updated = updated.filter(
            (id) => id !== commentId,
        );
    }

    emit(
        "update:selectedCommentIds",
        updated,
    );
};
</script>

<template>
    <div class="w-full overflow-hidden rounded-lg border border-(--outline) bg-(--surface) shadow-sm">
        <div class="max-h-96 overflow-y-auto">
            <table class="w-full table-fixed">
                <thead class="sticky top-0 z-10">
                    <tr class="border-b border-(--outline) bg-(--surface-container)">
                        <th class="w-14 px-4 py-3 text-center text-xs font-semibold text-(--foreground-muted)">
                            <input type="checkbox" :checked="isAllSelected" @change="emit('toggleSelectAll')" />
                        </th>

                        <th class="px-4 py-3 text-left text-xs font-semibold text-(--foreground-muted)">
                            Komentar
                        </th>

                        <th class="w-24 px-4 py-3 text-center text-xs font-semibold text-(--foreground-muted)">
                            AI Score
                        </th>
                    </tr>
                </thead>

                <tbody v-if="scanLoading">
                    <tr>
                        <td colspan="3" class="px-4 py-8">
                            <div class="flex flex-col items-center gap-3">
                                <div
                                    class="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />

                                <p class="text-xs text-(--foreground)">
                                    Memindai komentar...
                                </p>
                            </div>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="judolResults.length > 0">
                    <tr v-for="item in judolResults" :key="item.commentId"
                        class="border-b border-(--outline) hover:bg-(--surface-container) transition-colors">
                        <td class="px-4 py-3 text-center">
                            <input type="checkbox" :checked="selectedCommentIds.includes(
                                item.commentId
                            )
                                " @change="
                                    updateSelected(
                                        $event,
                                        item.commentId
                                    )
                                    " />
                        </td>

                        <td class="px-4 py-3 text-xs text-(--foreground) truncate">
                            {{ item.commentText }}
                        </td>

                        <td class="px-4 py-3 text-center">
                            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium" :class="item.score > 0.9
                                ? 'text-(--danger) bg-(--danger)/20'
                                : 'text-(--warning) bg-(--warning)/20'
                                ">
                                {{
                                    (
                                        item.score * 100
                                    ).toFixed(2)
                                }}%
                            </span>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="hasScanned">
                    <tr>
                        <td colspan="3" class="px-4 py-3 text-xs text-center">
                            Tidak ditemukan komentar judol 🎉
                        </td>
                    </tr>
                </tbody>

                <tbody v-else>
                    <tr>
                        <td colspan="3" class="px-4 py-3 text-xs text-center">
                            Belum ada hasil pemindaian komentar
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="judolResults.length > 0"
            class="border-t border-(--outline) bg-(--surface-container) px-4 py-3 text-xs font-medium text-center text-(--foreground-muted)">
            Menampilkan
            {{ judolResults.length }}
            komentar judol
        </div>
    </div>
</template>