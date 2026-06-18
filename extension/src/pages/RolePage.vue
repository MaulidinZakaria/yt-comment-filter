<script setup lang="ts">
import { ref } from 'vue'
import { Crown, CircleUserRound, Info, ArrowRight } from "lucide-vue-next";
import { Role } from '@/types';

const emit = defineEmits<{
  (e: "select-role", role: Role): void;
}>();

defineProps({
  msg: String,
})

const selectedRole = ref<Role>("viewer");

const handleContinue = () => {
  emit("select-role", selectedRole.value);
};

</script>

<template>
  <div class="p-4 mb-2 flex flex-col gap-6 justify-center items-start">
    <div class="flex flex-col">
      <p class="text-(--foreground) font-bold text-xl">Pilih Peran Anda</p>
      <p class="text-(--foreground)/80">Pilih peran untuk menyesuaikan fitur dan pengaturan yang tersedia.</p>
    </div>
    <ul class="select-none grid w-full gap-4 grid-cols-2">
      <li>
        <input v-model="selectedRole" type="radio" id="viewer-option" value="viewer" name="role" class="hidden peer"
          checked />

        <label for="viewer-option" class="
        flex flex-col items-center justify-center
        w-full p-5 gap-3
        bg-(--surface)
        border border-(--outline)
        rounded-lg
        cursor-pointer

        transition-all duration-200

        hover:-translate-y-1
        hover:shadow-lg
        hover:border-primary

        peer-checked:border-primary
        peer-checked:border-2
        peer-checked:bg-primary/5
      ">
          <div class="
          p-2
          bg-primary/10
          rounded-full
          text-primary
        ">
            <CircleUserRound :size="30" />
          </div>

          <p class="font-medium text-sm text-(--foreground)">
            Viewer Mode
          </p>
        </label>
      </li>

      <li>
        <input v-model="selectedRole" type="radio" id="owner-option" value="owner" name="role" class="hidden peer" />

        <label for="owner-option" class="
        flex flex-col items-center justify-center
        w-full p-5 gap-3
        bg-(--surface)
        border border-(--outline)
        rounded-lg
        cursor-pointer

        transition-all duration-200

        hover:-translate-y-1
        hover:shadow-lg
        hover:border-primary

        peer-checked:border-primary
        peer-checked:border-2
        peer-checked:bg-primary/5
      ">
          <div class="
          p-2
          bg-primary/10
          rounded-full
          text-primary
        ">
            <Crown :size="30" />
          </div>

          <p class="font-medium text-sm text-(--foreground)">
            Owner Mode
          </p>
        </label>
      </li>
    </ul>
    <div class="flex items-start w-full p-4 bg-primary/5 rounded-lg border border-(--outline) gap-4">
      <div>
        <Info :size="20" class="text-primary" />
      </div>
      <div class="flex flex-col text-(--foreground) gap-1 -mt-1">
        <p class="text-sm font-medium">Tentang Peran</p>
        <p class="text-justify">Viewer Mode untuk menyaring komentar saat menonton, sedangkan Owner Mode untuk memoderasi komentar pada video Anda.</p>
      </div>
    </div>

    <button @click="handleContinue"
      class="mt-20 w-full flex justify-center items-center gap-2 p-3 bg-primary rounded-lg shadow-lg text-on-primary hover:bg-primary/70 transition-all duration-200">
      <p class="text-base font-semibold">Lanjutkan</p>
      <ArrowRight :size="24" />
    </button>
  </div>
</template>
