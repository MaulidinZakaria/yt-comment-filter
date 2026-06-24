<script setup lang="ts">
import { onMounted } from "vue";

import Navbar from "@/components/Navbar.vue";

import RolePage from "@/pages/RolePage.vue";
import ViewerPage from "@/pages/ViewerPage.vue";
import OwnerPage from "@/pages/OwnerPage.vue";

import { useRole } from "@/composables/useRole";
import { Role } from "@/types";
import ConfirmModal from "@/components/ConfirmModal.vue";
import Toast from "@/components/Toast.vue";

const {
  role,
  loadRole,
  setRole,
} = useRole();

onMounted(loadRole);

const handleSelectRole = async (role: Role) => {
  await setRole(role);
};
</script>

<template>
  <Toast />
  <ConfirmModal />
  <Navbar :role @select-role="handleSelectRole" />

  <Transition name="page" mode="out-in">
    <RolePage v-if="role === 'role'" key="role" @select-role="handleSelectRole" />

    <ViewerPage v-else-if="role === 'viewer'" key="viewer" />

    <OwnerPage v-else-if="role === 'owner'" key="owner" />
  </Transition>
</template>