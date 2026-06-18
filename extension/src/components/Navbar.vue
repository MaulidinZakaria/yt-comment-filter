<script setup lang="ts">
import { Users, Moon, Sun } from "lucide-vue-next";
import { onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
import { Role } from "@/types";

const {
    isDark,
    loadTheme,
    toggleTheme,
} = useTheme();

const emit = defineEmits<{
    (e: "select-role", role: Role): void;
}>();

defineProps({
    role: String,
})

const goToRolePage = () => {
    emit("select-role", 'role');
};

onMounted(loadTheme);

</script>

<template>
    <div class="flex justify-between items-center border-b border-(--outline) py-3 px-4 shadow-sm">
        <div class="flex justify-center items-center gap-2">
            <img src="../../icon.png" class="size-8">
            <p class="text-(--foreground) font-bold text-base">CommentShield AI</p>
        </div>
        <div class="flex justify-center items-center gap-4">
            <button @click="goToRolePage" v-if="role != 'role'"
                class="cursor-pointer text-(--foreground) hover:text-primary transition-all duration-200"
                title="Pilih Role">
                <Users :size="18" />
            </button>
            <button @click="toggleTheme"
                class="cursor-pointer text-(--foreground) hover:text-primary transition-all duration-200"
                title="Ganti Tema">
                <Sun v-if="isDark" :size="18" />
                <Moon v-else :size="18" />
            </button>
        </div>
    </div>
</template>