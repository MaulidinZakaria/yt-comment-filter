<script setup lang="ts">
interface Props {
    stat: {
        label: string,
        value: number,
        subtitle: string,
        color: string,
        bgClass: string,
        borderClass: string
    };
    loading: boolean;
}

const {
    stat,
    loading,
} = defineProps<Props>();
</script>
<template>
    <div :key="stat.label" class="flex flex-col rounded-lg p-3 items-start justify-center border shadow-sm"
        :class="`${stat.bgClass} ${stat.borderClass}`">
        <p class="text-sm font-medium" :class="`text-${stat.color}`">
            {{ stat.label }}
        </p>
        <svg v-if="loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="size-8"
            :class="`text-${stat.color}`">
            <circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="40" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
            </circle>
            <circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="100" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
            </circle>
            <circle fill="currentColor" stroke="currentColor" stroke-width="15" r="15" cx="160" cy="100">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
            </circle>
        </svg>
        <p v-else class="text-2xl font-bold" :class="`text-${stat.color}`">
            {{ stat.value }}
        </p>
        <p class="text-xs text-(--foreground) mt-1">
            {{ stat.subtitle }}
        </p>
    </div>
</template>